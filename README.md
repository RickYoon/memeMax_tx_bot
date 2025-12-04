## MemeCore Wrap/Unwrap 루프 러너

MemeCore Mainnet(Chain ID 4352)에서 지정한 금액으로 WETH 호환 컨트랙트를 wrap/unwrap 반복하며, 목표 가스 소모량에 도달할 때까지 실행합니다.

### 요구 사항

- Node.js 18+
- npm

### 설치

```bash
npm install
```

### 환경 변수 설정

1. `env copy.example`를 복사해 `.env` 파일을 생성하고 값을 채웁니다.

```bash
cp "env copy.example" .env
```

필수

- `RPC_URL`: `https://rpc.memecore.net/`
- `PRIVATE_KEY`: 실행 지갑 프라이빗 키
- `WETH_ADDRESS`: `0x653e645e3d81a72e71328Bc01A04002945E3ef7A`

옵션

- `TARGET_SPEND_ETH`(기본 10): 총 가스 소모 목표(ETH)
- `AMOUNT_PER_TX_ETH`(기본 1): 1회 wrap/unwrap 금액(ETH)
- `CONFIRMATIONS`(기본 1): 확정 대기 블록 수
- `MAX_FEE_PER_GAS_GWEI`, `MAX_PRIORITY_FEE_PER_GAS_GWEI`: 가스 상한/우선순위 설정

### 실행

```bash
npm start
```

### 주의

- wrap/unwrap 자체로 원금은 돌아오고, 가스비가 계속 소모됩니다. 목표치(예: 10 ETH)를 메인넷에서 소모하면 실제로 큰 비용이 들어갑니다.
- RPC, 프라이빗 키, 컨트랙트 주소가 정확한지 반드시 확인하세요.
- 오류 발생 시 스크립트는 다음 루프로 넘어가도록 설계되어 있습니다. 연속 오류 시 중단하고 환경을 점검하세요.

### GitHub 공개 가이드

민감정보(.env 등)를 제외하고 안전하게 공개하려면 아래 순서를 따르세요.

1. `.gitignore`가 다음을 포함하는지 확인(.env, node_modules 등)
   - 이미 저장소에 포함되어 있음. `.env`가 추적되지 않아야 합니다.
2. Git 초기화 및 첫 커밋

```bash
git init
git add .
git commit -m "init: memeCore wrap/unwrap runner"
```

3. 혹시 과거에 `.env`가 추가됐다면 캐시에서 제거

```bash
git rm --cached .env || true
```

4. 원격 저장소 추가 후 푸시

```bash
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

5. 공개 전 체크리스트

- [.env] 파일이 Git에 포함되어 있지 않은지
- 개인 키, RPC 키, 기타 비밀이 코드/README/스크린샷에 노출되지 않았는지
- 실행 방법(설치, 환경변수, 명령)이 README에 정리되어 있는지
