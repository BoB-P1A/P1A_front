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

## 6. 관리 체크리스트 API

### 6.1 관리적 체크리스트 조회
- **URL**: `/admin/checklists`
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

### 6.2 관리적 체크리스트 저장
- **URL**: `/admin/checklists`
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

### 6.3 관리적 개선가이드 조회
- **URL**: `/admin/improvements`
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

### 6.4 관리적 개선가이드 저장
- **URL**: `/admin/improvements`
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

### 6.5 관리적 조치계획 조회
- **URL**: `/admin/action-plans`
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

### 6.6 관리적 조치계획 저장
- **URL**: `/admin/action-plans`
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

## 7. 생명주기 체크리스트 API

### 7.1 생명주기 체크리스트 조회
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

### 7.2 생명주기 체크리스트 저장
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

### 7.3 생명주기 개선가이드 조회
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

### 7.4 생명주기 개선가이드 저장
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

### 7.5 생명주기 조치계획 조회
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

### 7.6 생명주기 조치계획 저장
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
  "message": String         // "시스템이 등록되었습니다"
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
  "message": String         // "시스템이 수정되었습니다"
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
  "message": String         // "검토 대상이 등록되었습니다"
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
  "message": String         // "검토 대상이 수정되었습니다"
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