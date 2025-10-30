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
직접 데이터 객체 또는 배열 반환
```

### 에러 응답
```
{
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
  "token": String,          // JWT 토큰
  "user": {
    "id": String,           // MongoDB ObjectId
    "username": String,     // 로그인용 ID (Request의 id와 동일)
    "name": String,         // 사용자 실명
    "role": String,         // 권한 (admin | developer | privacy-team | planning-team)
    "company": String       // 소속 회사명
  }
}
```
- **Response (401 Unauthorized)**:
```
{
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
  "message": String           // "로그아웃되었습니다"
}
```

### 1.3 현재 사용자 정보
- **URL**: `/auth/me`
- **Method**: `GET`
- **Response (200 OK)**:
```
{
  "id": String,             // MongoDB ObjectId
  "username": String,       // 로그인용 ID
  "name": String,           // 사용자 실명
  "role": String,           // 권한
  "company": String         // 소속 회사명
}
```

---

## 2. 계정 관리 API

### 2.1 계정 목록 조회
- **URL**: `/accounts`
- **Method**: `GET`
- **Response (200 OK)**:
```
[
  {
    "id": String,           // MongoDB ObjectId
    "name": String,         // 사용자 실명
    "username": String,     // 로그인용 ID
    "role": String,         // 권한
    "company": String,      // 소속 회사명
    "createdAt": Date       // 생성일시 (ISO 8601)
  }
]
```

### 2.2 계정 상세 조회
- **URL**: `/accounts/{id}`
- **Method**: `GET`
- **Path Parameter**:
    - `id`: String (MongoDB ObjectId)
- **Response (200 OK)**:
```
{
  "id": String,             // MongoDB ObjectId
  "name": String,           // 사용자 실명
  "username": String,       // 로그인용 ID
  "role": String,           // 권한
  "company": String,        // 소속 회사명
  "createdAt": Date         // 생성일시 (ISO 8601)
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
  "id": String,             // 생성된 MongoDB ObjectId
  "name": String,           // 사용자 실명
  "username": String,       // 로그인용 ID
  "role": String,           // 권한
  "company": String,        // 소속 회사명
  "createdAt": Date,        // 생성일시 (ISO 8601)
}
```
- **Response (409 Conflict)**:
```
{
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
  "id": String,             // MongoDB ObjectId
  "name": String,           // 사용자 실명
  "username": String,       // 로그인용 ID
  "role": String,           // 권한
  "company": String,        // 소속 회사명
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
[
  {
    "id": String,          // Auto-increment 번호
    "name": String,         // 회사명
    "managerName": String,  // 담당자명
    "managerPhone": String, // 담당자 연락처
    "createdAt": Date       // 생성일시 (ISO 8601)
  }
]
```

### 3.2 회사 상세 조회
- **URL**: `/companies/{id}`
- **Method**: `GET`
- **Path Parameter**:
    - `id`: String
- **Response (200 OK)**:
```
{
  "id": String,            // Auto-increment 번호
  "name": String,           // 회사명
  "managerName": String,    // 담당자명
  "managerPhone": String,   // 담당자 연락처
  "createdAt": Date         // 생성일시 (ISO 8601)
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
  "id": String,            // 생성된 Auto-increment 번호
  "name": String,           // 회사명
  "managerName": String,    // 담당자명
  "managerPhone": String,   // 담당자 연락처
  "createdAt": Date,        // 생성일시 (ISO 8601)
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
  "id": String,            // Auto-increment 번호
  "name": String,           // 회사명
  "managerName": String,    // 담당자명
  "managerPhone": String,   // 담당자 연락처
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
[
  {
    "id": Integer,          // Auto-increment 번호
    "companyId": String,    // 회사 ID
    "taskName": String,     // 업무명
    "purpose": String,      // 업무 목적
    "personalInfo": String, // 처리하는 개인정보
    "department": String,   // 담당 부서
  }
]
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
  "id": Integer,            // 생성된 Auto-increment 번호
  "companyId": String,      // 회사 ID
  "taskName": String,       // 업무명
  "purpose": String,        // 업무 목적
  "personalInfo": String,   // 처리하는 개인정보
  "department": String,     // 담당 부서
}
```

### 4.3 처리업무 수정
- **URL**: `/tasks/{id}`
- **Method**: `PUT`
- **Path Parameter**:
    - `id`: Integer
- **Request Body**:
```json
{
  "taskName": String,         // 업무명 (선택)
  "purpose": String,          // 업무 목적 (선택)
  "personalInfo": String,     // 처리하는 개인정보 (선택)
  "department": String        // 담당 부서 (선택)
}
```
- **Response (200 OK)**:
```json
{
  "id": Integer,            // Auto-increment 번호
  "companyId": String,      // 회사 ID (변경 불가)
  "taskName": String,       // 업무명
  "purpose": String,        // 업무 목적
  "personalInfo": String,   // 처리하는 개인정보
  "department": String      // 담당 부서
}
```
- **Response (404 Not Found)**:
```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "처리업무를 찾을 수 없습니다"
  }
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
- **Response (404 Not Found)**:
```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "처리업무를 찾을 수 없습니다"
  }
}
```

