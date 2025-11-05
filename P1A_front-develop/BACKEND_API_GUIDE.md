# 백엔드 API 연동 가이드

## 개요
프론트엔드 코드가 MongoDB + Spring Boot 백엔드와 통신하도록 구조화되었습니다.

## API 베이스 URL 설정
`.env.example` 파일을 `.env`로 복사하고 실제 백엔드 URL을 설정하세요:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

## 구현된 API 엔드포인트

### 인증 (/api/auth)
- POST /auth/login - 로그인
- POST /auth/logout - 로그아웃
- GET /auth/me - 현재 사용자 정보

### 계정 관리 (/api/accounts)
- GET /api/accounts - 전체 계정 조회
- POST /api/accounts - 계정 생성
- PUT /api/accounts/:id - 계정 수정
- DELETE /api/accounts/:id - 계정 삭제

### 회사 관리 (/api/companies)
- GET /api/companies - 전체 회사 조회
- POST /api/companies - 회사 생성
- PUT /api/companies/:id - 회사 수정
- DELETE /api/companies/:id - 회사 삭제

### 처리업무 (/api/tasks)
- GET /api/tasks - 전체 업무 조회
- POST /api/tasks - 업무 생성
- PUT /api/tasks/:id - 업무 수정
- DELETE /api/tasks/:id - 업무 삭제
- PUT /api/tasks/bulk - 일괄 업데이트

### 평가 관리 (/api/evaluations)
- GET /api/evaluations - 전체 평가 조회
- POST /api/evaluations - 평가 생성
- PUT /api/evaluations/:id - 평가 수정
- DELETE /api/evaluations/:id - 평가 삭제

### 평가 요청 (/api/evaluation-requests)
- GET /api/evaluation-requests - 전체 요청 조회
- POST /api/evaluation-requests - 요청 생성

### 파일 업로드 (/api/files)
- POST /api/files/upload - AWS S3 파일 업로드
- DELETE /api/files - 파일 삭제

## 인증 토큰
- JWT 토큰은 sessionStorage에 저장됩니다
- 모든 API 요청에 자동으로 Authorization 헤더 추가
- 401 응답 시 자동으로 로그인 페이지로 리다이렉트

## 사용 예시
```typescript
import { api } from '@/lib/api';

// 로그인
const response = await api.auth.login({ id: 'user', password: 'pass' });

// 계정 조회
const accounts = await api.accounts.getAll();

// 파일 업로드
const file = new File(['content'], 'test.txt');
const result = await api.files.upload(file, 'documents');
```
