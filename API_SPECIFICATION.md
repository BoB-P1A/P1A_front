# EPIA 백엔드 API 명세서 v2.1

## 기본 정보

- **Base URL**: `http://localhost:8080/api`
- **인증 방식**: JWT Bearer Token
- **Content-Type**: `application/json`
- **Database**: MongoDB
- **File Storage**: AWS S3
- **Timeout**: 10000ms

---

## 공통 응답 형식

### 성공 응답

```json
{
  "success": boolean,
  "data": object,
  "message": string
}
```

### 에러 응답

```json
{
  "success": boolean,
  "error": string,
  "code": string
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
  "id": string,
  "password": string
}
```

**Response:**

```json
{
  "token": string,
  "user": {
    "id": string,
    "name": string,
    "role": string,
    "company": string
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
  "success": boolean,
  "message": string
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
  "id": string,
  "name": string,
  "role": string,
  "company": string
}
```

---

## 2. 계정 관리 API

### 2.1 계정 목록 조회

```
GET /accounts
```

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
[
  {
    "id": string,
    "name": string,
    "username": string,
    "role": string,
    "company": string,
    "createdAt": string
  }
]
```

### 2.2 계정 조회

```
GET /accounts/{id}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
  "id": string,
  "name": string,
  "username": string,
  "role": string,
  "company": string,
  "createdAt": string
}
```

### 2.3 계정 생성

```
POST /accounts
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "name": string,
  "username": string,
  "password": string,
  "role": string,
  "company": string
}
```

**Response:**

```json
{
  "id": string,
  "name": string,
  "username": string,
  "role": string,
  "company": string,
  "createdAt": string
}
```

### 2.4 계정 수정

```
PUT /accounts/{id}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "name": string,
  "username": string,
  "password": string,
  "role": string,
  "company": string
}
```

**Response:**

```json
{
  "id": string,
  "name": string,
  "username": string,
  "role": string,
  "company": string,
  "createdAt": string
}
```

### 2.5 계정 삭제

```
DELETE /accounts/{id}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": boolean,
  "message": string
}
```

---

## 3. 회사 관리 API

### 3.1 회사 목록 조회

```
GET /companies
```

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
[
  {
    "id": string,
    "name": string,
    "managerName": string,
    "managerPhone": string,
    "status": string,
    "createdAt": string
  }
]
```

### 3.2 회사 조회

```
GET /companies/{id}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
  "id": string,
  "name": string,
  "managerName": string,
  "managerPhone": string,
  "status": string,
  "createdAt": string
}
```

### 3.3 회사 생성

```
POST /companies
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "name": string,
  "managerName": string,
  "managerPhone": string
}
```

**Response:**

```json
{
  "id": string,
  "name": string,
  "managerName": string,
  "managerPhone": string,
  "status": string,
  "createdAt": string
}
```

### 3.4 회사 수정

```
PUT /companies/{id}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "name": string,
  "managerName": string,
  "managerPhone": string
}
```

**Response:**

```json
{
  "id": string,
  "name": string,
  "managerName": string,
  "managerPhone": string,
  "status": string,
  "createdAt": string
}
```

### 3.5 회사 삭제

```
DELETE /companies/{id}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": boolean,
  "message": string
}
```

---

## 4. 처리업무 관리 API

### 4.1 처리업무 목록 조회

```
GET /tasks?companyId={companyId}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

- `companyId`: string (선택)

**Response:**

```json
[
  {
    "id": number,
    "taskName": string,
    "purpose": string,
    "personalInfo": string,
    "department": string,
    "companyId": string
  }
]
```

### 4.2 처리업무 생성

```
POST /tasks
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "taskName": string,
  "purpose": string,
  "personalInfo": string,
  "department": string,
  "companyId": string
}
```

**Response:**

```json
{
  "id": number,
  "taskName": string,
  "purpose": string,
  "personalInfo": string,
  "department": string,
  "companyId": string
}
```

### 4.3 처리업무 수정

```
PUT /tasks/{id}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "taskName": string,
  "purpose": string,
  "personalInfo": string,
  "department": string
}
```

**Response:**

```json
{
  "id": number,
  "taskName": string,
  "purpose": string,
  "personalInfo": string,
  "department": string,
  "companyId": string
}
```

### 4.4 처리업무 삭제

```
DELETE /tasks/{id}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": boolean,
  "message": string
}
```

### 4.5 처리업무 일괄 수정

```
PUT /tasks/bulk
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
[
  {
    "id": number,
    "taskName": string,
    "purpose": string,
    "personalInfo": string,
    "department": string
  }
]
```

**Response:**

```json
{
  "success": boolean,
  "message": string
}
```

---

## 5. 평가항목 관리 API

### 5.1 평가항목 목록 조회

```
GET /evaluations
```

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
[
  {
    "id": number,
    "area": string,
    "field": string,
    "subField": string,
    "no": string,
    "item": string
  }
]
```

