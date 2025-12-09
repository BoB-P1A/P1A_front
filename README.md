📘 P1A Front — Open Source Release

본 프로젝트는 개인정보 영향평가(PIA) 자동화 플랫폼의 프론트엔드 모듈을 오픈소스로 제공하는 것입니다.
중소기업·기관에서도 부담 없이 PIA 자동화를 구축하도록 돕고자 하며, 누구나 자유롭게 수정·배포할 수 있습니다.

📝 License — Apache License 2.0

본 프로젝트는 Apache License 2.0을 따릅니다.

✔️ 사용 시 주의사항

상업적·비상업적 사용 모두 허용됩니다.

소스코드를 수정하거나 재배포할 수 있습니다.

다만, 라이선스 파일(LICENSE)과 저작권 문구를 반드시 유지해야 합니다.

프로젝트 이름을 사용해 보증을 암시하는 행위는 금지됩니다.

외부 API 키 또는 민감한 값은 포함되지 않습니다. 사용자는 자체 키 또는 환경변수를 설정해야 합니다.

Apache 2.0 전문은 /LICENSE 파일 또는
https://www.apache.org/licenses/LICENSE-2.0
 에서 확인할 수 있습니다.

🚀 설치 및 실행 방법 (Windows / Linux)

초보자도 따라할 수 있도록 가능한 한 상세히 설명합니다.

1️⃣ 사전 준비
공통 준비 (Windows / Linux)
1. Git 설치

소스코드를 내려받기 위해 필요합니다.

▶︎ 다운로드: https://git-scm.com/downloads

설치 후 아래 명령어로 정상 설치 여부 확인:

git --version

2. Docker Desktop 설치

프로젝트는 Docker 기반으로 빌드·실행됩니다.

Windows: https://www.docker.com/products/docker-desktop

Linux(Ubuntu 기준):

sudo apt update
sudo apt install docker.io -y
sudo systemctl enable docker
sudo systemctl start docker


설치 확인:

docker --version

3. Node.js + npm 설치

Node.js 다운로드: https://nodejs.org

LTS 버전 권장

확인:

node -v
npm -v

2️⃣ 소스코드 다운로드

터미널(CMD/PowerShell/Bash)에서 원하는 폴더로 이동 후:

git clone https://github.com/BoB-P1A/P1A_front.git
cd P1A_front

3️⃣ 운영 시스템별 실행 방법
🪟 Windows 환경에서 실행하기
1. Docker Desktop 실행

Docker Desktop을 켜고, running 상태인지 확인합니다.

2. 프로젝트 설치

루트 경로에서 다음 명령 실행:

npm install

3. Docker 기반 빌드 및 실행

프로젝트 구조는 다음과 같습니다:

P1A_front/
 ├─ package.json
 ├─ docker/
 ├─ public/
 ├─ src/


아래 명령 한 번으로 Docker 이미지 빌드 + 실행까지 됩니다:

npm run docker

4. 실행 확인

브라우저에서 아래 주소 접속:

http://localhost:8080

🐧 Linux(Ubuntu) 환경에서 실행하기
1. 권한 설정

Ubuntu의 경우 npm 스크립트 내 Docker 명령 실행을 위해 sudo가 필요할 수 있습니다.

sudo usermod -aG docker $USER
newgrp docker

2. 패키지 설치
npm install

3. Docker 빌드 및 실행
npm run docker

4. 실행 확인

브라우저에서 접속:

http://localhost:8080

⚙️ 환경변수 설정

프로젝트는 실행 시 다음 환경변수를 참조할 수 있습니다:

변수명	설명	예시
VITE_API_BASE_URL	백엔드(파이썬 FastAPI or 스프링) API 엔드포인트	https://epia.store/api
VITE_FLOW_API_BASE_URL	흐름도 렌더링 전용 Python API 주소	/flow

환경변수는 다음 위치에서 설정하면 됩니다:

.env.local 파일

Dockerfile 또는 docker-compose.yml

또는 GitHub Actions/배포 환경 변수

.env 예시(로컬실행):
VITE_API_BASE_URL=http://localhost:8081
VITE_FLOW_API_BASE_URL=http://localhost:8000

🤝 기여 가이드

새로운 기능 추가 시 이슈(Issue) 먼저 등록

PR 생성 시 변경사항을 상세히 작성

UI 변경 시 스크린샷 제공

라이선스 범위 내에서 자유롭게 수정 가능