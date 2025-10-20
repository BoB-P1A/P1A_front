# EPIA 백엔드 API 명세서

## 기본 정보

- **Base URL**: `http://localhost:8080/api`
- **인증 방식**: JWT Bearer Token
- **Content-Type**: `application/json`
- **Timeout**: 10000ms

---

## 공통 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { ... },
  "message": "성공 메시지"
}
```

### 에러 응답
```json
{
  "success": false,
  "error": "에러 메시지",
  "code": "ERROR_CODE"
}
```

### HTTP 상태 코드
- `200 OK`: 요청 성공
- `201 Created`: 리소스 생성 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스 없음
- `500 Internal Server Error`: 서버 오류

---

## 1. 인증 API

### 1.1 로그인
```
POST /auth/login
```

**Request Body:**
```json
{
  "id": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin",
    "username": "admin",
    "email": "admin@example.com",
    "name": "관리자",
    "role": "super_admin",
    "company": "테스트회사",
    "department": "관리부서"
  }
}
```

### 1.2 로그아웃
```
POST /auth/logout
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "로그아웃되었습니다"
}
```

### 1.3 현재 사용자 정보 조회
```
GET /auth/me
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "admin",
  "username": "admin",
  "email": "admin@example.com",
  "name": "관리자",
  "role": "super_admin",
  "company": "테스트회사",
  "department": "관리부서"
}
```

---

## 2. 계정 관리 API

### 2.1 계정 목록 조회
```
GET /accounts
```

**Response:**
```json
[
  {
    "id": "1",
    "username": "admin",
    "email": "admin@example.com",
    "name": "관리자",
    "role": "super_admin",
    "company": "테스트회사",
    "department": "관리부서",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### 2.2 계정 조회
```
GET /accounts/{id}
```

**Response:**
```json
{
  "id": "1",
  "username": "admin",
  "email": "admin@example.com",
  "name": "관리자",
  "role": "super_admin",
  "company": "테스트회사",
  "department": "관리부서",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 2.3 계정 생성
```
POST /accounts
```

**Request Body:**
```json
{
  "username": "newuser",
  "password": "password123",
  "email": "newuser@example.com",
  "name": "신규사용자",
  "role": "user",
  "company": "테스트회사",
  "department": "개발부서"
}
```

**Response:**
```json
{
  "id": "2",
  "username": "newuser",
  "email": "newuser@example.com",
  "name": "신규사용자",
  "role": "user",
  "company": "테스트회사",
  "department": "개발부서",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 2.4 계정 수정
```
PUT /accounts/{id}
```

**Request Body:**
```json
{
  "email": "updated@example.com",
  "name": "수정된이름",
  "department": "새부서",
  "status": "inactive"
}
```

**Response:**
```json
{
  "id": "2",
  "username": "newuser",
  "email": "updated@example.com",
  "name": "수정된이름",
  "role": "user",
  "company": "테스트회사",
  "department": "새부서",
  "status": "inactive",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

### 2.5 계정 삭제
```
DELETE /accounts/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "계정이 삭제되었습니다"
}
```

---

## 3. 회사 관리 API

### 3.1 회사 목록 조회
```
GET /companies
```

**Response:**
```json
[
  {
    "id": "1",
    "name": "테스트회사",
    "registrationNumber": "123-45-67890",
    "address": "서울시 강남구",
    "ceoName": "홍길동",
    "accountCount": 5,
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### 3.2 회사 조회
```
GET /companies/{id}
```

**Response:**
```json
{
  "id": "1",
  "name": "테스트회사",
  "registrationNumber": "123-45-67890",
  "address": "서울시 강남구",
  "ceoName": "홍길동",
  "accountCount": 5,
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 3.3 회사 생성
```
POST /companies
```

**Request Body:**
```json
{
  "name": "신규회사",
  "registrationNumber": "987-65-43210",
  "address": "서울시 서초구",
  "ceoName": "김철수"
}
```

**Response:**
```json
{
  "id": "2",
  "name": "신규회사",
  "registrationNumber": "987-65-43210",
  "address": "서울시 서초구",
  "ceoName": "김철수",
  "accountCount": 0,
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 3.4 회사 수정
```
PUT /companies/{id}
```

**Request Body:**
```json
{
  "name": "수정된회사명",
  "address": "서울시 종로구",
  "ceoName": "이영희"
}
```

**Response:**
```json
{
  "id": "2",
  "name": "수정된회사명",
  "registrationNumber": "987-65-43210",
  "address": "서울시 종로구",
  "ceoName": "이영희",
  "accountCount": 0,
  "status": "active",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

### 3.5 회사 삭제
```
DELETE /companies/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "회사가 삭제되었습니다"
}
```

---

## 4. 처리업무 관리 API

### 4.1 처리업무 목록 조회
```
GET /tasks?companyId={companyId}
```

**Response:**
```json
[
  {
    "id": 1,
    "taskName": "회원가입",
    "purpose": "서비스 이용을 위한 회원 식별",
    "personalInfo": "이름, 이메일, 전화번호",
    "department": "개발팀",
    "companyId": "company123",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### 4.2 처리업무 생성
```
POST /tasks
```

**Request Body:**
```json
{
  "taskName": "고객상담",
  "purpose": "고객 문의 응대",
  "personalInfo": "이름, 연락처",
  "department": "CS팀",
  "companyId": "company123"
}
```

**Response:**
```json
{
  "id": 2,
  "taskName": "고객상담",
  "purpose": "고객 문의 응대",
  "personalInfo": "이름, 연락처",
  "department": "CS팀",
  "companyId": "company123",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 4.3 처리업무 수정
```
PUT /tasks/{id}
```

**Request Body:**
```json
{
  "taskName": "고객상담(수정)",
  "purpose": "고객 문의 응대 및 서비스 개선",
  "personalInfo": "이름, 연락처, 상담내용",
  "department": "CS팀"
}
```

**Response:**
```json
{
  "id": 2,
  "taskName": "고객상담(수정)",
  "purpose": "고객 문의 응대 및 서비스 개선",
  "personalInfo": "이름, 연락처, 상담내용",
  "department": "CS팀",
  "companyId": "company123",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

### 4.4 처리업무 삭제
```
DELETE /tasks/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "처리업무가 삭제되었습니다"
}
```

### 4.5 처리업무 일괄 수정
```
PUT /tasks/bulk
```

**Request Body:**
```json
[
  {
    "id": 1,
    "taskName": "회원가입",
    "purpose": "서비스 이용을 위한 회원 식별",
    "personalInfo": "이름, 이메일, 전화번호",
    "department": "개발팀"
  },
  {
    "id": 2,
    "taskName": "고객상담",
    "purpose": "고객 문의 응대",
    "personalInfo": "이름, 연락처",
    "department": "CS팀"
  }
]
```

**Response:**
```json
{
  "success": true,
  "message": "처리업무가 일괄 수정되었습니다"
}
```

---

## 5. 평가 관리 API

### 5.1 평가항목 목록 조회
```
GET /evaluations
```

**Response:**
```json
[
  {
    "id": 1,
    "area": "1. 개인정보 처리단계별 보호조치",
    "field": "수집",
    "subField": "수집 제한",
    "no": "1-1-1",
    "item": "개인정보를 수집하는 경우 그 목적에 필요한 최소한의 개인정보를 수집하고 있는가?"
  }
]
```

### 5.2 평가항목 조회
```
GET /evaluations/{id}
```

**Response:**
```json
{
  "id": 1,
  "area": "1. 개인정보 처리단계별 보호조치",
  "field": "수집",
  "subField": "수집 제한",
  "no": "1-1-1",
  "item": "개인정보를 수집하는 경우 그 목적에 필요한 최소한의 개인정보를 수집하고 있는가?"
}
```

### 5.3 평가항목 생성
```
POST /evaluations
```

**Request Body:**
```json
{
  "area": "1. 개인정보 처리단계별 보호조치",
  "field": "수집",
  "subField": "수집 근거",
  "no": "1-1-2",
  "item": "법령상 개인정보 수집 근거가 있는가?"
}
```

**Response:**
```json
{
  "id": 2,
  "area": "1. 개인정보 처리단계별 보호조치",
  "field": "수집",
  "subField": "수집 근거",
  "no": "1-1-2",
  "item": "법령상 개인정보 수집 근거가 있는가?"
}
```

### 5.4 평가항목 수정
```
PUT /evaluations/{id}
```

**Request Body:**
```json
{
  "area": "1. 개인정보 처리단계별 보호조치",
  "field": "수집",
  "subField": "수집 근거",
  "no": "1-1-2",
  "item": "법령상 개인정보 수집 근거가 명확한가?"
}
```

**Response:**
```json
{
  "id": 2,
  "area": "1. 개인정보 처리단계별 보호조치",
  "field": "수집",
  "subField": "수집 근거",
  "no": "1-1-2",
  "item": "법령상 개인정보 수집 근거가 명확한가?"
}
```

### 5.5 평가항목 삭제
```
DELETE /evaluations/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "평가항목이 삭제되었습니다"
}
```

---

## 6. 평가 요청 관리 API

### 6.1 평가 요청 목록 조회
```
GET /evaluation-requests
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "2024년 1분기 개인정보 영향평가",
    "requestor": "홍길동",
    "department": "개발팀",
    "status": "in_progress",
    "priority": "high",
    "description": "새로운 회원관리 시스템 개발에 따른 영향평가",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### 6.2 평가 요청 생성
```
POST /evaluation-requests
```

**Request Body:**
```json
{
  "title": "2024년 2분기 개인정보 영향평가",
  "description": "고객관리 시스템 업그레이드",
  "priority": "medium"
}
```

**Response:**
```json
{
  "id": 2,
  "title": "2024년 2분기 개인정보 영향평가",
  "requestor": "현재로그인사용자",
  "department": "현재부서",
  "status": "pending",
  "priority": "medium",
  "description": "고객관리 시스템 업그레이드",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## 7. 생애주기 관리 API

### 7.1 생애주기 체크리스트

#### 7.1.1 체크리스트 조회
```
GET /lifecycle/lifecycle?companyId={companyId}
```

**Response:**
```json
[
  {
    "id": 1,
    "taskName": "회원가입",
    "field": "수집",
    "subField": "수집 제한",
    "no": "1-1-1",
    "item": "개인정보를 수집하는 경우 그 목적에 필요한 최소한의 개인정보를 수집하고 있는가?",
    "status": "이행",
    "evidence": "최소한의 정보만 수집",
    "files": [
      {
        "name": "evidence.pdf",
        "url": "https://s3.amazonaws.com/...",
        "type": "application/pdf"
      }
    ]
  }
]
```

#### 7.1.2 체크리스트 저장
```
POST /lifecycle/lifecycle
```

**Request Body:**
```json
{
  "companyId": "company123",
  "taskName": "회원가입",
  "data": [
    {
      "id": 1,
      "taskName": "회원가입",
      "field": "수집",
      "subField": "수집 제한",
      "no": "1-1-1",
      "item": "개인정보를 수집하는 경우 그 목적에 필요한 최소한의 개인정보를 수집하고 있는가?",
      "status": "이행",
      "evidence": "최소한의 정보만 수집",
      "files": []
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "체크리스트가 저장되었습니다"
}
```

### 7.2 흐름도 관리

#### 7.2.1 흐름도 목록 조회
```
GET /lifecycle/flowcharts?companyId={companyId}
```

**Response:**
```json
{
  "회원가입": {
    "taskName": "회원가입",
    "imageData": "data:image/svg+xml;base64,...",
    "flowData": {
      "icons": [
        {
          "id": "temp_1234567890",
          "type": "handler",
          "x": 100,
          "y": 100,
          "text": "개인정보취급자"
        }
      ]
    },
    "personalInfoText": "{\"row1\":\"이름, 이메일\",\"row2\":\"전화번호\",\"row3\":\"주소\"}"
  }
}
```

#### 7.2.2 흐름도 저장
```
POST /lifecycle/flowcharts
```

**Request Body:**
```json
{
  "companyId": "company123",
  "taskName": "회원가입",
  "imageData": "data:image/svg+xml;base64,...",
  "flowData": {
    "icons": [
      {
        "id": "temp_1234567890",
        "type": "handler",
        "x": 100,
        "y": 100,
        "text": "개인정보취급자"
      }
    ]
  },
  "personalInfoText": "{\"row1\":\"이름, 이메일\",\"row2\":\"전화번호\",\"row3\":\"주소\"}"
}
```

**Response:**
```json
{
  "taskName": "회원가입",
  "imageData": "data:image/svg+xml;base64,...",
  "flowData": {
    "icons": [
      {
        "id": "temp_1234567890",
        "type": "handler",
        "x": 100,
        "y": 100,
        "text": "개인정보취급자"
      }
    ]
  }
}
```

### 7.3 흐름표 관리

#### 7.3.1 흐름표 조회
```
GET /lifecycle/flowtables?companyId={companyId}
```

**Response:**
```json
{
  "회원가입": {
    "collection": [
      {
        "id": "1",
        "detailTask": "온라인 회원가입",
        "collectionTarget": "회원",
        "collectionPath": "웹사이트",
        "collectionSystem": "회원관리시스템",
        "collectionItem": "이름, 이메일, 전화번호",
        "collectionPeriod": "가입 시",
        "collectionManager": "홍길동",
        "collectionBasis": "정보주체 동의",
        "isOnline": "True",
        "isEncrypted": "True"
      }
    ],
    "storage": [],
    "usage": [],
    "provision": [],
    "disposal": []
  }
}
```

#### 7.3.2 흐름표 저장
```
POST /lifecycle/flowtables
```

**Request Body:**
```json
{
  "companyId": "company123",
  "data": {
    "회원가입": {
      "collection": [
        {
          "id": "1",
          "detailTask": "온라인 회원가입",
          "collectionTarget": "회원",
          "collectionPath": "웹사이트",
          "collectionSystem": "회원관리시스템",
          "collectionItem": "이름, 이메일, 전화번호",
          "collectionPeriod": "가입 시",
          "collectionManager": "홍길동",
          "collectionBasis": "정보주체 동의",
          "isOnline": "True",
          "isEncrypted": "True"
        }
      ],
      "storage": [],
      "usage": [],
      "provision": [],
      "disposal": []
    }
  }
}
```

**Response:**
```json
{
  "회원가입": {
    "collection": [
      {
        "id": "1",
        "detailTask": "온라인 회원가입",
        "collectionTarget": "회원",
        "collectionPath": "웹사이트",
        "collectionSystem": "회원관리시스템",
        "collectionItem": "이름, 이메일, 전화번호",
        "collectionPeriod": "가입 시",
        "collectionManager": "홍길동",
        "collectionBasis": "정보주체 동의",
        "isOnline": "True",
        "isEncrypted": "True"
      }
    ],
    "storage": [],
    "usage": [],
    "provision": [],
    "disposal": []
  }
}
```

### 7.4 개선 가이드 관리

#### 7.4.1 개선 가이드 조회
```
GET /lifecycle/improvements?companyId={companyId}
```

**Response:**
```json
{
  "회원가입-1-1-1": {
    "relatedLaw": "개인정보 보호법 제16조",
    "riskFactor": "과도한 개인정보 수집",
    "improvementPlan": "필수 항목과 선택 항목을 명확히 구분"
  }
}
```

#### 7.4.2 개선 가이드 저장
```
POST /lifecycle/improvements
```

**Request Body:**
```json
{
  "companyId": "company123",
  "improvements": {
    "회원가입-1-1-1": {
      "relatedLaw": "개인정보 보호법 제16조",
      "riskFactor": "과도한 개인정보 수집",
      "improvementPlan": "필수 항목과 선택 항목을 명확히 구분"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "개선 가이드가 저장되었습니다"
}
```

### 7.5 조치 계획 관리

#### 7.5.1 조치 계획 조회
```
GET /lifecycle/action-plans?companyId={companyId}
```

**Response:**
```json
{
  "회원가입-1-1-1": {
    "taskName": "회원가입",
    "code": "1-1-1",
    "actionPlan": "회원가입 폼 개선",
    "actionPeriod": "2024년 3월",
    "department": "개발팀",
    "manager": "홍길동",
    "actionDate": "2024-03-31"
  }
}
```

#### 7.5.2 조치 계획 저장
```
POST /lifecycle/action-plans
```

**Request Body:**
```json
{
  "companyId": "company123",
  "actionPlans": {
    "회원가입-1-1-1": {
      "taskName": "회원가입",
      "code": "1-1-1",
      "actionPlan": "회원가입 폼 개선",
      "actionPeriod": "2024년 3월",
      "department": "개발팀",
      "manager": "홍길동",
      "actionDate": "2024-03-31"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "조치 계획이 저장되었습니다"
}
```

---

## 8. 보안성 검토 API

### 8.1 검토 대상 관리

#### 8.1.1 검토 대상 목록 조회
```
GET /security/targets?companyId={companyId}
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "회원관리시스템",
    "companyId": "company123",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### 8.1.2 검토 대상 생성
```
POST /security/targets
```

**Request Body:**
```json
{
  "companyId": "company123",
  "targetName": "고객관리시스템"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "고객관리시스템",
  "companyId": "company123",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### 8.1.3 검토 대상 수정
```
PUT /security/targets/{id}
```

**Request Body:**
```json
{
  "targetName": "고객관리시스템(수정)"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "고객관리시스템(수정)",
  "companyId": "company123",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

#### 8.1.4 검토 대상 삭제
```
DELETE /security/targets/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "검토 대상이 삭제되었습니다"
}
```

### 8.2 보안 체크리스트

#### 8.2.1 체크리스트 조회
```
GET /security/checklists?companyId={companyId}&status[]=부분이행&status[]=미이행
```

**Query Parameters:**
- `companyId`: 회사 ID (필수)
- `status[]`: 필터링할 상태 (선택, 다중 선택 가능)
  - 이행
  - 부분이행
  - 미이행
  - 해당없음

**Response:**
```json
[
  {
    "id": 1,
    "targetName": "회원관리시스템",
    "field": "접근통제",
    "subField": "사용자 인증",
    "no": "2-1-1",
    "item": "정보시스템 사용자 인증 기능을 구현하고 있는가?",
    "status": "이행",
    "evidence": "사용자 인증 기능 구현 완료",
    "files": []
  }
]
```

#### 8.2.2 체크리스트 저장
```
POST /security/checklists
```

**Request Body:**
```json
{
  "companyId": "company123",
  "targetName": "회원관리시스템",
  "data": [
    {
      "id": 1,
      "targetName": "회원관리시스템",
      "field": "접근통제",
      "subField": "사용자 인증",
      "no": "2-1-1",
      "item": "정보시스템 사용자 인증 기능을 구현하고 있는가?",
      "status": "이행",
      "evidence": "사용자 인증 기능 구현 완료",
      "files": []
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "체크리스트가 저장되었습니다"
}
```

### 8.3 보안 개선 가이드

#### 8.3.1 개선 가이드 조회
```
GET /security/improvements?companyId={companyId}
```

**Response:**
```json
{
  "회원관리시스템-2-1-1": {
    "relatedLaw": "개인정보 보호법 제29조",
    "riskFactor": "인증 기능 미흡",
    "improvementPlan": "다단계 인증 도입"
  }
}
```

#### 8.3.2 개선 가이드 저장
```
POST /security/improvements
```

**Request Body:**
```json
{
  "companyId": "company123",
  "improvements": {
    "회원관리시스템-2-1-1": {
      "relatedLaw": "개인정보 보호법 제29조",
      "riskFactor": "인증 기능 미흡",
      "improvementPlan": "다단계 인증 도입"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "개선 가이드가 저장되었습니다"
}
```

### 8.4 보안 조치 계획

#### 8.4.1 조치 계획 조회
```
GET /security/action-plans?companyId={companyId}
```

**Response:**
```json
{
  "회원관리시스템-2-1-1": {
    "targetName": "회원관리시스템",
    "code": "2-1-1",
    "actionPlan": "다단계 인증 구현",
    "actionPeriod": "2024년 4월",
    "department": "보안팀",
    "manager": "김보안",
    "actionDate": "2024-04-30"
  }
}
```

#### 8.4.2 조치 계획 저장
```
POST /security/action-plans
```

**Request Body:**
```json
{
  "companyId": "company123",
  "actionPlans": {
    "회원관리시스템-2-1-1": {
      "targetName": "회원관리시스템",
      "code": "2-1-1",
      "actionPlan": "다단계 인증 구현",
      "actionPeriod": "2024년 4월",
      "department": "보안팀",
      "manager": "김보안",
      "actionDate": "2024-04-30"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "조치 계획이 저장되었습니다"
}
```

---

## 9. 기술적 보호조치 API

### 9.1 시스템 관리

#### 9.1.1 시스템 목록 조회
```
GET /technical/systems?companyId={companyId}
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "회원관리시스템",
    "companyId": "company123",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### 9.1.2 시스템 생성
```
POST /technical/systems
```

**Request Body:**
```json
{
  "companyId": "company123",
  "systemName": "고객관리시스템"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "고객관리시스템",
  "companyId": "company123",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### 9.1.3 시스템 수정
```
PUT /technical/systems/{id}
```

**Request Body:**
```json
{
  "systemName": "고객관리시스템(수정)"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "고객관리시스템(수정)",
  "companyId": "company123",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

#### 9.1.4 시스템 삭제
```
DELETE /technical/systems/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "시스템이 삭제되었습니다"
}
```

### 9.2 기술 체크리스트

#### 9.2.1 체크리스트 조회
```
GET /technical/checklists?companyId={companyId}&status[]=부분이행&status[]=미이행
```

**Query Parameters:**
- `companyId`: 회사 ID (필수)
- `status[]`: 필터링할 상태 (선택, 다중 선택 가능)

**Response:**
```json
[
  {
    "id": 1,
    "systemName": "회원관리시스템",
    "field": "접근통제",
    "subField": "사용자 계정 관리",
    "no": "3-1-1",
    "item": "관리자 및 사용자 계정을 적절히 관리하고 있는가?",
    "status": "이행",
    "evidence": "계정 관리 정책 수립 및 이행",
    "files": []
  }
]
```

#### 9.2.2 체크리스트 저장
```
POST /technical/checklists
```

**Request Body:**
```json
{
  "companyId": "company123",
  "systemName": "회원관리시스템",
  "data": [
    {
      "id": 1,
      "systemName": "회원관리시스템",
      "field": "접근통제",
      "subField": "사용자 계정 관리",
      "no": "3-1-1",
      "item": "관리자 및 사용자 계정을 적절히 관리하고 있는가?",
      "status": "이행",
      "evidence": "계정 관리 정책 수립 및 이행",
      "files": []
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "체크리스트가 저장되었습니다"
}
```

### 9.3 기술 개선 가이드

#### 9.3.1 개선 가이드 조회
```
GET /technical/improvements?companyId={companyId}
```

**Response:**
```json
{
  "회원관리시스템-3-1-1": {
    "relatedLaw": "개인정보 보호법 제29조",
    "riskFactor": "계정 관리 미흡",
    "improvementPlan": "계정 관리 정책 강화"
  }
}
```

#### 9.3.2 개선 가이드 저장
```
POST /technical/improvements
```

**Request Body:**
```json
{
  "companyId": "company123",
  "improvements": {
    "회원관리시스템-3-1-1": {
      "relatedLaw": "개인정보 보호법 제29조",
      "riskFactor": "계정 관리 미흡",
      "improvementPlan": "계정 관리 정책 강화"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "개선 가이드가 저장되었습니다"
}
```

### 9.4 기술 조치 계획

#### 9.4.1 조치 계획 조회
```
GET /technical/action-plans?companyId={companyId}
```

**Response:**
```json
{
  "회원관리시스템-3-1-1": {
    "systemName": "회원관리시스템",
    "code": "3-1-1",
    "question": "관리자 및 사용자 계정을 적절히 관리하고 있는가?",
    "evidence": "계정 관리 정책 수립 및 이행",
    "improvementGuide": "계정 관리 정책 강화",
    "actionPlan": "계정 관리 정책 문서화 및 교육",
    "actionPeriod": "2024년 5월",
    "department": "IT팀",
    "manager": "이관리",
    "actionDate": "2024-05-31"
  }
}
```

#### 9.4.2 조치 계획 저장
```
POST /technical/action-plans
```

**Request Body:**
```json
{
  "companyId": "company123",
  "actionPlans": [
    {
      "systemName": "회원관리시스템",
      "code": "3-1-1",
      "actionPlan": "계정 관리 정책 문서화 및 교육",
      "actionPeriod": "2024년 5월",
      "department": "IT팀",
      "manager": "이관리",
      "actionDate": "2024-05-31"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "조치 계획이 저장되었습니다"
}
```

---

## 10. 파일 관리 API

### 10.1 파일 업로드 (AWS S3)
```
POST /files/upload
```

**Request:**
- Content-Type: `multipart/form-data`

**Form Data:**
- `file`: 업로드할 파일 (필수)
- `folder`: 저장할 폴더명 (선택)
  - `protection-lifecycle`: 생애주기 관련 파일
  - `security-checklist`: 보안성 검토 관련 파일
  - `technical-checklist`: 기술적 보호조치 관련 파일

**Response:**
```json
{
  "fileUrl": "https://s3.amazonaws.com/bucket/folder/filename.pdf",
  "fileName": "evidence.pdf",
  "fileSize": 1024000,
  "uploadedAt": "2024-01-01T00:00:00Z"
}
```

### 10.2 파일 삭제
```
DELETE /files
```

**Request Body:**
```json
{
  "fileUrl": "https://s3.amazonaws.com/bucket/folder/filename.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "message": "파일이 삭제되었습니다"
}
```

---

## 11. 에러 코드

| 코드 | 설명 |
|------|------|
| `INVALID_CREDENTIALS` | 잘못된 인증 정보 |
| `TOKEN_EXPIRED` | 토큰 만료 |
| `UNAUTHORIZED` | 인증되지 않은 사용자 |
| `FORBIDDEN` | 권한 없음 |
| `NOT_FOUND` | 리소스를 찾을 수 없음 |
| `DUPLICATE_ENTRY` | 중복된 데이터 |
| `VALIDATION_ERROR` | 데이터 유효성 검증 실패 |
| `FILE_TOO_LARGE` | 파일 크기 초과 |
| `UNSUPPORTED_FILE_TYPE` | 지원하지 않는 파일 형식 |
| `SERVER_ERROR` | 서버 오류 |

---

## 12. 데이터 타입 정의

### UserRole
- `super_admin`: 슈퍼 관리자
- `company_admin`: 회사 관리자
- `user`: 일반 사용자

### Status (평가 상태)
- `이행`: 완전히 이행됨
- `부분이행`: 부분적으로 이행됨
- `미이행`: 이행되지 않음
- `해당없음`: 해당 사항 없음

### Priority (우선순위)
- `high`: 높음
- `medium`: 중간
- `low`: 낮음

### RequestStatus (요청 상태)
- `pending`: 대기 중
- `in_progress`: 진행 중
- `completed`: 완료됨

---

## 13. 보안 요구사항

### 인증
- JWT Bearer Token 방식 사용
- 토큰은 `Authorization` 헤더에 `Bearer {token}` 형식으로 전송
- 토큰은 `sessionStorage`에 저장
- 401 Unauthorized 응답 시 자동 로그아웃 및 로그인 페이지 리다이렉트

### CORS
- 프론트엔드 도메인만 허용
- 개발 환경: `http://localhost:5173`
- 프로덕션 환경: 실제 도메인 설정 필요

### 파일 업로드
- 최대 파일 크기: 10MB
- 허용 파일 형식: PDF, JPG, PNG, DOCX, XLSX
- 바이러스 검사 필수

---

## 14. 개발 가이드

### API 호출 예시 (JavaScript)
```javascript
import { apiClient } from '@/lib/api';

// GET 요청
const response = await apiClient.get('/tasks', {
  params: { companyId: 'company123' }
});

// POST 요청
const response = await apiClient.post('/tasks', {
  taskName: '회원가입',
  purpose: '서비스 이용',
  personalInfo: '이름, 이메일',
  department: '개발팀'
});

// PUT 요청
const response = await apiClient.put('/tasks/1', {
  taskName: '회원가입(수정)'
});

// DELETE 요청
const response = await apiClient.delete('/tasks/1');

// 파일 업로드
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'protection-lifecycle');

const response = await apiClient.post('/files/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

### 에러 처리
```javascript
try {
  const response = await apiClient.get('/tasks');
  // 성공 처리
} catch (error) {
  if (error.response?.status === 401) {
    // 인증 실패 - 자동으로 인터셉터가 처리
  } else if (error.response?.status === 400) {
    // 잘못된 요청
    console.error(error.response.data.error);
  } else {
    // 기타 오류
    console.error('API 요청 실패:', error);
  }
}
```

---

## 15. 테스트 데이터

### 테스트 계정
```json
{
  "admin": {
    "id": "admin",
    "password": "admin123",
    "role": "super_admin"
  },
  "developer": {
    "id": "developer",
    "password": "dev123",
    "role": "user"
  },
  "privacy": {
    "id": "privacy",
    "password": "privacy123",
    "role": "user"
  }
}
```

---

## 16. 버전 히스토리

### v1.0.0 (2024-01-01)
- 초기 API 명세서 작성
- 인증, 계정, 회사, 처리업무, 평가 관리 API
- 생애주기, 보안성 검토, 기술적 보호조치 API
- 파일 관리 API

---

## 부록: API 엔드포인트 목록

### 인증
- `POST /auth/login` - 로그인
- `POST /auth/logout` - 로그아웃
- `GET /auth/me` - 현재 사용자 정보

### 계정
- `GET /accounts` - 계정 목록
- `GET /accounts/{id}` - 계정 조회
- `POST /accounts` - 계정 생성
- `PUT /accounts/{id}` - 계정 수정
- `DELETE /accounts/{id}` - 계정 삭제

### 회사
- `GET /companies` - 회사 목록
- `GET /companies/{id}` - 회사 조회
- `POST /companies` - 회사 생성
- `PUT /companies/{id}` - 회사 수정
- `DELETE /companies/{id}` - 회사 삭제

### 처리업무
- `GET /tasks` - 처리업무 목록
- `POST /tasks` - 처리업무 생성
- `PUT /tasks/{id}` - 처리업무 수정
- `DELETE /tasks/{id}` - 처리업무 삭제
- `PUT /tasks/bulk` - 처리업무 일괄 수정

### 평가
- `GET /evaluations` - 평가항목 목록
- `GET /evaluations/{id}` - 평가항목 조회
- `POST /evaluations` - 평가항목 생성
- `PUT /evaluations/{id}` - 평가항목 수정
- `DELETE /evaluations/{id}` - 평가항목 삭제

### 평가 요청
- `GET /evaluation-requests` - 평가 요청 목록
- `POST /evaluation-requests` - 평가 요청 생성

### 생애주기
- `GET /lifecycle/tasks` - 처리업무 목록
- `GET /lifecycle/lifecycle` - 체크리스트 조회
- `POST /lifecycle/lifecycle` - 체크리스트 저장
- `GET /lifecycle/flowcharts` - 흐름도 목록
- `POST /lifecycle/flowcharts` - 흐름도 저장
- `GET /lifecycle/flowtables` - 흐름표 조회
- `POST /lifecycle/flowtables` - 흐름표 저장
- `GET /lifecycle/improvements` - 개선 가이드 조회
- `POST /lifecycle/improvements` - 개선 가이드 저장
- `GET /lifecycle/action-plans` - 조치 계획 조회
- `POST /lifecycle/action-plans` - 조치 계획 저장

### 보안성 검토
- `GET /security/targets` - 검토 대상 목록
- `POST /security/targets` - 검토 대상 생성
- `PUT /security/targets/{id}` - 검토 대상 수정
- `DELETE /security/targets/{id}` - 검토 대상 삭제
- `GET /security/checklists` - 체크리스트 조회
- `POST /security/checklists` - 체크리스트 저장
- `GET /security/improvements` - 개선 가이드 조회
- `POST /security/improvements` - 개선 가이드 저장
- `GET /security/action-plans` - 조치 계획 조회
- `POST /security/action-plans` - 조치 계획 저장

### 기술적 보호조치
- `GET /technical/systems` - 시스템 목록
- `POST /technical/systems` - 시스템 생성
- `PUT /technical/systems/{id}` - 시스템 수정
- `DELETE /technical/systems/{id}` - 시스템 삭제
- `GET /technical/checklists` - 체크리스트 조회
- `POST /technical/checklists` - 체크리스트 저장
- `GET /technical/improvements` - 개선 가이드 조회
- `POST /technical/improvements` - 개선 가이드 저장
- `GET /technical/action-plans` - 조치 계획 조회
- `POST /technical/action-plans` - 조치 계획 저장

### 파일
- `POST /files/upload` - 파일 업로드
- `DELETE /files` - 파일 삭제