### 5.2 평가항목 조회

```
GET /evaluations/{id}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
  "id": number,
  "area": string,
  "field": string,
  "subField": string,
  "no": string,
  "item": string
}
```

### 5.3 평가항목 생성

```
POST /evaluations
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "area": string,
  "field": string,
  "subField": string,
  "no": string,
  "item": string
}
```

**Response:**

```json
{
  "id": number,
  "area": string,
  "field": string,
  "subField": string,
  "no": string,
  "item": string
}
```

### 5.4 평가항목 수정

```
PUT /evaluations/{id}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "area": string,
  "field": string,
  "subField": string,
  "no": string,
  "item": string
}
```

**Response:**

```json
{
  "id": number,
  "area": string,
  "field": string,
  "subField": string,
  "no": string,
  "item": string
}
```

### 5.5 평가항목 삭제

```
DELETE /evaluations/{id}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": boolean,
  "message": string
}
```

---

## 6. 생애주기 관리 API

### 6.1 처리업무 목록 조회 (생애주기용)

```
GET /lifecycle/tasks?companyId={companyId}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

- `companyId`: string (필수)

**Response:**

```json
[
  {
    "id": number,
    "taskName": string,
    "purpose": string,
    "personalInfo": string,
    "department": string
  }
]
```

### 6.2 생애주기 체크리스트 조회

```
GET /lifecycle/lifecycle?companyId={companyId}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

- `companyId`: string (필수)

**Response:**

```json
[
  {
    "id": number,
    "taskName": string,
    "field": string,
    "subField": string,
    "no": string,
    "item": string,
    "status": string | null,
    "evidence": string,
    "files": [
      {
        "name": string,
        "url": string,
        "type": string
      }
    ]
  }
]
```

### 6.3 생애주기 체크리스트 저장

```
POST /lifecycle/lifecycle
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "companyId": string,
  "taskName": string,
  "data": [
    {
      "id": number,
      "taskName": string,
      "field": string,
      "subField": string,
      "no": string,
      "item": string,
      "status": string | null,
      "evidence": string,
      "files": [
        {
          "name": string,
          "url": string,
          "type": string
        }
      ]
    }
  ]
}
```

**Response:**

```json
{
  "success": boolean,
  "message": string
}
```

### 6.4 흐름도 목록 조회

```
GET /lifecycle/flowcharts?companyId={companyId}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

- `companyId`: string (필수)

**Response:**

```json
[
  {
    "taskName": string,
    "imageData": string,
    "flowData": {
      "icons": [
        {
          "id": string,
          "type": string,
          "x": number,
          "y": number,
          "text": string
        }
      ]
    },
    "personalInfoText": string
  }
]
```

### 6.5 흐름도 저장

```
POST /lifecycle/flowcharts
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "companyId": string,
  "taskName": string,
  "imageData": string,
  "flowData": {
    "icons": [
      {
        "id": string,
        "type": string,
        "x": number,
        "y": number,
        "text": string
      }
    ]
  },
  "personalInfoText": string
}
```

**Response:**

```json
{
  "taskName": string,
  "imageData": string,
  "flowData": {
    "icons": [
      {
        "id": string,
        "type": string,
        "x": number,
        "y": number,
        "text": string
      }
    ]
  }
}
```

### 6.6 흐름표 조회

```
GET /lifecycle/flowtables?companyId={companyId}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

- `companyId`: string (필수)

**Response:**

