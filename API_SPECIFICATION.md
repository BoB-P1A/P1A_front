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
  "message": "String"
}
```

### 에러 응답
```json
{
  "success": false,
  "error": "String",
  "code": "String"
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
  "id": "String",
  "password": "String"
}
```

**Response:**
```json
{
  "token": "String (JWT)",
  "user": {
    "id": "String",
    "username": "String",
    "email": "String (email format)",
    "name": "String",
    "role": "String (UserRole enum)",
    "company": "String",
    "department": "String"
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
  "message": "String"
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
  "id": "String",
  "username": "String",
  "email": "String (email format)",
  "name": "String",
  "role": "String (UserRole enum)",
  "company": "String",
  "department": "String"
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
    "id": "String",
    "username": "String",
    "email": "String (email format)",
    "name": "String",
    "role": "String (UserRole enum)",
    "company": "String",
    "department": "String",
    "status": "String (active|inactive)",
    "createdAt": "String (ISO 8601 format)",
    "updatedAt": "String (ISO 8601 format)"
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
  "id": "String",
  "username": "String",
  "email": "String (email format)",
  "name": "String",
  "role": "String (UserRole enum)",
  "company": "String",
  "department": "String",
  "status": "String (active|inactive)",
  "createdAt": "String (ISO 8601 format)",
  "updatedAt": "String (ISO 8601 format)"
}
```

### 2.3 계정 생성
```
POST /accounts
```

**Request Body:**
```json
{
  "username": "String",
  "password": "String",
  "email": "String (email format)",
  "name": "String",
  "role": "String (UserRole enum)",
  "company": "String",
  "department": "String"
}
```

**Response:**
```json
{
  "id": "String",
  "username": "String",
  "email": "String (email format)",
  "name": "String",
  "role": "String (UserRole enum)",
  "company": "String",
  "department": "String",
  "status": "String (active|inactive)",
  "createdAt": "String (ISO 8601 format)"
}
```

### 2.4 계정 수정
```
PUT /accounts/{id}
```

**Request Body:**
```json
{
  "email": "String (email format)",
  "name": "String",
  "department": "String",
  "status": "String (active|inactive)"
}
```

**Response:**
```json
{
  "id": "String",
  "username": "String",
  "email": "String (email format)",
  "name": "String",
  "role": "String (UserRole enum)",
  "company": "String",
  "department": "String",
  "status": "String (active|inactive)",
  "updatedAt": "String (ISO 8601 format)"
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
  "message": "String"
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
    "id": "String",
    "name": "String",
    "registrationNumber": "String",
    "address": "String",
    "ceoName": "String",
    "accountCount": "Number",
    "status": "String (active|inactive)",
    "createdAt": "String (ISO 8601 format)",
    "updatedAt": "String (ISO 8601 format)"
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
  "id": "String",
  "name": "String",
  "registrationNumber": "String",
  "address": "String",
  "ceoName": "String",
  "accountCount": "Number",
  "status": "String (active|inactive)",
  "createdAt": "String (ISO 8601 format)",
  "updatedAt": "String (ISO 8601 format)"
}
```

### 3.3 회사 생성
```
POST /companies
```

**Request Body:**
```json
{
  "name": "String",
  "registrationNumber": "String",
  "address": "String",
  "ceoName": "String"
}
```

**Response:**
```json
{
  "id": "String",
  "name": "String",
  "registrationNumber": "String",
  "address": "String",
  "ceoName": "String",
  "accountCount": "Number",
  "status": "String (active|inactive)",
  "createdAt": "String (ISO 8601 format)"
}
```

### 3.4 회사 수정
```
PUT /companies/{id}
```

**Request Body:**
```json
{
  "name": "String",
  "address": "String",
  "ceoName": "String"
}
```

**Response:**
```json
{
  "id": "String",
  "name": "String",
  "registrationNumber": "String",
  "address": "String",
  "ceoName": "String",
  "accountCount": "Number",
  "status": "String (active|inactive)",
  "updatedAt": "String (ISO 8601 format)"
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
  "message": "String"
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
    "id": "Number",
    "taskName": "String",
    "purpose": "String",
    "personalInfo": "String",
    "department": "String",
    "companyId": "String",
    "createdAt": "String (ISO 8601 format)",
    "updatedAt": "String (ISO 8601 format)"
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
  "taskName": "String",
  "purpose": "String",
  "personalInfo": "String",
  "department": "String",
  "companyId": "String"
}
```

**Response:**
```json
{
  "id": "Number",
  "taskName": "String",
  "purpose": "String",
  "personalInfo": "String",
  "department": "String",
  "companyId": "String",
  "createdAt": "String (ISO 8601 format)"
}
```

### 4.3 처리업무 수정
```
PUT /tasks/{id}
```

**Request Body:**
```json
{
  "taskName": "String",
  "purpose": "String",
  "personalInfo": "String",
  "department": "String"
}
```

**Response:**
```json
{
  "id": "Number",
  "taskName": "String",
  "purpose": "String",
  "personalInfo": "String",
  "department": "String",
  "companyId": "String",
  "updatedAt": "String (ISO 8601 format)"
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
  "message": "String"
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
    "id": "Number",
    "taskName": "String",
    "purpose": "String",
    "personalInfo": "String",
    "department": "String"
  },
  {
    "id": "Number",
    "taskName": "String",
    "purpose": "String",
    "personalInfo": "String",
    "department": "String"
  }
]
```

**Response:**
```json
{
  "success": true,
  "message": "String"
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
    "id": "Number",
    "area": "String",
    "field": "String",
    "subField": "String",
    "no": "String",
    "item": "String"
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
  "id": "Number",
  "area": "String",
  "field": "String",
  "subField": "String",
  "no": "String",
  "item": "String"
}
```

### 5.3 평가항목 생성
```
POST /evaluations
```

**Request Body:**
```json
{
  "area": "String",
  "field": "String",
  "subField": "String",
  "no": "String",
  "item": "String"
}
```

**Response:**
```json
{
  "id": "Number",
  "area": "String",
  "field": "String",
  "subField": "String",
  "no": "String",
  "item": "String"
}
```

### 5.4 평가항목 수정
```
PUT /evaluations/{id}
```

**Request Body:**
```json
{
  "area": "String",
  "field": "String",
  "subField": "String",
  "no": "String",
  "item": "String"
}
```

**Response:**
```json
{
  "id": "Number",
  "area": "String",
  "field": "String",
  "subField": "String",
  "no": "String",
  "item": "String"
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
  "message": "String"
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
    "id": "Number",
    "title": "String",
    "requestor": "String",
    "department": "String",
    "status": "String (pending|in_progress|completed)",
    "priority": "String (high|medium|low)",
    "description": "String",
    "createdAt": "String (ISO 8601 format)",
    "updatedAt": "String (ISO 8601 format)"
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
  "title": "String",
  "description": "String",
  "priority": "String (high|medium|low)"
}
```

**Response:**
```json
{
  "id": "Number",
  "title": "String",
  "requestor": "String (current user)",
  "department": "String (current user's department)",
  "status": "String (pending|in_progress|completed)",
  "priority": "String (high|medium|low)",
  "description": "String",
  "createdAt": "String (ISO 8601 format)"
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
    "id": "Number",
    "taskName": "String",
    "field": "String",
    "subField": "String",
    "no": "String",
    "item": "String",
    "status": "String (이행|부분이행|미이행|해당없음)",
    "evidence": "String",
    "files": [
      {
        "name": "String",
        "url": "String (URL format)",
        "type": "String (MIME type)"
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
  "companyId": "String",
  "taskName": "String",
  "data": [
    {
      "id": "Number",
      "taskName": "String",
      "field": "String",
      "subField": "String",
      "no": "String",
      "item": "String",
      "status": "String (이행|부분이행|미이행|해당없음)",
      "evidence": "String",
      "files": []
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "String"
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
  "String (taskName)": {
    "taskName": "String",
    "imageData": "String (base64 encoded image)",
    "flowData": {
      "icons": [
        {
          "id": "String",
          "type": "String",
          "x": "Number",
          "y": "Number",
          "text": "String"
        }
      ]
    },
    "personalInfoText": "String (JSON stringified)"
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
  "companyId": "String",
  "taskName": "String",
  "imageData": "String (base64 encoded image)",
  "flowData": {
    "icons": [
      {
        "id": "String",
        "type": "String",
        "x": "Number",
        "y": "Number",
        "text": "String"
      }
    ]
  },
  "personalInfoText": "String (JSON stringified)"
}
```

**Response:**
```json
{
  "taskName": "String",
  "imageData": "String (base64 encoded image)",
  "flowData": {
    "icons": [
      {
        "id": "String",
        "type": "String",
        "x": "Number",
        "y": "Number",
        "text": "String"
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
  "String (taskName)": {
    "collection": [
      {
        "id": "String",
        "detailTask": "String",
        "collectionTarget": "String",
        "collectionPath": "String",
        "collectionSystem": "String",
        "collectionItem": "String",
        "collectionPeriod": "String",
        "collectionManager": "String",
        "collectionBasis": "String",
        "isOnline": "Boolean",
        "isEncrypted": "Boolean"
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
  "companyId": "String",
  "data": {
    "String (taskName)": {
      "collection": [
        {
          "id": "String",
          "detailTask": "String",
          "collectionTarget": "String",
          "collectionPath": "String",
          "collectionSystem": "String",
          "collectionItem": "String",
          "collectionPeriod": "String",
          "collectionManager": "String",
          "collectionBasis": "String",
          "isOnline": "Boolean",
          "isEncrypted": "Boolean"
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
  "String (taskName)": {
    "collection": [
      {
        "id": "String",
        "detailTask": "String",
        "collectionTarget": "String",
        "collectionPath": "String",
        "collectionSystem": "String",
        "collectionItem": "String",
        "collectionPeriod": "String",
        "collectionManager": "String",
        "collectionBasis": "String",
        "isOnline": "Boolean",
        "isEncrypted": "Boolean"
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
  "String (key: taskName-no)": {
    "relatedLaw": "String",
    "riskFactor": "String",
    "improvementPlan": "String"
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
  "companyId": "String",
  "improvements": {
    "String (key: taskName-no)": {
      "relatedLaw": "String",
      "riskFactor": "String",
      "improvementPlan": "String"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "String"
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
  "String (key: taskName-no)": {
    "taskName": "String",
    "code": "String",
    "actionPlan": "String",
    "actionPeriod": "String",
    "department": "String",
    "manager": "String",
    "actionDate": "String (date format)"
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
  "companyId": "String",
  "actionPlans": {
    "String (key: taskName-no)": {
      "taskName": "String",
      "code": "String",
      "actionPlan": "String",
      "actionPeriod": "String",
      "department": "String",
      "manager": "String",
      "actionDate": "String (date format)"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "String"
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
    "id": "Number",
    "name": "String",
    "companyId": "String",
    "createdAt": "String (ISO 8601 format)"
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
  "companyId": "String",
  "targetName": "String"
}
```

**Response:**
```json
{
  "id": "Number",
  "name": "String",
  "companyId": "String",
  "createdAt": "String (ISO 8601 format)"
}
```

#### 8.1.3 검토 대상 수정
```
PUT /security/targets/{id}
```

**Request Body:**
```json
{
  "targetName": "String"
}
```

**Response:**
```json
{
  "id": "Number",
  "name": "String",
  "companyId": "String",
  "updatedAt": "String (ISO 8601 format)"
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
  "message": "String"
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
    "id": "Number",
    "targetName": "String",
    "field": "String",
    "subField": "String",
    "no": "String",
    "item": "String",
    "status": "String (이행|부분이행|미이행|해당없음)",
    "evidence": "String",
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
  "companyId": "String",
  "targetName": "String",
  "data": [
    {
      "id": "Number",
      "targetName": "String",
      "field": "String",
      "subField": "String",
      "no": "String",
      "item": "String",
      "status": "String (이행|부분이행|미이행|해당없음)",
      "evidence": "String",
      "files": []
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "String"
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
  "String (key: targetName-no)": {
    "relatedLaw": "String",
    "riskFactor": "String",
    "improvementPlan": "String"
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
  "companyId": "String",
  "improvements": {
    "String (key: targetName-no)": {
      "relatedLaw": "String",
      "riskFactor": "String",
      "improvementPlan": "String"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "String"
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
  "String (key: targetName-no)": {
    "targetName": "String",
    "code": "String",
    "actionPlan": "String",
    "actionPeriod": "String",
    "department": "String",
    "manager": "String",
    "actionDate": "String (date format)"
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
  "companyId": "String",
  "actionPlans": {
    "String (key: targetName-no)": {
      "targetName": "String",
      "code": "String",
      "actionPlan": "String",
      "actionPeriod": "String",
      "department": "String",
      "manager": "String",
      "actionDate": "String (date format)"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "String"
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
    "id": "Number",
    "name": "String",
    "companyId": "String",
    "createdAt": "String (ISO 8601 format)"
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
  "companyId": "String",
  "systemName": "String"
}
```

**Response:**
```json
{
  "id": "Number",
  "name": "String",
  "companyId": "String",
  "createdAt": "String (ISO 8601 format)"
}
```

#### 9.1.3 시스템 수정
```
PUT /technical/systems/{id}
```

**Request Body:**
```json
{
  "systemName": "String"
}
```

**Response:**
```json
{
  "id": "Number",
  "name": "String",
  "companyId": "String",
  "updatedAt": "String (ISO 8601 format)"
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
  "message": "String"
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
    "id": "Number",
    "systemName": "String",
    "field": "String",
    "subField": "String",
    "no": "String",
    "item": "String",
    "status": "String (이행|부분이행|미이행|해당없음)",
    "evidence": "String",
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
  "companyId": "String",
  "systemName": "String",
  "data": [
    {
      "id": "Number",
      "systemName": "String",
      "field": "String",
      "subField": "String",
      "no": "String",
      "item": "String",
      "status": "String (이행|부분이행|미이행|해당없음)",
      "evidence": "String",
      "files": []
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "String"
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
  "String (key: systemName-no)": {
    "relatedLaw": "String",
    "riskFactor": "String",
    "improvementPlan": "String"
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
  "companyId": "String",
  "improvements": {
    "String (key: systemName-no)": {
      "relatedLaw": "String",
      "riskFactor": "String",
      "improvementPlan": "String"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "String"
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
  "String (key: systemName-no)": {
    "systemName": "String",
    "code": "String",
    "question": "String",
    "evidence": "String",
    "improvementGuide": "String",
    "actionPlan": "String",
    "actionPeriod": "String",
    "department": "String",
    "manager": "String",
    "actionDate": "String (date format)"
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
  "companyId": "String",
  "actionPlans": [
    {
      "systemName": "String",
      "code": "String",
      "actionPlan": "String",
      "actionPeriod": "String",
      "department": "String",
      "manager": "String",
      "actionDate": "String (date format)"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "String"
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
  "fileUrl": "String (URL format)",
  "fileName": "String",
  "fileSize": "Number",
  "uploadedAt": "String (ISO 8601 format)"
}
```

### 10.2 파일 삭제
```
DELETE /files
```

**Request Body:**
```json
{
  "fileUrl": "String (URL format)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "String"
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
  params: { companyId: 'String' }
});

// POST 요청
const response = await apiClient.post('/tasks', {
  taskName: 'String',
  purpose: 'String',
  personalInfo: 'String',
  department: 'String'
});

// PUT 요청
const response = await apiClient.put('/tasks/1', {
  taskName: 'String'
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
    "id": "String",
    "password": "String",
    "role": "super_admin"
  },
  "developer": {
    "id": "String",
    "password": "String",
    "role": "user"
  },
  "privacy": {
    "id": "String",
    "password": "String",
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
