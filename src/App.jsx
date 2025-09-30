import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Auth Pages
import Login from "./pages/auth/Login";
import FindId from "./pages/auth/FindId";
import ResetPassword from "./pages/auth/ResetPassword";

// Main Layout
import { DashboardLayout } from "./layouts/DashboardLayout";

// Main Pages
import EvaluationRequest from "./pages/EvaluationRequest";
import CriteriaTasks from "./pages/criteria/CriteriaTasks";
import CriteriaImpact from "./pages/criteria/CriteriaImpact";
import CriteriaPersonalData from "./pages/criteria/CriteriaPersonalData";
import ProtectionLifecycle from "./pages/protection/ProtectionLifecycle";
import ProtectionFlowTable from "./pages/protection/ProtectionFlowTable";
import ProtectionFlowChart from "./pages/protection/ProtectionFlowChart";
import ProtectionRisk from "./pages/protection/ProtectionRisk";
import TechnicalAdminChecklist from "./pages/technical/TechnicalAdminChecklist";
import TechnicalRisk from "./pages/technical/TechnicalRisk";
import AdminPage from "./pages/AdminPage";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/find-id" element={<FindId />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              
              {/* 영향평가 요청 */}
              <Route path="evaluation-request" element={<EvaluationRequest />} />
              
              {/* 평가 기준 관리 */}
              <Route path="criteria/tasks" element={<CriteriaTasks />} />
              <Route path="criteria/impact" element={<CriteriaImpact />} />
              <Route path="criteria/personal-data" element={<CriteriaPersonalData />} />
              
              {/* 개인정보 처리단계별 보호조치 */}
              <Route path="protection/lifecycle" element={<ProtectionLifecycle />} />
              <Route path="protection/flow-table" element={<ProtectionFlowTable />} />
              <Route path="protection/flow-chart" element={<ProtectionFlowChart />} />
              <Route path="protection/risk" element={<ProtectionRisk />} />
              
              {/* 기술적 보호조치 */}
              <Route path="technical/admin-checklist" element={<TechnicalAdminChecklist />} />
              <Route path="technical/risk" element={<TechnicalRisk />} />
              
              {/* 관리자 페이지 (관리자만 접근 가능) */}
              <Route path="adminpage" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPage />
                </ProtectedRoute>
              } />
            </Route>

            {/* Catch all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
