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
import EvaluationManagement from "./pages/EvaluationManagement";
import TaskTable from "./pages/protection/TaskTable";
import ProtectionLifecycle from "./pages/protection/ProtectionLifecycle";
import ProtectionFlowTable from "./pages/protection/ProtectionFlowTable";
import ProtectionFlowChart from "./pages/protection/ProtectionFlowChart";
import ProtectionImprovementPlan from "./pages/protection/ImprovementPlan";
import ProtectionReport from "./pages/protection/ProtectionReport";
import TechnicalAdminChecklist from "./pages/technical/TechnicalAdminChecklist";
import TechnicalImprovementPlan from "./pages/technical/ImprovementPlan";
import TechnicalReport from "./pages/technical/TechnicalReport";
import AccountManagement from "./pages/admin/AccountManagement";
import CompanyManagement from "./pages/admin/CompanyManagement";
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
              
              {/* 영향평가 관리 페이지 */}
              <Route path="evaluation-management" element={
                <ProtectedRoute allowedRoles={['admin', 'privacy-team']}>
                  <EvaluationManagement />
                </ProtectedRoute>
              } />
              
              {/* 개인정보 처리단계별 보호조치 */}
              <Route path="protection/task-table" element={<TaskTable />} />
              <Route path="protection/lifecycle" element={<ProtectionLifecycle />} />
              <Route path="protection/flow-table" element={<ProtectionFlowTable />} />
              <Route path="protection/flowchart" element={<ProtectionFlowChart />} />
              <Route path="protection/improvement-plan" element={<ProtectionImprovementPlan />} />
              <Route path="protection/report" element={<ProtectionReport />} />
              
              {/* 기술적 보호조치 */}
              <Route path="technical/checklist" element={<TechnicalAdminChecklist />} />
              <Route path="technical/improvement-plan" element={<TechnicalImprovementPlan />} />
              <Route path="technical/report" element={<TechnicalReport />} />
              
              {/* 관리자 페이지 (관리자만 접근 가능) */}
              <Route path="admin/accounts" element={
                <ProtectedRoute requiredRole="admin">
                  <AccountManagement />
                </ProtectedRoute>
              } />
              <Route path="admin/companies" element={
                <ProtectedRoute requiredRole="admin">
                  <CompanyManagement />
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