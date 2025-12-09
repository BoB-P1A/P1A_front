// API 응답 타입 정의

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// 사용자 관련 타입
export interface LoginRequest {
    loginId: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface User {
    id: string;
    loginId: string;
    name: string;
    role: UserRole;
    company?: string;
}

export type UserRole = 'admin' | 'developer' | 'privacy-team' | 'planning-team';

// 계정 관련 타입
export interface Account {
    id: string;
    loginId: string;
    name: string;
    role: UserRole;
    company: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateAccountRequest {
    username: string;
    password: string;
    name: string;
    role: UserRole;
    company: string;
}

export interface UpdateAccountRequest extends Partial<CreateAccountRequest> {}

// 회사 관련 타입
export interface Company {
    id: string;
    name: string;
    contactName: string;
    contactPhone: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateCompanyRequest {
    name: string;
    contactName: string;
    contactPhone: string;
}

// 처리업무 관련 타입
export interface Task {
    id: number;
    taskName: string;
    purpose: string;
    personalInfo: string;
    department: string;
    companyId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateTaskRequest {
    taskName: string;
    purpose: string;
    personalInfo: string;
    department: string;
    companyId?: string;
}

// 평가 관련 타입
export interface Evaluation {
    id: number;
    title: string;
    type: string;
    status: 'pending' | 'in_progress' | 'completed';
    progress: number;
    createdAt: string;
    updatedAt?: string;
}

// 흐름도 관련 타입
export interface FlowChart {
    id: string;
    taskName: string;
    imageData: string;
    createdAt: string;
    updatedAt?: string;
}

export interface SaveFlowChartRequest {
    taskName: string;
    imageData: string;
}

// 파일 업로드 관련 타입
export interface FileUploadResponse {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    uploadedAt: string;
}

// 히스토리 로그 관련 타입 추가
export interface HistoryLog {
    _id: string;
    companyId: string;
    area: string;
    field: string;
    subField: string;
    no: string;
    item: string;
    evaluationType: 'lifecycle' | 'technical' | 'security';
    targetId: string;
    targetName: string;
    previousStatus: '이행' | '부분이행' | '미이행' | '해당없음';
    newStatus: '이행' | '부분이행' | '미이행' | '해당없음';
    previousEvidence: string;
    newEvidence: string;
    changedBy: {
        accountId: string;
        loginId: string;
        name: string;
    };
    changedAt: string;
    action?: {
        plan: string;
        department: string;
        owner: string;
        actionDate: string;
    };
}

export interface HistoryLogFilters {
    companyId: string;
    area?: string;
    no?: string;
    targetName?: string;
    previousStatus?: string;
    changedByName?: string;
    changedAtFrom?: string;
    changedAtTo?: string;
    page?: number;
    pageSize?: number;
}
