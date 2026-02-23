<h1>📘 P1A Front — Open Source Release</h1>

본 프로젝트는 개인정보 영향평가(PIA) 자동화 플랫폼을 제공합니다.

<h2>🎬 시연 영상</h2>

[![P1A 시연영상](https://img.youtube.com/vi/5krxS0KycJc/0.jpg)](https://youtu.be/5krxS0KycJc)

> 클릭하면 YouTube에서 시연 영상을 확인할 수 있습니다.

<h2>📝 License — Apache License 2.0</h2>

본 프로젝트는 Apache License 2.0을 따릅니다.

<h2>✔️ 사용 시 주의사항</h2>

소스코드를 수정할 수 있습니다.

다만, 라이선스 파일(LICENSE)과 저작권 문구를 반드시 유지해야 합니다.

외부 API 키 또는 민감한 값은 포함되지 않습니다. 사용자는 자체 키 또는 환경변수를 설정해야 합니다.

Apache 2.0 전문은 /LICENSE 파일 또는
https://www.apache.org/licenses/LICENSE-2.0
 에서 확인할 수 있습니다.

<h2>🚀 설치 및 실행 방법 (Windows / Linux)</h2>

<h3>1️⃣ 필수 프로그램 설치</h3>

1. Git 설치

소스코드를 내려받기 위해 필요합니다.

https://git-scm.com/downloads

설치 후 아래 명령어로 정상 설치 여부 확인:

git --version

2. Docker Desktop 설치

프로젝트는 Docker 기반으로 빌드·실행됩니다.

- Windows: https://www.docker.com/products/docker-desktop

- Linux(Ubuntu 기준):

sudo apt update

sudo apt install docker.io -y

sudo systemctl enable docker

sudo systemctl start docker

- 설치 확인:

docker --version

3. Node.js 설치

Node.js 다운로드: https://nodejs.org

LTS 버전 권장

확인:

node -v

<h3>2️⃣ 소스코드 다운로드</h3>

터미널(CMD/PowerShell/Bash)에서 원하는 폴더로 이동 후:

git clone https://github.com/BoB-P1A/P1A_front.git

cd P1A_front

<h3>3️⃣ 운영 시스템별 실행 방법</h3>

🪟 Windows 환경에서 실행하기

1. Docker Desktop 실행

Docker Desktop을 켜고, running 상태인지 확인합니다.

2. 프로젝트 설치

루트 경로에서 다음 명령 실행:

npm install

3. Docker 기반 빌드 및 실행

프로젝트 구조는 다음과 같습니다:

아래 명령어로 Docker 이미지 빌드와 실행까지 됩니다:

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

<h2>⚙️ 환경변수 설정</h2>

프로젝트는 실행 전 반드시 FE/BE/Py-BE 각 환경변수를 설정해야 합니다:

.env.local 파일

<h2>🤝 기여 가이드</h2>

새로운 기능 추가 시 이슈(Issue) 먼저 등록

PR 생성 시 변경사항을 상세히 작성

UI 변경 시 스크린샷 제공

라이선스 범위 내에서 자유롭게 수정 가능
