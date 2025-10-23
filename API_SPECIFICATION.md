# EPIA 시스템 API 명세서 (최종 완성본)

## 개요

- **프로젝트명**: EPIA (개인정보 영향평가 관리 플랫폼)
- **백엔드**: Java, Spring Boot, MongoDB
- **Base URL**: `http://localhost:8080/api`
- **인증**: JWT Bearer Token

---

## ID 타입 설명

```
사용자(users):
- id: String (MongoDB ObjectId) - 사용자 고유 ID
- username: String - 로그인할 때 사용하는 ID
- 로그인 요청 시 "id" 필드는 username을 의미함

회사(companies):
- id: String (Auto-increment) - 회사 고유 번호

처리업무(tasks):
- id: Integer (Auto-increment) - 업무 고유 번호

평가항목(evaluations):
- id: Integer (Auto-increment) - 평가항목 고유 번호

보안대상(security_targets):
- id: Integer (Auto-increment) - 보안대상 고유 번호

시스템(technical_systems):
- id: Integer (Auto-increment) - 시스템 고유 번호
```

---

## 공통 응답 형식

### 성공 응답

```
{
  "success": Boolean,
  "data": Object,
  "message": String
}
```

### 에러 응답

```
{
  "success": Boolean,
  "error": {
    "code": String,
    "message": String
  }
}
```

### 모든 Date 타입은 ISO 8601 형식 사용

예시: "2025-01-15T09:30:00Z"

---

## 1. 인증 API

### 1.1 로그인

- **URL**: `/auth/login`
- **Method**: `POST`
- **Request Body**:

```
{
  "id": String,        // 로그인용 username (예: "admin")
  "password": String   // 비밀번호
}
```

- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": {
    "token": String,          // JWT 토큰
    "user": {
      "id": String,           // MongoDB ObjectId
      "username": String,     // 로그인용 ID (Request의 id와 동일)
      "name": String,         // 사용자 실명
      "role": String,         // 권한 (admin | developer | privacy-team | planning-team)
      "company": String       // 소속 회사명
    }
  }
}
```

- **Response (401 Unauthorized)**:

```
{
  "success": Boolean,
  "error": {
    "code": String,           // "INVALID_CREDENTIALS"
    "message": String         // "아이디 또는 비밀번호를 확인해주세요."
  }
}
```

### 1.2 로그아웃

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "message": String           // "로그아웃되었습니다"
}
```

### 1.3 현재 사용자 정보

- **URL**: `/auth/me`
- **Method**: `GET`
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": {
    "id": String,             // MongoDB ObjectId
    "username": String,       // 로그인용 ID
    "name": String,           // 사용자 실명
    "role": String,           // 권한
    "company": String         // 소속 회사명
  }
}
```

---

## 2. 계정 관리 API

### 2.1 계정 목록 조회

- **URL**: `/accounts`
- **Method**: `GET`
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": [
    {
      "id": String,           // MongoDB ObjectId
      "name": String,         // 사용자 실명
      "username": String,     // 로그인용 ID
      "role": String,         // 권한
      "company": String,      // 소속 회사명
      "createdAt": Date       // 생성일시 (ISO 8601)
    }
  ]
}
```

### 2.2 계정 상세 조회