### 4.5 처리업무 일괄 수정
- **URL**: `/tasks/bulk`
- **Method**: `PUT`
- **Request Body**:
```json
[
  {
    "id": Integer,            // 수정할 업무 번호 (필수)
    "taskName": String,       // 업무명 (선택)
    "purpose": String,        // 업무 목적 (선택)
    "personalInfo": String,   // 처리하는 개인정보 (선택)
    "department": String      // 담당 부서 (선택)
  }
]
```
- **Response (200 OK)**:
```json
{
  "updatedCount": Integer,    // 수정된 항목 수
  "failed": [                 // 실패한 항목 (선택)
    {
      "id": Integer,
      "reason": String
    }
  ]
}
```

---

## 5. 평가항목 관리 API

### 5.1 평가항목 목록 조회
- **URL**: `/evaluations`
- **Method**: `GET`
- **Query Parameters**:
    - `companyId`: String (필수) - 회사 ID
    - `taskId`: Integer (선택) - 업무별 필터링
    - `status[]`: Array (선택) - 상태 필터 배열
- **Response (200 OK)**:
```
[
  {
    "id": Integer,          // Auto-increment 번호
    "companyId": String,    // 회사 ID
    "taskId": Integer,      // 업무 ID
    "field": String,        // 분야
    "subField": String,     // 세부분야
    "no": String,           // 평가항목 번호
    "item": String,         // 평가항목 내용
    "status": String,       // "이행" | "부분이행" | "미이행" | "해당없음"
    "evidence": String,     // 평가 근거 및 의견
    "files": Array          // 증적자료 배열
  }
]
```

### 5.2 평가항목 저장
- **URL**: `/evaluations`
- **Method**: `POST`
- **Request Body**:
```
{
  "companyId": String,        // 회사 ID (필수)
  "taskId": Integer,          // 업무 ID (필수)
  "data": [
    {
      "field": String,        // 분야
      "subField": String,     // 세부분야
      "no": String,           // 평가항목 번호
      "item": String,         // 평가항목 내용
      "status": String,       // 평가 상태
      "evidence": String,     // 평가 근거 및 의견
      "files": Array          // 증적자료 배열
    }
  ]
}
```
- **Response (200 OK)**:
```
{
  "message": String           // "평가가 저장되었습니다"
}
```

---

## 6. 파일 관리 API