```json
{
  "{taskName}": {
    "collection": [
      {
        "id": string,
        "detailTask": string,
        "collectionTarget": string,
        "collectionPath": string,
        "collectionSystem": string,
        "collectionItem": string,
        "collectionItemName": string,
        "collectionPeriod": string,
        "collectionManager": string,
        "collectionBasis": string,
        "isOnline": string,
        "isEncrypted": string
      }
    ],
    "storage": [
      {
        "id": string,
        "detailTask": string,
        "inputSystem": string,
        "storageSpace": string,
        "storageItem": string,
        "storageItemName": string,
        "encryptionItem": string,
        "isOnline": string,
        "isEncrypted": string
      }
    ],
    "usage": [
      {
        "id": string,
        "detailTask": string,
        "storageSpace": string,
        "usageSystem": string,
        "usageItem": string,
        "usageItemName": string,
        "usagePurpose": string,
        "usageMethod": string,
        "personalInfoHandler": string,
        "isOnline": string,
        "isEncrypted": string
      }
    ],
    "provision": [
      {
        "id": string,
        "detailTask": string,
        "storageSpace": string,
        "provisionSystem": string,
        "provider": string,
        "recipient": string,
        "provisionItem": string,
        "provisionItemName": string,
        "provisionPurpose": string,
        "provisionMethod": string,
        "provisionPeriod": string,
        "encryptionMethod": string,
        "provisionBasis": string,
        "provisionSystemOnline": string,
        "provisionSystemEncrypted": string,
        "recipientOnline": string,
        "recipientEncrypted": string
      }
    ],
    "disposal": [
      {
        "id": string,
        "detailTask": string,
        "storageSpace": string,
        "disposalSystem": string,
        "disposalItem": string,
        "disposalItemName": string,
        "retentionPeriod": string,
        "disposalManager": string,
        "disposalProcedure": string,
        "separateStorageSpace": string,
        "separateStorageEncryptionItem": string,
        "disposalOnline": string,
        "hasSeparateStorage": string,
        "separateStorageOnline": string,
        "separateStorageEncrypted": string
      }
    ]
  }
}
```

### 6.7 흐름표 저장

```
POST /lifecycle/flowtables
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "companyId": string,
  "data": {
    "{taskName}": {
      "collection": [
        {
          "id": string,
          "detailTask": string,
          "collectionTarget": string,
          "collectionPath": string,
          "collectionSystem": string,
          "collectionItem": string,
          "collectionItemName": string,
          "collectionPeriod": string,
          "collectionManager": string,
          "collectionBasis": string,
          "isOnline": string,
          "isEncrypted": string
        }
      ],
      "storage": [
        {
          "id": string,
          "detailTask": string,
          "inputSystem": string,
          "storageSpace": string,
          "storageItem": string,
          "storageItemName": string,
          "encryptionItem": string,
          "isOnline": string,
          "isEncrypted": string
        }
      ],
      "usage": [
        {
          "id": string,
          "detailTask": string,
          "storageSpace": string,
          "usageSystem": string,
          "usageItem": string,
          "usageItemName": string,
          "usagePurpose": string,
          "usageMethod": string,
          "personalInfoHandler": string,
          "isOnline": string,
          "isEncrypted": string
        }
      ],
      "provision": [
        {
          "id": string,
          "detailTask": string,
          "storageSpace": string,
          "provisionSystem": string,
          "provider": string,
          "recipient": string,
          "provisionItem": string,
          "provisionItemName": string,
          "provisionPurpose": string,
          "provisionMethod": string,
          "provisionPeriod": string,
          "encryptionMethod": string,
          "provisionBasis": string,
          "provisionSystemOnline": string,
          "provisionSystemEncrypted": string,
          "recipientOnline": string,
          "recipientEncrypted": string
        }
      ],
      "disposal": [
        {
          "id": string,
          "detailTask": string,
          "storageSpace": string,
          "disposalSystem": string,
          "disposalItem": string,
          "disposalItemName": string,
          "retentionPeriod": string,
          "disposalManager": string,
          "disposalProcedure": string,
          "separateStorageSpace": string,
          "separateStorageEncryptionItem": string,
          "disposalOnline": string,
          "hasSeparateStorage": string,
          "separateStorageOnline": string,
          "separateStorageEncrypted": string
        }
      ]
    }
  }
}
```

**Response:**

```json
{
  "{taskName}": {
    "collection": array,
    "storage": array,
    "usage": array,
    "provision": array,
    "disposal": array
  }
}
```

### 6.8 개선가이드 조회