- **URL**: `/accounts/{id}`
- **Method**: `GET`
- **Path Parameter**:
  - `id`: String (MongoDB ObjectId)
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": {
    "id": String,             // MongoDB ObjectId
    "name": String,           // 사용자 실명
    "username": String,       // 로그인용 ID
    "role": String,           // 권한
    "company": String,        // 소속 회사명
    "createdAt": Date         // 생성일시 (ISO 8601)
  }
}
```

### 2.3 계정 생성

- **URL**: `/accounts`
- **Method**: `POST`
- **Request Body**:

```
{
  "name": String,             // 사용자 실명 (필수)
  "username": String,         // 로그인용 ID (필수, unique)
  "password": String,         // 비밀번호 (필수, 최소 8자)
  "role": String,             // 권한 (필수, enum)
  "company": String           // 소속 회사명 (필수)
}
```

- **Response (201 Created)**:

```
{
  "success": Boolean,
  "data": {
    "id": String,             // 생성된 MongoDB ObjectId
    "name": String,           // 사용자 실명
    "username": String,       // 로그인용 ID
    "role": String,           // 권한
    "company": String,        // 소속 회사명
    "createdAt": Date         // 생성일시 (ISO 8601)
  },
  "message": String           // "계정이 생성되었습니다"
}
```

- **Response (409 Conflict)**:

```
{
  "success": Boolean,
  "error": {
    "code": String,           // "DUPLICATE_USERNAME"
    "message": String         // "이미 사용중인 아이디입니다"
  }
}
```

### 2.4 계정 수정

- **URL**: `/accounts/{id}`
- **Method**: `PUT`
- **Path Parameter**:
  - `id`: String (MongoDB ObjectId)
- **Request Body**:

```
{
  "name": String,             // 사용자 실명
  "username": String,         // 로그인용 ID (중복 체크 필요)
  "role": String,             // 권한
  "company": String,          // 소속 회사명
  "password": String          // 새 비밀번호
}
```

- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": {
    "id": String,             // MongoDB ObjectId
    "name": String,           // 사용자 실명
    "username": String,       // 로그인용 ID
    "role": String,           // 권한
    "company": String         // 소속 회사명
  },
  "message": String           // "계정이 수정되었습니다"
}
```

### 2.5 계정 삭제

- **URL**: `/accounts/{id}`
- **Method**: `DELETE`
- **Path Parameter**:
  - `id`: String (MongoDB ObjectId)
- **Response (204 No Content)**:

```
No Content
```

---

## 3. 회사 관리 API

### 3.1 회사 목록 조회

- **URL**: `/companies`
- **Method**: `GET`
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": [
    {
      "id": String,          // Auto-increment 번호
      "name": String,         // 회사명
      "managerName": String,  // 담당자명
      "managerPhone": String, // 담당자 연락처
      "createdAt": Date       // 생성일시 (ISO 8601)
    }
  ]
}
```

### 3.2 회사 상세 조회

- **URL**: `/companies/{id}`
- **Method**: `GET`
- **Path Parameter**:
  - `id`: String
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": {
    "id": String,            // Auto-increment 번호
    "name": String,           // 회사명
    "managerName": String,    // 담당자명
    "managerPhone": String,   // 담당자 연락처
    "createdAt": Date         // 생성일시 (ISO 8601)
  }
}
```

### 3.3 회사 생성

- **URL**: `/companies`
- **Method**: `POST`
- **Request Body**:

```
{
  "name": String,             // 회사명 (필수, unique)
  "managerName": String,      // 담당자명 (필수)
  "managerPhone": String      // 담당자 연락처 (필수)
}
```

- **Response (201 Created)**:

```
{
  "success": Boolean,
  "data": {
    "id": String,            // 생성된 Auto-increment 번호
    "name": String,           // 회사명
    "managerName": String,    // 담당자명
    "managerPhone": String,   // 담당자 연락처
    "createdAt": Date         // 생성일시 (ISO 8601)
  },
  "message": String           // "회사가 등록되었습니다"
}
```

### 3.4 회사 수정

- **URL**: `/companies/{id}`
- **Method**: `PUT`
- **Path Parameter**:
  - `id`: String
- **Request Body**:

```
{
  "name": String,             // 회사명 (선택)
  "managerName": String,      // 담당자명 (선택)
  "managerPhone": String      // 담당자 연락처 (선택)
}
```

- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": {
    "id": String,            // Auto-increment 번호
    "name": String,           // 회사명
    "managerName": String,    // 담당자명
    "managerPhone": String    // 담당자 연락처
  },
  "message": String           // "회사 정보가 수정되었습니다"
}
```

### 3.5 회사 삭제

- **URL**: `/companies/{id}`
- **Method**: `DELETE`
- **Path Parameter**:
  - `id`: String
- **Response (204 No Content)**:

```
No Content
```

---

## 4. 처리업무 관리 API

### 4.1 처리업무 목록 조회

- **URL**: `/tasks`
- **Method**: `GET`
- **Query Parameters**:
  - `companyId`: String (선택) - 회사별 필터링
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": [
    {
      "id": Integer,          // Auto-increment 번호
      "companyId": String,    // 회사 ID
      "taskName": String,     // 업무명
      "purpose": String,      // 업무 목적
      "personalInfo": String, // 처리하는 개인정보
      "department": String,   // 담당 부서
    }
  ]
}
```

### 4.2 처리업무 생성

- **URL**: `/tasks`
- **Method**: `POST`
- **Request Body**:

```
{
  "companyId": String,        // 회사 ID (필수)
  "taskName": String,         // 업무명 (필수)
  "purpose": String,          // 업무 목적 (필수)
  "personalInfo": String,     // 처리하는 개인정보 (필수)
  "department": String        // 담당 부서 (필수)
}
```

- **Response (201 Created)**:

```
{
  "success": Boolean,
  "data": {
    "id": Integer,            // 생성된 Auto-increment 번호
    "companyId": String,      // 회사 ID
    "taskName": String,       // 업무명
    "purpose": String,        // 업무 목적
    "personalInfo": String,   // 처리하는 개인정보
    "department": String,     // 담당 부서
  },
  "message": String           // "처리업무가 등록되었습니다"
}
```

### 4.3 처리업무 수정

- **URL**: `/tasks/{id}`
- **Method**: `PUT`
- **Path Parameter**:
  - `id`: Integer
- **Request Body**:

```
{
  "taskName": String,         // 업무명 (선택)
  "purpose": String,          // 업무 목적 (선택)
  "personalInfo": String,     // 처리하는 개인정보 (선택)
  "department": String        // 담당 부서 (선택)
}
```

- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": {
    "id": Integer,            // Auto-increment 번호
    "companyId": String,      // 회사 ID
    "taskName": String,       // 업무명
    "purpose": String,        // 업무 목적
    "personalInfo": String,   // 처리하는 개인정보
    "department": String      // 담당 부서
  },
  "message": String           // "처리업무가 수정되었습니다"
}
```

### 4.4 처리업무 삭제

- **URL**: `/tasks/{id}`
- **Method**: `DELETE`
- **Path Parameter**:
  - `id`: Integer
- **Response (204 No Content)**:

```
No Content
```

### 4.5 처리업무 일괄 수정

- **URL**: `/tasks/bulk`
- **Method**: `PUT`
- **Request Body**:

```
[
  {
    "id": Integer,            // 수정할 업무 번호 (필수)
    "taskName": String,       // 업무명
    "purpose": String,        // 업무 목적
    "personalInfo": String,   // 처리하는 개인정보
    "department": String      // 담당 부서
  }
]
```

- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": {
    "updatedCount": Integer   // 수정된 항목 수
  },
  "message": String           // "N개 업무가 수정되었습니다"
}
```

---

## 5. 평가항목 관리 API

### 5.1 평가항목 목록 조회

- **URL**: `/evaluations`
- **Method**: `GET`
- **Query Parameters**:
  - `companyId`: String (필수) - 회사 ID
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": [
    {
      "id": Integer,          // Auto-increment 번호
      "companyId": String,    // 회사 ID
      "area": String,         // 영역 (예: "1. 개인정보 처리단계별 보호조치")
      "field": String,        // 분야 (예: "1.1. 수집")
      "subField": String,     // 세부분야
      "no": String,           // 평가항목 번호 (예: "1.1.1")
      "item": String          // 평가항목 내용
    }
  ]
}
```

### 5.2 평가항목 상세 조회

- **URL**: `/evaluations/{id}`
- **Method**: `GET`
- **Path Parameter**:
  - `id`: Integer
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": {
    "id": Integer,            // Auto-increment 번호
    "companyId": String,     // 회사 ID
    "area": String,           // 영역
    "field": String,          // 분야
    "subField": String,       // 세부분야
    "no": String,             // 평가항목 번호
    "item": String            // 평가항목 내용
  }
}
```

