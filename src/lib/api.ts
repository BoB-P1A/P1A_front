import axios from "axios";

// API 베이스 URL - 환경변수로 설정 (추후 실제 백엔드 URL로 변경)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

// Axios 인스턴스 생성
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

// 요청 인터셉터 - 인증 토큰 추가
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("auth-token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // 인증 실패 시 로그인 페이지로 리다이렉트
            localStorage.removeItem("auth-token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    },
);

// API 함수들
export const api = {
    // 인증 관련
    auth: {
        login: async (credentials: { loginId: string; password: string }) => {
            const response = await apiClient.post("/auth/login", credentials);
            return response.data;
        },
        logout: async () => {
            const response = await apiClient.post("/auth/logout");
            return response.data;
        },
        getCurrentUser: async () => {
            const response = await apiClient.get("/auth/me");
            return response.data;
        },
    },

    // 계정 관리
    accounts: {
        getAll: async () => {
            const response = await apiClient.get("/accounts");
            return response.data;
        },
        getById: async (id: string) => {
            const response = await apiClient.get(`/accounts/${id}`);
            return response.data;
        },
        create: async (account: any) => {
            const response = await apiClient.post("/accounts", account);
            return response.data;
        },
        update: async (id: string, account: any) => {
            const response = await apiClient.put(`/accounts/${id}`, account);
            return response.data;
        },
        delete: async (id: string) => {
            const response = await apiClient.delete(`/accounts/${id}`);
            return response.data;
        },
    },

    // 회사 관리
    companies: {
        getAll: async () => {
            const response = await apiClient.get("/companies");
            return response.data;
        },
        getById: async (id: string) => {
            const response = await apiClient.get(`/companies/${id}`);
            return response.data;
        },
        create: async (company: any) => {
            const response = await apiClient.post("/companies", company);
            return response.data;
        },
        update: async (id: string, company: any) => {
            const response = await apiClient.put(`/companies/${id}`, company);
            return response.data;
        },
        delete: async (id: string) => {
            const response = await apiClient.delete(`/companies/${id}`);
            return response.data;
        },
    },

    // 처리업무 관리
    tasks: {
        getAll: async (companyId?: string) => {
            const response = await apiClient.get("/tasks", {
                params: { companyId },
            });
            return response.data;
        },
        create: async (task: any) => {
            const response = await apiClient.post("/tasks", task);
            return response.data;
        },
        update: async (id: string, task: any) => {  // ← id를 string으로 변경
            const response = await apiClient.put(`/tasks/${id}`, task);
            return response.data;
        },
        delete: async (id: string) => {  // ← id를 string으로 변경
            const response = await apiClient.delete(`/tasks/${id}`);
            return response.data;
        },
        bulkSave: async (tasks: any[]) => {
            const response = await apiClient.post("/tasks/bulk", tasks);
            return response.data;
        },
    },

    // 평가 관리
    evaluations: {
        getAll: async (companyId?: string) => {
            const response = await apiClient.get("/evaluations", {
                params: { companyId },
            });
            return response.data;
        },
        getById: async (id: number) => {
            const response = await apiClient.get(`/evaluations/${id}`);
            return response.data;
        },
        create: async (evaluation: any) => {
            const response = await apiClient.post("/evaluations", evaluation);
            return response.data;
        },
        update: async (id: number, evaluation: any) => {
            const response = await apiClient.put(`/evaluations/${id}`, evaluation);
            return response.data;
        },
        delete: async (id: number) => {
            const response = await apiClient.delete(`/evaluations/${id}`);
            return response.data;
        },
    },

    // 파일 업로드 (AWS S3)
    files: {
        upload: async (file: File, folder?: string) => {
            const formData = new FormData();
            formData.append("file", file);
            if (folder) {
                formData.append("folder", folder);
            }
            const response = await apiClient.post("/files/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        },
        // 생애주기 전용 업로드 - S3 경로 구조화
        uploadLifecycle: async (
            file: File,
            companyId: string,
            taskId: string,
            no: string
        ) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("companyId", companyId);
            formData.append("category", "개인정보처리단계(Lifecycle)");
            formData.append("taskId", taskId);
            formData.append("no", no);
            const response = await apiClient.post("/files/upload/lifecycle", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        },
        // 기술적 보호조치 전용 업로드 - S3 경로 구조화
        uploadTechnical: async (
            file: File,
            companyId: string,
            systemId: string,
            no: string
        ) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("companyId", companyId);
            formData.append("category", "개인정보처리시스템(Admin)");
            formData.append("systemId", systemId);
            formData.append("no", no);
            const response = await apiClient.post("/files/upload/technical", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        },
        // 보안성 검토 전용 업로드 - S3 경로 구조화
        uploadSecurity: async (
            file: File,
            companyId: string,
            systemId: string,
            no: string
        ) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("companyId", companyId);
            formData.append("category", "보안성검토");
            formData.append("systemId", systemId);
            formData.append("no", no);
            const response = await apiClient.post("/files/upload/security", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        },
        // Pre-signed URL 받기
        getDownloadUrl: async (fileUrl: string) => {
            const response = await apiClient.get("/files/download", {
                params: { fileUrl },
            });
            return response.data;
        },
        delete: async (fileUrl: string) => {
            const response = await apiClient.delete("/files", {
                data: { fileUrl },
            });
            return response.data;
        },
    },

    // 생애주기 관련 API
    lifecycle: {
        tasks: {
            getAll: async (companyId: string) => {
                const response = await apiClient.get("/lifecycle/tasks", {
                    params: { companyId },
                });
                return response.data;
            },
        },
        checklists: {
            getAll: async (params: { companyId: string; taskId?: string; status?: string[] }) => {
                const response = await apiClient.get("/lifecycle/checklists", {
                    params,
                    paramsSerializer: {
                        indexes: null,
                    },
                });
                return response.data;
            },
            save: async (companyId: string, taskId: string, data: any[]) => {
                const response = await apiClient.post("/lifecycle/checklists", {
                    companyId,
                    taskId,
                    data,
                });
                return response.data;
            },
        },
        flowCharts: {
            // S3에서 개인정보 흐름도 이미지 목록 가져오기
            getAll: async (companyId: string) => {
                const response = await apiClient.get("/lifecycle/flowcharts/images", {
                    params: { companyId },
                });
                return response.data;
            },
            // 이미지 pre-signed URL 가져오기
            getImageUrl: async (companyId: string, taskId: string, fileName: string) => {
                const response = await apiClient.get("/lifecycle/flowcharts/image-url", {
                    params: { companyId, taskId, fileName },
                });
                return response.data;
            },
            // 이미지 바이너리 다운로드 (Word 생성용)
            getImageBytes: async (companyId: string, taskId: string, fileName: string) => {
                const response = await apiClient.get("/lifecycle/flowcharts/image-bytes", {
                    params: { companyId, taskId, fileName },
                    responseType: 'arraybuffer', // 바이너리 데이터로 받기
                });
                return response.data; // ArrayBuffer 반환
            },
            save: async (
                companyId: string,
                taskName: string,
                imageData: string,
                flowData?: any,
                personalInfoText?: string,
            ) => {
                const response = await apiClient.post("/lifecycle/flowcharts", {
                    companyId,
                    taskName,
                    imageData,
                    flowData,
                    personalInfoText,
                });
                return response.data;
            },
        },
        flowTables: {
            // companyId로 모든 processingTasks의 flow.sheets 데이터를 가져옴
            // 반환 형식: { taskId: { taskName, sheets: { collect: [], retain: [], ... } }, ... }
            getAll: async (companyId: string) => {
                const response = await apiClient.get("/lifecycle/flowtables", {
                    params: { companyId },
                });
                return response.data;
            },
            // taskId와 sheets 데이터를 저장
            save: async (companyId: string, taskId: string, sheets: any) => {
                const response = await apiClient.post("/lifecycle/flowtables", {
                    companyId,
                    taskId,
                    sheets,
                });
                return response.data;
            },
        },
        improvements: {
            getAll: async (companyId: string) => {
                const response = await apiClient.get("/lifecycle/improvements", {
                    params: { companyId },
                });
                return response.data;
            },
            save: async (companyId: string, improvements: any) => {
                const response = await apiClient.post("/lifecycle/improvements", {
                    companyId,
                    improvements,
                });
                return response.data;
            },
        },
        actionPlans: {
            getAll: async (companyId: string) => {
                const response = await apiClient.get("/lifecycle/action-plans", {
                    params: { companyId },
                });
                return response.data;
            },
            save: async (companyId: string, actionPlans: any) => {
                const response = await apiClient.post("/lifecycle/action-plans", {
                    companyId,
                    actionPlans,
                });
                return response.data;
            },
        },
    },

    // 보안 관련 API
    security: {
        targets: {
            getAll: async (companyId: string) => {
                const response = await apiClient.get("/security/targets", {
                    params: { companyId },
                });
                return response.data;
            },
            create: async (companyId: string, targetName: string) => {
                const response = await apiClient.post("/security/targets", {
                    companyId,
                    targetName,
                });
                return response.data;
            },
            update: async (id: string, targetName: string) => {
                const response = await apiClient.put(`/security/targets/${id}`, {
                    targetName,
                });
                return response.data;
            },
            delete: async (id: string) => {
                const response = await apiClient.delete(`/security/targets/${id}`);
                return response.data;
            },
        },
        checklists: {
            getAll: async (params: { companyId: string; systemId?: string; status?: string[] }) => {
                const response = await apiClient.get("/security/checklists", {
                    params,
                    paramsSerializer: {
                        indexes: null,
                    },
                });
                return response.data;
            },
            save: async (companyId: string, systemId: string, data: any[]) => {
                const response = await apiClient.post("/security/checklists", {
                    companyId,
                    systemId,
                    data,
                });
                return response.data;
            },
        },
        improvements: {
            getAll: async (companyId: string) => {
                const response = await apiClient.get("/security/improvements", {
                    params: { companyId },
                });
                return response.data;
            },
            save: async (companyId: string, improvements: any) => {
                const response = await apiClient.post("/security/improvements", {
                    companyId,
                    improvements,
                });
                return response.data;
            },
        },
        actionPlans: {
            getAll: async (companyId: string) => {
                const response = await apiClient.get("/security/action-plans", {
                    params: { companyId },
                });
                return response.data;
            },
            save: async (companyId: string, actionPlans: any) => {
                const response = await apiClient.post("/security/action-plans", {
                    companyId,
                    actionPlans,
                });
                return response.data;
            },
        },
    },

    // 기술 관련 API
    technical: {
        systems: {
            getAll: async (companyId: string) => {
                const response = await apiClient.get("/technical/systems", {
                    params: { companyId },
                });
                return response.data;
            },
            create: async (companyId: string, systemName: string) => {
                const response = await apiClient.post("/technical/systems", {
                    companyId,
                    systemName,
                });
                return response.data;
            },
            update: async (id: string, systemName: string) => {
                const response = await apiClient.put(`/technical/systems/${id}`, {
                    systemName,
                });
                return response.data;
            },
            delete: async (id: string) => {
                const response = await apiClient.delete(`/technical/systems/${id}`);
                return response.data;
            },
        },
        checklists: {
            getAll: async (params: { companyId: string; systemId?: string; status?: string[] }) => {
                const response = await apiClient.get("/technical/checklists", {
                    params,
                    paramsSerializer: {
                        indexes: null,
                    },
                });
                return response.data;
            },
            save: async (companyId: string, systemId: string, data: any[]) => {
                const response = await apiClient.post("/technical/checklists", {
                    companyId,
                    systemId,  // ← systemName → systemId
                    data,
                });
                return response.data;
            },
        },
        improvements: {
            getAll: async (companyId: string) => {
                const response = await apiClient.get("/technical/improvements", {
                    params: { companyId },
                });
                return response.data;
            },
            save: async (companyId: string, improvements: any) => {
                const response = await apiClient.post("/technical/improvements", {
                    companyId,
                    improvements,
                });
                return response.data;
            },
        },
        actionPlans: {
            getAll: async (companyId: string) => {
                const response = await apiClient.get("/technical/action-plans", {
                    params: { companyId },
                });
                return response.data;
            },
            save: async (companyId: string, actionPlans: any) => {
                const response = await apiClient.post("/technical/action-plans", {
                    companyId,
                    actionPlans,
                });
                return response.data;
            },
        },
    },
    // 대시보드 통계 API
    dashboard: {
        getStats: async (companyId: string) => {
            const response = await apiClient.get("/dashboard/stats", {
                params: { companyId },
            });
            return response.data;
        },
    },
};