```
GET /lifecycle/improvements?companyId={companyId}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

- `companyId`: string (필수)

**Response:**

```json
{
  "{taskName}-{no}": {
    "relatedLaw": string,
    "riskFactor": string,
    "improvementPlan": string
  }
}
```

### 6.9 개선가이드 저장

```
POST /lifecycle/improvements
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "companyId": string,
  "improvements": {
    "{taskName}-{no}": {
      "relatedLaw": string,
      "riskFactor": string,
      "improvementPlan": string
    }
  }
}
```

**Response:**

```json
{
  "success": boolean,
  "message": string
}
```

### 6.10 조치계획 조회

```
GET /lifecycle/action-plans?companyId={companyId}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

- `companyId`: string (필수)

**Response:**

```json
{
  "{taskName}-{no}": {
    "taskName": string,
    "code": string,
    "question": string,
    "evidence": string,
    "improvementGuide": string,
    "actionPlan": string,
    "actionPeriod": string,
    "department": string,
    "manager": string,
    "actionDate": string
  }
}
```

### 6.11 조치계획 저장

```
POST /lifecycle/action-plans
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "companyId": string,
  "actionPlans": {
    "{taskName}-{no}": {
      "taskName": string,
      "code": string,
      "actionPlan": string,
      "actionPeriod": string,
      "department": string,
      "manager": string,
      "actionDate": string
    }
  }
}
```

**Response:**

```json
{
  "success": boolean,
  "message": string
}
```

---

## 7. 보안성 검토 API

### 7.1 검토대상 목록 조회

```
GET /security/targets?companyId={companyId}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

- `companyId`: string (필수)

**Response:**

```json
[
  {
    "id": number,
    "name": string,
    "companyId": string
  }
]
```

### 7.2 검토대상 생성

```
POST /security/targets
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "companyId": string,
  "targetName": string
}
```

**Response:**

```json
{
  "id": number,
  "name": string,
  "companyId": string
}
```

### 7.3 검토대상 수정

```
PUT /security/targets/{id}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "targetName": string
}
```

**Response:**

```json
{
  "id": number,
  "name": string,
  "companyId": string
}
```

### 7.4 검토대상 삭제

```
DELETE /security/targets/{id}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": boolean,
  "message": string
}
```

### 7.5 보안성 체크리스트 조회

```
GET /security/checklists?companyId={companyId}&status[]={status}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

- `companyId`: string (필수)
- `status[]`: string (선택)

**Response:**

```json
[
  {
    "id": number,
    "targetName": string,
    "field": string,
    "subField": string,
    "no": string,
    "item": string,
    "status": string | null,
    "evidence": string,
    "files": [
      {
        "name": string,
        "url": string,
        "type": string
      }
    ]
  }
]
```

### 7.6 보안성 체크리스트 저장

```
POST /security/checklists
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "companyId": string,
  "targetName": string,
  "data": [
    {
      "id": number,
      "targetName": string,
      "field": string,
      "subField": string,
      "no": string,
      "item": string,
      "status": string | null,
      "evidence": string,
      "files": array
    }
  ]
}
```

**Response:**

```json
{
  "success": boolean,
  "message": string
}
```

### 7.7 보안성 개선가이드 조회

```
GET /security/improvements?companyId={companyId}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

- `companyId`: string (필수)

**Response:**

```json
{
  "{targetName}-{no}": {
    "relatedLaw": string,
    "riskFactor": string,
    "improvementPlan": string
  }
}
```

### 7.8 보안성 개선가이드 저장

```
POST /security/improvements
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "companyId": string,
  "improvements": {
    "{targetName}-{no}": {
      "relatedLaw": string,
      "riskFactor": string,
      "improvementPlan": string
    }
  }
}
```

**Response:**

```json
{
  "success": boolean,
  "message": string
}
```

### 7.9 보안성 조치계획 조회

```
GET /security/action-plans?companyId={companyId}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

- `companyId`: string (필수)

**Response:**

```json
{
  "{targetName}-{no}": {
    "targetName": string,
    "code": string,
    "question": string,
    "evidence": string,
    "improvementGuide": string,
    "actionPlan": string,
    "actionPeriod": string,
    "department": string,
    "manager": string,
    "actionDate": string
  }
}
```

### 7.10 보안성 조치계획 저장

```
POST /security/action-plans
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "companyId": string,
  "actionPlans": {
    "{targetName}-{no}": {
      "targetName": string,
      "code": string,
      "actionPlan": string,
      "actionPeriod": string,
      "department": string,
      "manager": string,
      "actionDate": string
    }
  }
}
```

**Response:**

