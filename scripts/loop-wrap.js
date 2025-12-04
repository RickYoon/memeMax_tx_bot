import 'dotenv/config';
import { ethers } from 'ethers';

const {
  RPC_URL,
  PRIVATE_KEY,
  WETH_ADDRESS = '0x653e645e3d81a72e71328Bc01A04002945E3ef7A',
  TARGET_SPEND_ETH = '10',
  AMOUNT_PER_TX_ETH = '1',
  CONFIRMATIONS = '1',
  MAX_FEE_PER_GAS_GWEI,
  MAX_PRIORITY_FEE_PER_GAS_GWEI,
} = process.env;

const MEMECORE_CHAIN_ID = 4352n;

const WETH_ABI = [
  'function deposit() payable',
  'function withdraw(uint256 wad)',
  'function balanceOf(address) view returns (uint256)',
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requireEnv(name, value) {
  if (!value || String(value).trim() === '') {
    throw new Error(`환경 변수 ${name}가 설정되지 않았습니다.`);
  }
}

async function assertNetwork(provider) {
  const net = await provider.getNetwork();
  if (net.chainId !== MEMECORE_CHAIN_ID) {
    throw new Error(
      `연결된 체인의 chainId가 ${net.chainId}입니다. MemeCore Mainnet(4352)과 다릅니다. RPC_URL을 확인하세요.`
    );
  }
}

async function main() {
  requireEnv('RPC_URL', RPC_URL);
  requireEnv('PRIVATE_KEY', PRIVATE_KEY);
  requireEnv('WETH_ADDRESS', WETH_ADDRESS);

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  await assertNetwork(provider);

  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const weth = new ethers.Contract(WETH_ADDRESS, WETH_ABI, wallet);

  const targetSpendWei = ethers.parseEther(TARGET_SPEND_ETH);
  const amountPerTxWei = ethers.parseEther(AMOUNT_PER_TX_ETH);
  const confirmations = Number(CONFIRMATIONS || '1');

  const txOverrides = {};
  if (MAX_FEE_PER_GAS_GWEI) {
    txOverrides.maxFeePerGas = ethers.parseUnits(MAX_FEE_PER_GAS_GWEI, 'gwei');
  }
  if (MAX_PRIORITY_FEE_PER_GAS_GWEI) {
    txOverrides.maxPriorityFeePerGas = ethers.parseUnits(
      MAX_PRIORITY_FEE_PER_GAS_GWEI,
      'gwei'
    );
  }

  console.log('==============================================');
  console.log('MemeCore Wrap/Unwrap Runner');
  console.log('Network RPC:', RPC_URL);
  console.log('Account:', wallet.address);
  console.log('WETH Address:', WETH_ADDRESS);
  console.log('Target gas spend:', ethers.formatEther(targetSpendWei), 'ETH');
  console.log('Amount per cycle:', ethers.formatEther(amountPerTxWei), 'ETH');
  console.log('Confirmations:', confirmations);
  if (txOverrides.maxFeePerGas || txOverrides.maxPriorityFeePerGas) {
    console.log(
      'EIP-1559:',
      txOverrides.maxFeePerGas
        ? `${ethers.formatUnits(txOverrides.maxFeePerGas, 'gwei')} gwei maxFee`
        : 'auto',
      '|',
      txOverrides.maxPriorityFeePerGas
        ? `${ethers.formatUnits(txOverrides.maxPriorityFeePerGas, 'gwei')} gwei priority`
        : 'auto'
    );
  } else {
    console.log('EIP-1559: auto');
  }
  console.log('==============================================');

  let gasSpentWei = 0n;
  let cycle = 0;

  while (gasSpentWei < targetSpendWei) {
    cycle += 1;
    console.log(`\n[Cycle ${cycle}]`);

    // 현재 잔액 체크(값+가스 대비)
    const ethBalance = await provider.getBalance(wallet.address);
    if (ethBalance < amountPerTxWei) {
      throw new Error(
        `ETH 잔액이 부족합니다. 잔액: ${ethers.formatEther(
          ethBalance
        )}, 필요 최소: ${ethers.formatEther(amountPerTxWei)}`
      );
    }

    // 1) Wrap (deposit)
    let depositRcpt;
    try {
      const depositTx = await weth.deposit({
        value: amountPerTxWei,
        ...txOverrides,
      });
      console.log('Deposit sent:', depositTx.hash);
      depositRcpt = await depositTx.wait(confirmations);
    } catch (err) {
      console.error('Deposit 실패:', err?.message || err);
      // 일시적 오류시 짧은 대기 후 재시도
      await sleep(2000);
      continue;
    }
    const depGasUsed = ethers.toBigInt(depositRcpt.gasUsed);
    const depEffGasPrice = depositRcpt.effectiveGasPrice != null
      ? ethers.toBigInt(depositRcpt.effectiveGasPrice)
      : (depositRcpt.gasPrice != null ? ethers.toBigInt(depositRcpt.gasPrice) : 0n);
    const depCost = depGasUsed * depEffGasPrice;
    gasSpentWei += depCost;
    console.log(
      `Deposit confirmed | gas: ${ethers.formatEther(
        depCost
      )} ETH | cumulative: ${ethers.formatEther(gasSpentWei)} ETH`
    );

    // 2) Unwrap (withdraw)
    let withdrawRcpt;
    try {
      const withdrawTx = await weth.withdraw(amountPerTxWei, {
        ...txOverrides,
      });
      console.log('Withdraw sent:', withdrawTx.hash);
      withdrawRcpt = await withdrawTx.wait(confirmations);
    } catch (err) {
      console.error('Withdraw 실패:', err?.message || err);
      // 안전을 위해 다음 루프로 진행(필요시 수동 복구)
      await sleep(2000);
      continue;
    }
    const wdGasUsed = ethers.toBigInt(withdrawRcpt.gasUsed);
    const wdEffGasPrice = withdrawRcpt.effectiveGasPrice != null
      ? ethers.toBigInt(withdrawRcpt.effectiveGasPrice)
      : (withdrawRcpt.gasPrice != null ? ethers.toBigInt(withdrawRcpt.gasPrice) : 0n);
    const wdCost = wdGasUsed * wdEffGasPrice;
    gasSpentWei += wdCost;
    console.log(
      `Withdraw confirmed | gas: ${ethers.formatEther(
        wdCost
      )} ETH | cumulative: ${ethers.formatEther(gasSpentWei)} ETH`
    );

    // RPC 과열 방지
    await sleep(1500);
  }

  console.log(
    `\n완료. 총 가스 소모: ${ethers.formatEther(gasSpentWei)} ETH (목표: ${ethers.formatEther(
      targetSpendWei
    )} ETH)`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