### 6.1 파일 업로드
- **URL**: `/files/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Request Body (Form Data)**:
```json
{
  "file": File,       // (필수) 업로드할 파일
  "folder": String    // (선택) S3 폴더 경로
}
```
- **Response (200 OK)**:
```json
{
  "fileUrl": String,      // S3 파일 URL
  "fileName": String,     // 파일명
  "fileSize": Number,     // 파일 크기 (bytes)
  "contentType": String   // MIME 타입
}
```
- **Response (400 Bad Request)**:
```json
{
  "error": String,    // 에러 코드
  "message": String   // 에러 메시지
}
```

### 6.2 파일 삭제
- **URL**: `/files`
- **Method**: `DELETE`
- **Request Body**:
```json
{
  "fileUrl": String   // (필수) 삭제할 파일 URL
}
```
- **Response (200 OK)**:
```json
{
  "message": String   // 성공 메시지
}
```

---

## 7. 생애주기 관리 API

### 7.1 흐름도 조회
- **URL**: `/lifecycle/flowcharts`
- **Method**: `GET`
- **Query Parameters**:
    - `companyId`: String (필수)
- **Response (200 OK)**:
```json
[
  {
    "companyId": String,        // 회사 ID
    "taskName": String,         // 업무명
    "imageData": String,        // Base64 encoded SVG
    "flowData": {
      "icons": [
        {
          "id": String,           // 아이콘 ID
          "type": String,         // 아이콘 타입
          "x": Number,            // X 좌표
          "y": Number,            // Y 좌표
          "text": String          // 표시 텍스트
        }
      ]
    },
    "personalInfoText": String, // JSON 문자열 형태의 개인정보 텍스트
    "createdAt": String,        // ISO 8601
    "updatedAt": String         // ISO 8601
  }
]
```

### 7.2 흐름도 저장
- **URL**: `/lifecycle/flowcharts`
- **Method**: `POST`
- **Request Body**:
```json
{
  "companyId": String,          // (필수) 회사 ID
  "taskName": String,           // (필수) 업무명
  "imageData": String,          // (필수) Base64 encoded SVG
  "flowData": Object,           // (선택) 흐름도 데이터
  "personalInfoText": String    // (선택) 개인정보 설명
}
```
- **Response (200 OK)**:
```json
{
  "message": String,    // 성공 메시지
  "flowData": Object    // 저장된 흐름도 데이터
}
```

### 7.3 흐름표 조회
- **URL**: `/lifecycle/flowtables`
- **Method**: `GET`
- **Query Parameters**:
    - `companyId`: String (필수)
- **Response (200 OK)**:
```json
{
  "[taskName]": {
    "collection": [
      {
        "id": String,                    // ID
        "detailTask": String,            // 세부업무명
        "collectionTarget": String,      // 수집대상
        "collectionPath": String,        // 수집경로
        "collectionSystem": String,      // 수집시스템
        "collectionItem": String,        // 수집항목
        "collectionItemName": String,    // 수집항목명칭
        "collectionPurpose": String,     // 수집목적
        "collectionDepartment": String,  // 수집부서
        "isOnline": String,              // 온라인여부 (True/False)
        "isEncrypted": String            // 암호화여부 (True/False/Unknown)
      }
    ],
    "storage": [
      {
        "id": String,                    // ID
        "detailTask": String,            // 세부업무명
        "storageSpace": String,          // 보유공간
        "collectionSystem": String,      // 수집시스템
        "storageItem": String,           // 보유항목
        "storageItemName": String,       // 보유항목명칭
        "storagePurpose": String,        // 보유목적
        "storageFormat": String,         // 보유형태
        "encryptionItem": String,        // 암호화항목
        "isOnline": String,              // 온라인여부 (True/False)
        "isEncrypted": String            // 암호화여부 (True/False/Unknown)
      }
    ],
    "usage": [
      {
        "id": String,                    // ID
        "detailTask": String,            // 세부업무명
        "storageSpace": String,          // 보유공간
        "usageSystem": String,           // 이용시스템
        "usageItem": String,             // 이용항목
        "usageItemName": String,         // 이용항목명칭
        "usagePurpose": String,          // 이용목적
        "usageMethod": String,           // 이용방법
        "usageDepartment": String,       // 이용부서
        "isOnline": String,              // 온라인여부 (True/False)
        "isEncrypted": String            // 암호화여부 (True/False/Unknown)
      }
    ],
    "provision": [
      {
        "id": String,                    // ID
        "detailTask": String,            // 세부업무명
        "storageSpace": String,          // 보유공간
        "linkageSystem": String,         // 연계시스템
        "provisionDepartment": String,   // 제공부서
        "recipient": String,             // 수신자
        "provisionItem": String,         // 제공항목
        "provisionItemName": String,     // 제공항목명칭
        "provisionPurpose": String,      // 제공목적
        "provisionMethod": String,       // 제공방법
        "linkageSystemOnline": String,   // 연계시스템온라인 (True/False)
        "linkageSystemEncrypted": String,// 연계시스템암호화 (True/False/Unknown)
        "recipientOnline": String,       // 수신자온라인 (True/False)
        "recipientEncrypted": String     // 수신자암호화 (True/False/Unknown)
      }
    ],
    "disposal": [
      {
        "id": String,                    // ID
        "detailTask": String,            // 세부업무명
        "storageSpace": String,          // 보유공간
        "disposalSystem": String,        // 파기시스템
        "disposalItem": String,          // 파기항목
        "disposalItemName": String,      // 파기항목명칭
        "retentionPeriod": String,       // 보관기간
        "disposalDepartment": String,    // 파기부서
        "disposalProcedure": String,     // 파기절차
        "disposalOnline": String         // 온라인여부 (True/False)
      }
    ]
  }
}
```

### 7.4 흐름표 저장
- **URL**: `/lifecycle/flowtables`
- **Method**: `POST`
- **Request Body**:
```json
{
  "companyId": String,    // (필수) 회사 ID
  "data": {
    "[taskName]": {
      "collection": Array,    // CollectionData 배열
      "storage": Array,       // StorageData 배열
      "usage": Array,         // UsageData 배열
      "provision": Array,     // ProvisionData 배열
      "disposal": Array       // DisposalData 배열
    }
  }
}
```
- **Response (200 OK)**:
```json
{
  "[taskName]": {
    "collection": Array,    // CollectionData 배열
    "storage": Array,       // StorageData 배열
    "usage": Array,         // UsageData 배열
    "provision": Array,     // ProvisionData 배열
    "disposal": Array       // DisposalData 배열
  }
}
```

---

### 7.5 생명주기 체크리스트 조회
- **URL**: `/lifecycle/checklists`
- **Method**: `GET`
- **Query Parameters**:
    - `companyId`: String (필수) - 회사 ID
    - `status[]`: Array (선택) - 상태 필터 배열
- **Response (200 OK)**:
```
[
  {
    "id": Integer,          // 평가항목 ID
    "companyId": String,    // 회사 ID
    "field": String,        // 분야
    "subField": String,     // 세부분야
    "no": String,           // 평가항목 번호
    "item": String,         // 평가항목 내용
    "status": String,       // "이행" | "부분이행" | "미이행" | "해당없음"
    "evidence": String,     // 평가 근거 및 의견
    "files": Array          // 증적자료 배열
  }
]
```

### 7.6 생명주기 체크리스트 저장
- **URL**: `/lifecycle/checklists`
- **Method**: `POST`
- **Request Body**:
```
{
  "companyId": String,        // 회사 ID (필수)
  "data": Array               // 체크리스트 데이터 (필수)
}
```
- **Response (200 OK)**:
```
{
  "message": String           // "체크리스트가 저장되었습니다"
}
```

### 7.7 생명주기 개선가이드 조회
- **URL**: `/lifecycle/improvements`
- **Method**: `GET`
- **Query Parameters**:
    - `companyId`: String (필수) - 회사 ID
- **Response (200 OK)**:
```
{
  // Key: 평가항목 번호, Value: 개선사항 객체
  "[key: string]": {
    "relatedLaw": String,
    "riskFactor": String,
    "improvementPlan": String
  }
}
```

### 7.8 생명주기 개선가이드 저장
- **URL**: `/lifecycle/improvements`
- **Method**: `POST`
- **Request Body**:
```
{
  "companyId": String,
  "improvements": {
    // Key: 평가항목 번호, Value: 개선사항 객체
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
  "message": String           // "개선사항이 저장되었습니다"
}
```

### 7.9 생명주기 조치계획 조회
- **URL**: `/lifecycle/action-plans`
- **Method**: `GET`
- **Query Parameters**:
    - `companyId`: String (필수) - 회사 ID
- **Response (200 OK)**:
```
{
  // Key: 평가항목 번호, Value: 조치계획 객체
  "[key: string]": {
    "actionPlan": String,
    "actionPeriod": String,
    "department": String,
    "manager": String,
    "actionDate": String
  }
}
```

### 7.10 생명주기 조치계획 저장
- **URL**: `/lifecycle/action-plans`
- **Method**: `POST`
- **Request Body**:
```
{
  "companyId": String,
  "actionPlans": {
    // Key: 평가항목 번호, Value: 조치계획 객체
    "[key: string]": {
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
  "message": String           // "조치계획이 저장되었습니다"
}
```

---

## 8. 기술적 조치 API

### 8.1 시스템 목록 조회
- **URL**: `/technical/systems`
- **Method**: `GET`
- **Query Parameters**:
    - `companyId`: String (필수) - 회사 ID
- **Response (200 OK)**:
```
[
  {
    "id": Integer,          // Auto-increment 번호
    "companyId": String,    // 회사 ID
    "systemName": String,   // 시스템명
  }
]
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
  "id": Integer,            // 생성된 Auto-increment 번호
  "companyId": String,      // 회사 ID
  "systemName": String,     // 시스템명
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
  "id": Integer,            // Auto-increment 번호
  "systemName": String,     // 시스템명
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
[
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
  // Key: "systemName-no" 형식, Value: 개선사항 객체
  "[key: string]": {
    "relatedLaw": String,
    "riskFactor": String,
    "improvementPlan": String
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
  // Key: "systemName-no" 형식, Value: 조치계획 객체
  "[key: string]": {
    "actionPlan": String,
    "actionPeriod": String,
    "department": String,
    "manager": String,
    "actionDate": String
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
[
  {
    "id": Integer,          // Auto-increment 번호
    "companyId": String,    // 회사 ID
    "targetName": String,   // 검토 대상명
  }
]
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
  "id": Integer,            // 생성된 Auto-increment 번호
  "companyId": String,      // 회사 ID
  "targetName": String,     // 검토 대상명
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
  "id": Integer,            // Auto-increment 번호
  "targetName": String,     // 검토 대상명
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
[
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
  // Key: "targetName-no" 형식, Value: 개선사항 객체
  "[key: string]": {
    "relatedLaw": String,
    "riskFactor": String,
    "improvementPlan": String
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
  // Key: "targetName-no" 형식, Value: 조치계획 객체
  "[key: string]": {
    "actionPlan": String,
    "actionPeriod": String,
    "department": String,
    "manager": String,
    "actionDate": String
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
  "message": String           // "조치계획이 저장되었습니다"
}
```

---