```json
{
  "success": boolean,
  "message": string
}
```

---

## 8. 기술적 보호조치 API

### 8.1 시스템 목록 조회

```
GET /technical/systems?companyId={companyId}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

- `companyId`: string (필수)

**Response:**

```json
[
  {
    "id": number,
    "name": string,
    "companyId": string
  }
]
```

### 8.2 시스템 생성

```
POST /technical/systems
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "companyId": string,
  "systemName": string
}
```

**Response:**

```json
{
  "id": number,
  "name": string,
  "companyId": string
}
```

### 8.3 시스템 수정

```
PUT /technical/systems/{id}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "systemName": string
}
```

**Response:**

```json
{
  "id": number,
  "name": string,
  "companyId": string
}
```

### 8.4 시스템 삭제

```
DELETE /technical/systems/{id}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": boolean,
  "message": string
}
```

### 8.5 기술적 체크리스트 조회

```
GET /technical/checklists?companyId={companyId}&status[]={status}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

- `companyId`: string (필수)
- `status[]`: string (선택)

**Response:**

```json
[
  {
    "id": number,
    "systemName": string,
    "field": string,
    "subField": string,
    "no": string,
    "item": string,
    "status": string | null,
    "evidence": string,
    "files": [
      {
        "name": string,
        "url": string,
        "type": string
      }
    ],
    "improvementGuide": string
  }
]
```

### 8.6 기술적 체크리스트 저장

```
POST /technical/checklists
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "companyId": string,
  "systemName": string,
  "data": [
    {
      "id": number,
      "systemName": string,
      "field": string,
      "subField": string,
      "no": string,
      "item": string,
      "status": string | null,
      "evidence": string,
      "files": array
    }
  ]
}
```

**Response:**

```json
{
  "success": boolean,
  "message": string
}
```

### 8.7 기술적 개선가이드 조회

```
GET /technical/improvements?companyId={companyId}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

- `companyId`: string (필수)

**Response:**

```json
{
  "{systemName}-{no}": {
    "relatedLaw": string,
    "riskFactor": string,
    "improvementPlan": string
  }
}
```

### 8.8 기술적 개선가이드 저장

```
POST /technical/improvements
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "companyId": string,
  "improvements": {
    "{systemName}-{no}": {
      "relatedLaw": string,
      "riskFactor": string,
      "improvementPlan": string
    }
  }
}
```

**Response:**

```json
{
  "success": boolean,
  "message": string
}
```

### 8.9 기술적 조치계획 조회

```
GET /technical/action-plans?companyId={companyId}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

- `companyId`: string (필수)

**Response:**

```json
{
  "{systemName}-{no}": {
    "systemName": string,
    "code": string,
    "question": string,
    "evidence": string,
    "improvementGuide": string,
    "actionPlan": string,
    "actionPeriod": string,
    "department": string,
    "manager": string,
    "actionDate": string
  }
}
```

### 8.10 기술적 조치계획 저장

```
POST /technical/action-plans
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "companyId": string,
  "actionPlans": [
    {
      "systemName": string,
      "code": string,
      "question": string,
      "evidence": string,
      "improvementGuide": string,
      "actionPlan": string,
      "actionPeriod": string,
      "department": string,
      "manager": string,
      "actionDate": string
    }
  ]
}
```

**Response:**

```json
{
  "success": boolean,
  "message": string
}
```

---

## 9. 파일 관리 API

### 9.1 파일 업로드

```
POST /files/upload
```

**Headers:**

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

- `file`: File (필수)
- `folder`: string (선택)

**Response:**

```json
{
  "fileUrl": string,
  "fileName": string,
  "fileSize": number,
  "uploadedAt": string
}
```

### 9.2 파일 삭제

```
DELETE /files
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "fileUrl": string
}
```

**Response:**

```json
{
  "success": boolean,
  "message": string
}
```

---

## 10. 에러 코드

| 코드                    | 설명                    |
| ----------------------- | ----------------------- |
| `INVALID_CREDENTIALS`   | 잘못된 인증 정보        |
| `TOKEN_EXPIRED`         | 토큰 만료               |
| `UNAUTHORIZED`          | 인증되지 않은 사용자    |
| `FORBIDDEN`             | 권한 없음               |
| `NOT_FOUND`             | 리소스를 찾을 수 없음   |
| `DUPLICATE_ENTRY`       | 중복된 데이터           |
| `VALIDATION_ERROR`      | 데이터 유효성 검증 실패 |
| `FILE_TOO_LARGE`        | 파일 크기 초과 (10MB)   |
| `UNSUPPORTED_FILE_TYPE` | 지원하지 않는 파일 형식 |
| `SERVER_ERROR`          | 서버 오류               |

