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
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  company?: string;
}

export type UserRole = 'admin' | 'developer' | 'privacy-team' | 'planning-team';

// 계정 관련 타입
export interface Account {
  id: string;
  username: string;
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
  managerName: string;
  managerPhone: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCompanyRequest {
  name: string;
  managerName: string;
  managerPhone: string;
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
