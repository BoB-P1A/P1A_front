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
  id: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  company?: string;
  department?: string;
}

export type UserRole = 'super_admin' | 'company_admin' | 'user';

// 계정 관련 타입
export interface Account {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  company: string;
  department: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAccountRequest {
  username: string;
  password: string;
  email: string;
  name: string;
  role: UserRole;
  company: string;
  department: string;
}

export interface UpdateAccountRequest extends Partial<CreateAccountRequest> {
  status?: 'active' | 'inactive';
}

// 회사 관련 타입
export interface Company {
  id: string;
  name: string;
  registrationNumber?: string;
  address?: string;
  ceoName?: string;
  accountCount?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCompanyRequest {
  name: string;
  registrationNumber?: string;
  address?: string;
  ceoName?: string;
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

export interface EvaluationRequest {
  id: number;
  title: string;
  requestor: string;
  department: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateEvaluationRequestRequest {
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
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