---

## 11. 데이터 타입 정의

### UserRole

```typescript
type UserRole = "admin" | "developer" | "privacy-team" | "planning-team"
```

### Status (평가 상태)

```typescript
type Status = "이행" | "부분이행" | "미이행" | "해당없음" | null
```

### CompanyStatus

```typescript
type CompanyStatus = "active" | "inactive"
```

---

## 12. 보안 요구사항

### JWT 토큰

- 모든 API 요청에 Bearer Token 필요 (로그인 제외)
- 토큰 만료 시간: 24시간
- 토큰 저장: sessionStorage

### CORS 설정

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 파일 업로드 제한

- 최대 파일 크기: 10MB
- 허용 파일 형식: PDF, JPG, PNG, DOCX, XLSX
- S3 버킷 정책: 비공개, 사전 서명 URL 사용

---

## 13. MongoDB 스키마 예시

### User Collection

```javascript
{
  "_id": ObjectId,
  "name": String,
  "username": String,
  "password": String (hashed),
  "role": String,
  "company": String,
  "createdAt": Date,
  "updatedAt": Date
}
```

### Task Collection

```javascript
{
  "_id": ObjectId,
  "taskId": Number (auto-increment),
  "taskName": String,
  "purpose": String,
  "personalInfo": String,
  "department": String,
  "companyId": String,
  "createdAt": Date,
  "updatedAt": Date
}
```

### LifecycleChecklist Collection

```javascript
{
  "_id": ObjectId,
  "companyId": String,
  "taskName": String,
  "items": [
    {
      "id": Number,
      "field": String,
      "subField": String,
      "no": String,
      "item": String,
      "status": String,
      "evidence": String,
      "files": Array
    }
  ],
  "createdAt": Date,
  "updatedAt": Date
}
```

### FlowTables Collection

```javascript
{
  "_id": ObjectId,
  "companyId": String,
  "taskName": String,
  "collection": [
    {
      "id": String,
      "detailTask": String,
      "collectionTarget": String,
      "collectionPath": String,
      "collectionSystem": String,
      "collectionItem": String,
      "collectionItemName": String,
      "collectionPeriod": String,
      "collectionManager": String,
      "collectionBasis": String,
      "isOnline": String,
      "isEncrypted": String
    }
  ],
  "storage": [
    {
      "id": String,
      "detailTask": String,
      "inputSystem": String,
      "storageSpace": String,
      "storageItem": String,
      "storageItemName": String,
      "encryptionItem": String,
      "isOnline": String,
      "isEncrypted": String
    }
  ],
  "usage": [
    {
      "id": String,
      "detailTask": String,
      "storageSpace": String,
      "usageSystem": String,
      "usageItem": String,
      "usageItemName": String,
      "usagePurpose": String,
      "usageMethod": String,
      "personalInfoHandler": String,
      "isOnline": String,
      "isEncrypted": String
    }
  ],
  "provision": [
    {
      "id": String,
      "detailTask": String,
      "storageSpace": String,
      "provisionSystem": String,
      "provider": String,
      "recipient": String,
      "provisionItem": String,
      "provisionItemName": String,
      "provisionPurpose": String,
      "provisionMethod": String,
      "provisionPeriod": String,
      "encryptionMethod": String,
      "provisionBasis": String,
      "provisionSystemOnline": String,
      "provisionSystemEncrypted": String,
      "recipientOnline": String,
      "recipientEncrypted": String
    }
  ],
  "disposal": [
    {
      "id": String,
      "detailTask": String,
      "storageSpace": String,
      "disposalSystem": String,
      "disposalItem": String,
      "disposalItemName": String,
      "retentionPeriod": String,
      "disposalManager": String,
      "disposalProcedure": String,
      "separateStorageSpace": String,
      "separateStorageEncryptionItem": String,
      "disposalOnline": String,
      "hasSeparateStorage": String,
      "separateStorageOnline": String,
      "separateStorageEncrypted": String
    }
  ],
  "createdAt": Date,
  "updatedAt": Date
}
```

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