### 5.3 평가항목 생성

- **URL**: `/evaluations`
- **Method**: `POST`
- **Request Body**:

```
{
	"companyId": String,        // 회사 ID (필수)
  "area": String,             // 영역 (필수)
  "field": String,            // 분야 (필수)
  "subField": String,         // 세부분야 (필수)
  "no": String,               // 평가항목 번호 (필수, unique)
  "item": String              // 평가항목 내용 (필수)
}
```

- **Response (201 Created)**:

```
{
  "success": Boolean,
  "data": {
    "id": Integer,            // 생성된 Auto-increment 번호
    "companyId": String,      // 회사 ID
    "area": String,           // 영역
    "field": String,          // 분야
    "subField": String,       // 세부분야
    "no": String,             // 평가항목 번호
    "item": String            // 평가항목 내용
  },
  "message": String           // "평가항목이 등록되었습니다"
}
```

### 5.4 평가항목 수정

- **URL**: `/evaluations/{id}`
- **Method**: `PUT`
- **Path Parameter**:
  - `id`: Integer
- **Request Body**:

```
{
  "area": String,             // 영역 (선택)
  "field": String,            // 분야 (선택)
  "subField": String,         // 세부분야 (선택)
  "no": String,               // 평가항목 번호 (선택)
  "item": String              // 평가항목 내용 (선택)
}
```

- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": {
    "id": Integer,            // Auto-increment 번호
    "companyId": String,      // 회사 ID
    "area": String,           // 영역
    "field": String,          // 분야
    "subField": String,       // 세부분야
    "no": String,             // 평가항목 번호
    "item": String            // 평가항목 내용
  },
  "message": String           // "평가항목이 수정되었습니다"
}
```

### 5.5 평가항목 삭제

- **URL**: `/evaluations/{id}`
- **Method**: `DELETE`
- **Path Parameter**:
  - `id`: Integer
- **Response (204 No Content)**:

```
No Content
```

---

## 6. 파일 관리 API

### 6.1 파일 업로드

- **URL**: `/files/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Request Body (Form Data)**:
  - `file`: File (필수) - 업로드할 파일
  - `folder`: String (선택) - S3 폴더 경로
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": {
    "fileUrl": String,        // S3 파일 URL
    "fileName": String,       // 파일명
    "fileSize": Long,         // 파일 크기 (bytes)
    "contentType": String     // MIME 타입
  }
}
```

- **Response (400 Bad Request)**:

```
{
  "success": Boolean,
  "error": {
    "code": String,           // "FILE_SIZE_EXCEEDED"
    "message": String         // "파일 크기는 10MB를 초과할 수 없습니다"
  }
}
```

### 6.2 파일 삭제

- **URL**: `/files`
- **Method**: `DELETE`
- **Request Body**:

```
{
  "fileUrl": String           // 삭제할 파일 URL (필수)
}
```

- **Response (200 OK)**:

```
{
  "success": Boolean,
  "message": String           // "파일이 삭제되었습니다"
}
```

---

## 7. 생애주기 관련 API

### 7.1 처리업무 메뉴 조회

- **URL**: `/lifecycle/tasks`
- **Method**: `GET`
- **Query Parameters**:
  - `companyId`: String (필수) - 회사 ID
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": [
    {
      "id": Integer,          // Auto-increment 번호
      "taskName": String     // 업무명
    }
  ]
}
```

### 7.2 생애주기 체크리스트 조회

