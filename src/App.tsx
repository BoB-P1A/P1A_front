import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Auth Pages
import Login from "./pages/auth/Login";

// Main Layout
import { DashboardLayout } from "./layouts/DashboardLayout";

// Main Pages
import EvaluationManagement from "./pages/EvaluationManagement";
import TaskTable from "./pages/lifecycle/TaskTable";
import LifecycleChecklist from "./pages/lifecycle/LifecycleChecklist";
import FlowTable from "./pages/lifecycle/FlowTable";
import FlowChart from "./pages/lifecycle/FlowChart";
import LifecycleImprovementPlan from "./pages/lifecycle/ImprovementPlan";
import LifecycleActionPlan from "./pages/lifecycle/ActionPlan";
import LifecycleReport from "./pages/lifecycle/Report";
import AdminChecklist from "./pages/technical/AdminChecklist";
import TechnicalImprovementPlan from "./pages/technical/ImprovementPlan";
import TechnicalActionPlan from "./pages/technical/ActionPlan";
import TechnicalReport from "./pages/technical/Report";
import SecurityChecklist from "./pages/security/SecurityChecklist";
import SecurityImprovementPlan from "./pages/security/ImprovementPlan";
import SecurityActionPlan from "./pages/security/ActionPlan";
import SecurityReport from "./pages/security/Report";
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
              <Route path="lifecycle/task-table" element={<TaskTable />} />
              <Route path="lifecycle/lifecycle" element={<LifecycleChecklist />} />
              <Route path="lifecycle/flow-table" element={<FlowTable />} />
              <Route path="lifecycle/flowchart" element={<FlowChart />} />
              <Route path="lifecycle/improvement-plan" element={<LifecycleImprovementPlan />} />
              <Route path="lifecycle/action-plan" element={<LifecycleActionPlan />} />
              <Route path="lifecycle/report" element={<LifecycleReport />} />
              
              {/* 기술적 보호조치 */}
              <Route path="technical/checklist" element={<AdminChecklist />} />
              <Route path="technical/improvement-plan" element={<TechnicalImprovementPlan />} />
              <Route path="technical/action-plan" element={<TechnicalActionPlan />} />
              <Route path="technical/report" element={<TechnicalReport />} />

              {/* 보안성 검토 */}
              <Route path="security/checklist" element={<SecurityChecklist />} />
              <Route path="security/improvement-plan" element={<SecurityImprovementPlan />} />
              <Route path="security/action-plan" element={<SecurityActionPlan />} />
              <Route path="security/report" element={<SecurityReport />} />
              
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