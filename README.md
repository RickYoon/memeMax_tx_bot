## MemeCore Wrap/Unwrap 루프 러너

MemeCore Mainnet(Chain ID 4352)에서 지정한 금액으로 WETH 호환 컨트랙트를 wrap/unwrap 반복하며, 목표 가스 소모량에 도달할 때까지 실행합니다.

초보자도 바로 따라 할 수 있도록 Node.js 설치부터 실행, GitHub 업로드까지 단계별로 안내합니다.

### 요구 사항

- Node.js 18+
- npm

### 설치

```bash
npm install
```

### Node.js가 처음이라면(설치 방법)

- 공식 사이트에서 LTS 버전 설치: https://nodejs.org/
- 설치 후 터미널(명령 프롬프트)에서 버전 확인:

```bash
node -v
npm -v
```

버전이 표시되면 설치가 정상입니다. macOS에서 Homebrew를 쓰신다면:

```bash
brew install node
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

### Git으로 받아서(clone) 실행하기

Git이 설치되어 있다면 아래가 가장 간단합니다.

1. 저장소 클론

```bash
git clone https://github.com/RickYoon/memeMax_tx_bot.git
cd memeMax_tx_bot
```

- SSH를 쓰신다면: `git@github.com:RickYoon/memeMax_tx_bot.git`
- 포크/다른 저장소를 쓰는 경우, 본인 저장소 주소로 교체하세요.

2. 의존성 설치

```bash
npm install
```

3. 환경 파일 생성

```bash
cp "env copy.example" .env
```

4. `.env`에 `RPC_URL`, `PRIVATE_KEY` 등 값 채우기

5. 실행

```bash
npm start
```

### (Git 없이) ZIP으로 받아서 실행하기

Git을 몰라도 됩니다. GitHub 저장소에서 “Code” → “Download ZIP”으로 내려받아 압축을 풀고, 폴더에서 터미널을 열어 아래만 순서대로 실행하세요.

1. 의존성 설치

```bash
npm install
```

2. `.env` 만들기

```bash
cp "env copy.example" .env
```

3. `.env`에 RPC_URL, PRIVATE_KEY 등 값 채우기
4. 실행

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

### GitHub이 처음이라면(기초 업로드 절차)

1. GitHub 계정 만들기: https://github.com/
2. 새 저장소 만들기(Repository → New → 이름 입력 → Create)
3. 내 컴퓨터에 Git 설치(필요 시): https://git-scm.com/
4. 터미널에서 프로젝트 폴더로 이동 후 다음 실행

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/<your-account>/<your-repo>.git
git push -u origin main
```

5. 브라우저에서 저장소 페이지 새로고침 → 파일이 보이면 성공

주의: `.env`는 절대 올리면 안 됩니다. 올렸다면 즉시 삭제하고 키를 교체하세요(비밀 유출).

### 자주 만나는 오류 해결(FAQ)

- node: command not found
  - Node.js가 설치되지 않았습니다. 위 “Node.js가 처음이라면” 절을 따라 설치하세요.
- npm ERR! EACCES / 권한 오류(macOS/Linux)
  - 폴더 권한 문제일 수 있습니다. 다른 폴더에서 다시 시도하거나, nvm 사용을 권장합니다.
- insufficient funds / 잔액 부족
  - 지갑에 ETH 잔액이 wrap/unwrap 금액과 가스비를 커버할 만큼 있는지 확인하세요.
- 연결된 체인의 chainId가 다릅니다
  - `.env`의 `RPC_URL`을 MemeCore 메인넷으로 설정했는지 확인하세요.
- 원격 저장소 origin이 이미 있습니다
  - `git remote set-url origin <YOUR_GITHUB_REPO_URL>`로 주소만 바꾸세요.

### 보안 체크리스트(반드시 확인)

- `.env`는 Git에 포함되지 않습니다(.gitignore에 이미 설정).
- `PRIVATE_KEY`는 절대 공유/커밋 금지. 유출 시 즉시 키 폐기/교체.
- 스크린샷, 로그에 키나 토큰이 노출되지 않도록 주의.