- **URL**: `/lifecycle/lifecycle`
- **Method**: `GET`
- **Query Parameters**:
  - `companyId`: String (필수) - 회사 ID
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": [
    {
      "id": Integer,          // 평가항목 ID
      "companyId": String,   // 회사 ID
      "taskName": String,     // 업무명
      "field": String,        // 분야
      "subField": String,     // 세부분야
      "no": String,           // 평가항목 번호
      "item": String,         // 평가항목 내용
      "status": String,       // "이행" | "부분이행" | "미이행" | "해당없음" | null
      "evidence": String,     // 평가 근거 및 의견
      "files": [
        {
          "name": String,     // 파일명
          "url": String,      // 파일 URL
          "type": String      // MIME 타입
        }
      ]
    }
  ]
}
```

### 7.3 생애주기 체크리스트 저장

- **URL**: `/lifecycle/lifecycle`
- **Method**: `POST`
- **Request Body**:

```
{
  "companyId": String,        // 회사 ID (필수)
  "taskName": String,         // 업무명 (필수)
  "data": [
    {
      "id": Integer,          // 평가항목 ID (필수)
      "field": String,        // 분야
      "subField": String,     // 세부분야
      "no": String,           // 평가항목 번호
      "item": String,         // 평가항목 내용
      "status": String,       // 평가 결과
      "evidence": String,     // 평가 근거 및 의견
      "files": Array          // 증적자료 배열
    }
  ]
}
```

- **Response (200 OK)**:

```
{
  "success": Boolean,
  "message": String           // "체크리스트가 저장되었습니다"
}
```

### 7.4 흐름도 조회

- **URL**: `/lifecycle/flowcharts`
- **Method**: `GET`
- **Query Parameters**:
  - `companyId`: String (필수) - 회사 ID
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": [
    {
      "companyId": String,    // 회사 ID
      "taskName": String,     // 업무명
      "imageData": String,    // Base64 encoded 이미지
      "flowData": Object,     // 흐름도 데이터 (JSON)
      "personalInfoText": String, // 개인정보 설명
      "createdAt": Date,      // 생성일시 (ISO 8601)
      "updatedAt": Date       // 수정일시 (ISO 8601)
    }
  ]
}
```

### 7.5 흐름도 저장

- **URL**: `/lifecycle/flowcharts`
- **Method**: `POST`
- **Request Body**:

```
{
  "companyId": String,        // 회사 ID (필수)
  "taskName": String,         // 업무명 (필수)
  "imageData": String,        // Base64 encoded 이미지 (필수)
  "flowData": Object,         // 흐름도 데이터 (선택)
  "personalInfoText": String  // 개인정보 설명 (선택)
}
```

- **Response (200 OK)**:

```
{
  "success": Boolean,
  "message": String           // "흐름도가 저장되었습니다"
}
```

### 7.6 흐름표 조회

- **URL**: `/lifecycle/flowtables`
- **Method**: `GET`
- **Query Parameters**:
  - `companyId`: String (필수) - 회사 ID
- **Response (200 OK)**:
  {
  "success": Boolean,
  "data": {
  "[taskName]": {
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
  ]
  }
  }
  }

```

### 7.7 흐름표 저장
- **URL**: `/lifecycle/flowtables`
- **Method**: `POST`
- **Request Body**:
{
  "companyId": String,        // 회사 ID (필수)
  "data": {
    "[taskName]": {
      "collection": Array,    // 수집 단계 데이터
      "storage": Array,       // 보유 단계 데이터
      "usage": Array,         // 이용 단계 데이터
      "provision": Array,     // 제공 단계 데이터
      "disposal": Array       // 파기 단계 데이터
    }
  }
}
- **Response (200 OK)**:
{
  "success": Boolean,
  "message": String           // "흐름표가 저장되었습니다"
}
```

### 7.8 개선가이드 조회

- **URL**: `/lifecycle/improvements`
- **Method**: `GET`
- **Query Parameters**:
  - `companyId`: String (필수) - 회사 ID
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": {
    // Key: "taskName-no" 형식, Value: 개선사항 객체
    "[key: string]": {
      "relatedLaw": String,      // 관련 법률
      "riskFactor": String,       // 침해요인
      "improvementPlan": String   // 개선 가이드
    }
  }
}

```

### 7.9 개선가이드 저장

- **URL**: `/lifecycle/improvements`
- **Method**: `POST`
- **Request Body**:

```
{
  "companyId": String,
  "improvements": {
    // Key: "taskName-no" 형식, Value: 개선사항 객체
    "[key: string]": {
      "relatedLaw": String,      // 관련 법률
      "riskFactor": String,       // 침해요인
      "improvementPlan": String   // 개선 가이드
    }
  }
}
```

- **Response (200 OK)**:

```
{
  "success": Boolean,
  "message": String           // "개선사항이 저장되었습니다"
}
```

### 7.10 조치계획 조회

- **URL**: `/lifecycle/action-plans`
- **Method**: `GET`
- **Query Parameters**:
  - `companyId`: String (필수) - 회사 ID
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": {
    // Key: "taskName-no" 형식, Value: 조치계획 객체
    "[key: string]": {
      "actionPlan": String,        // 조치 방안
      "actionPeriod": String,      // 조치 기간
      "department": String,        // 부서
      "manager": String,           // 담당자
      "actionDate": String         // 조치 일시
    }
  }
}
```

### 7.11 조치계획 저장

- **URL**: `/lifecycle/action-plans`
- **Method**: `POST`
- **Request Body**:

```
{
  "companyId": String,
  "actionPlans": {
    // Key: "taskName-no" 형식, Value: 조치계획 객체
    "[key: string]": {
      "taskName": String,          // 업무명 (키 생성용)
      "code": String,              // 평가번호 (키 생성용)
      "actionPlan": String,
      "actionPeriod": String,
      "department": String,
      "manager": String,
      "actionDate": String
    }
  }
}
```

- **Response (200 OK)**:

```
{
  "success": Boolean,
  "message": String           // "조치계획이 저장되었습니다"
}
```

---

## 8. 기술적 보호조치 API

### 8.1 시스템 목록 조회

- **URL**: `/technical/systems`
- **Method**: `GET`
- **Query Parameters**:
  - `companyId`: String (필수) - 회사 ID
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": [
    {
      "id": Integer,          // Auto-increment 번호
      "companyId": String,    // 회사 ID
      "systemName": String,   // 시스템명
    }
  ]
}
```

### 8.2 시스템 생성

- **URL**: `/technical/systems`
- **Method**: `POST`
- **Request Body**:

```
{
  "companyId": String,        // 회사 ID (필수)
  "systemName": String        // 시스템명 (필수)
}
```

- **Response (201 Created)**:

```
{
  "success": Boolean,
  "data": {
    "id": Integer,            // 생성된 Auto-increment 번호
    "companyId": String,      // 회사 ID
    "systemName": String,     // 시스템명
  },
  "message": String           // "시스템이 등록되었습니다"
}
```

### 8.3 시스템 수정

- **URL**: `/technical/systems/{id}`
- **Method**: `PUT`
- **Path Parameter**:
  - `id`: Integer
- **Request Body**:

```
{
  "systemName": String        // 시스템명 (필수)
}
```

- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": {
    "id": Integer,            // Auto-increment 번호
    "systemName": String      // 시스템명
  },
  "message": String           // "시스템이 수정되었습니다"
}
```

### 8.4 시스템 삭제

- **URL**: `/technical/systems/{id}`
- **Method**: `DELETE`
- **Path Parameter**:
  - `id`: Integer
- **Response (204 No Content)**:

```
No Content
```

### 8.5 기술적 체크리스트 조회

- **URL**: `/technical/checklists`
- **Method**: `GET`
- **Query Parameters**:
  - `companyId`: String (필수) - 회사 ID
  - `status[]`: Array (선택) - 상태 필터 배열
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": [
    {
      "id": Integer,          // 평가항목 ID
      "companyId": String,    // 회사 ID
      "systemName": String,   // 시스템명
      "field": String,        // 분야
      "subField": String,     // 세부분야
      "no": String,           // 평가항목 번호
      "item": String,         // 평가항목 내용
      "status": String,       // "이행" | "부분이행" | "미이행" | "해당없음"
      "evidence": String,     // 평가 근거 및 의견
      "files": Array          // 증적자료 배열
    }
  ]
}
```

### 8.6 기술적 체크리스트 저장

- **URL**: `/technical/checklists`
- **Method**: `POST`
- **Request Body**:

```
{
  "companyId": String,        // 회사 ID (필수)
  "systemName": String,       // 시스템명 (필수)
  "data": Array               // 체크리스트 데이터 (필수)
}
```

- **Response (200 OK)**:

```
{
  "success": Boolean,
  "message": String           // "체크리스트가 저장되었습니다"
}
```

### 8.7 기술적 개선가이드 조회

- **URL**: `/technical/improvements`
- **Method**: `GET`
- **Query Parameters**:
  - `companyId`: String (필수) - 회사 ID
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": {
    // Key: "systemName-no" 형식, Value: 개선사항 객체
    "[key: string]": {
      "relatedLaw": String,
      "riskFactor": String,
      "improvementPlan": String
    }
  }
}
```

### 8.8 기술적 개선가이드 저장

- **URL**: `/technical/improvements`
- **Method**: `POST`
- **Request Body**:

```
{
  "companyId": String,
  "improvements": {
    // Key: "systemName-no" 형식, Value: 개선사항 객체
    "[key: string]": {
      "relatedLaw": String,
      "riskFactor": String,
      "improvementPlan": String
    }
  }
}
```

- **Response (200 OK)**:

```
{
  "success": Boolean,
  "message": String           // "개선사항이 저장되었습니다"
}
```

### 8.9 기술적 조치계획 조회

- **URL**: `/technical/action-plans`
- **Method**: `GET`
- **Query Parameters**:
  - `companyId`: String (필수) - 회사 ID
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": {
    // Key: "systemName-no" 형식, Value: 조치계획 객체
    "[key: string]": {
      "actionPlan": String,
      "actionPeriod": String,
      "department": String,
      "manager": String,
      "actionDate": String
    }
  }
}
```

### 8.10 기술적 조치계획 저장

- **URL**: `/technical/action-plans`
- **Method**: `POST`
- **Request Body**:

```
{
  "companyId": String,
  "actionPlans": {
	  // Key: "systemName-no" 형식, Value: 조치계획 객체
    "[key: string]": {
      "systemName": String,
      "code": String,
      "actionPlan": String,
      "actionPeriod": String,
      "department": String,
      "manager": String,
      "actionDate": String
    }
  }
}
```

- **Response (200 OK)**:

```
{
  "success": Boolean,
  "message": String           // "조치계획이 저장되었습니다"
}
```

---

## 9. 보안성 검토 API

### 9.1 검토대상 목록 조회

- **URL**: `/security/targets`
- **Method**: `GET`
- **Query Parameters**:
  - `companyId`: String (필수) - 회사 ID
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": [
    {
      "id": Integer,          // Auto-increment 번호
      "companyId": String,    // 회사 ID
      "targetName": String,   // 검토 대상명
    }
  ]
}
```

### 9.2 검토대상 생성

- **URL**: `/security/targets`
- **Method**: `POST`
- **Request Body**:

```
{
  "companyId": String,        // 회사 ID (필수)
  "targetName": String        // 검토 대상명 (필수)
}
```

- **Response (201 Created)**:

```
{
  "success": Boolean,
  "data": {
    "id": Integer,            // 생성된 Auto-increment 번호
    "companyId": String,      // 회사 ID
    "targetName": String,     // 검토 대상명
  },
  "message": String           // "검토 대상이 등록되었습니다"
}
```

### 9.3 검토대상 수정

- **URL**: `/security/targets/{id}`
- **Method**: `PUT`
- **Path Parameter**:
  - `id`: Integer
- **Request Body**:

```
{
  "targetName": String        // 검토 대상명 (필수)
}
```

- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": {
    "id": Integer,            // Auto-increment 번호
    "targetName": String      // 검토 대상명
  },
  "message": String           // "검토 대상이 수정되었습니다"
}
```

### 9.4 검토대상 삭제

- **URL**: `/security/targets/{id}`
- **Method**: `DELETE`
- **Path Parameter**:
  - `id`: Integer
- **Response (204 No Content)**:

```
No Content
```

### 9.5 보안 체크리스트 조회

- **URL**: `/security/checklists`
- **Method**: `GET`
- **Query Parameters**:
  - `companyId`: String (필수) - 회사 ID
  - `status[]`: Array (선택) - 상태 필터 배열
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": [
    {
      "id": Integer,          // 평가항목 ID
      "companyId": String,    // 회사 ID
      "targetName": String,   // 검토 대상명
      "field": String,        // 분야
      "subField": String,     // 세부분야
      "no": String,           // 평가항목 번호
      "item": String,         // 평가항목 내용
      "status": String,       // "이행" | "부분이행" | "미이행" | "해당없음"
      "evidence": String,     // 평가 근거 및 의견
      "files": Array          // 증적자료 배열
    }
  ]
}
```

### 9.6 보안 체크리스트 저장

- **URL**: `/security/checklists`
- **Method**: `POST`
- **Request Body**:

```
{
  "companyId": String,        // 회사 ID (필수)
  "targetName": String,       // 검토 대상명 (필수)
  "data": Array               // 체크리스트 데이터 (필수)
}
```

- **Response (200 OK)**:

```
{
  "success": Boolean,
  "message": String           // "체크리스트가 저장되었습니다"
}
```

### 9.7 보안 개선가이드 조회

- **URL**: `/security/improvements`
- **Method**: `GET`
- **Query Parameters**:
  - `companyId`: String (필수) - 회사 ID
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": {
    // Key: "targetName-no" 형식, Value: 개선사항 객체
    "[key: string]": {
      "relatedLaw": String,
      "riskFactor": String,
      "improvementPlan": String
    }
  }
}
```

### 9.8 보안 개선가이드 저장

- **URL**: `/security/improvements`
- **Method**: `POST`
- **Request Body**:

```
{
  "companyId": String,
  "improvements": {
    // Key: "targetName-no" 형식, Value: 개선사항 객체
    "[key: string]": {
      "relatedLaw": String,
      "riskFactor": String,
      "improvementPlan": String
    }
  }
}
```

- **Response (200 OK)**:

```
{
  "success": Boolean,
  "message": String           // "개선사항이 저장되었습니다"
}
```

### 9.9 보안 조치계획 조회

- **URL**: `/security/action-plans`
- **Method**: `GET`
- **Query Parameters**:
  - `companyId`: String (필수) - 회사 ID
- **Response (200 OK)**:

```
{
  "success": Boolean,
  "data": {
    // Key: "targetName-no" 형식, Value: 조치계획 객체
    "[key: string]": {
      "actionPlan": String,
      "actionPeriod": String,
      "department": String,
      "manager": String,
      "actionDate": String
    }
  }
}
```

### 9.10 보안 조치계획 저장

- **URL**: `/security/action-plans`
- **Method**: `POST`
- **Request Body**:

```
{
  "companyId": String,
  "actionPlans": {
    // Key: "targetName-no" 형식, Value: 조치계획 객체
    "[key: string]": {
      "targetName": String,
      "code": String,
      "actionPlan": String,
      "actionPeriod": String,
      "department": String,
      "manager": String,
      "actionDate": String
    }
  }
}
```

- **Response (200 OK)**:

```
{
  "success": Boolean,
  "message": String           // "조치계획이 저장되었습니다"
}
```

---

### HTTP 상태 코드

- `200 OK`: 요청 성공
- `201 Created`: 리소스 생성 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스 없음
- `500 Internal Server Error`: 서버 오류

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
