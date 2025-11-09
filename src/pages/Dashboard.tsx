import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  CheckSquare, 
  AlertCircle, 
  Shield,
  PieChart,
  Table,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return '관리자';
      case 'developer': return '개발팀';
      case 'privacy-team': return '개인정보팀';
      case 'planning-team': return '사업주관팀';
      default: return role;
    }
  };


  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">대시보드</h1>
          <p className="text-muted-foreground mt-2">
            안녕하세요, {user?.name}님! 현재 역할: {getRoleDisplayName(user?.role || '')}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {user?.company}
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            {getRoleDisplayName(user?.role || '')}
          </Badge>
        </div>
      </div>

      {/* 주요 기능 바로가기 */}
      <Card className="shadow-pia-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-pia-secondary" />
            주요 기능 바로가기
          </CardTitle>
          <CardDescription>자주 사용하는 기능에 빠르게 접근하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 개인정보 처리단계(Lifecycle) */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-primary">개인정보 처리단계(Lifecycle)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => navigate('/lifecycle/task-table')}>
                <FileText className="h-5 w-5 mb-2 text-pia-primary" />
                <span className="text-sm">개인정보 처리 업무표</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => navigate('/lifecycle/flow-table')}>
                <Table className="h-5 w-5 mb-2 text-accent" />
                <span className="text-sm">개인정보 흐름표</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => navigate('/lifecycle/flowchart')}>
                <PieChart className="h-5 w-5 mb-2 text-pia-primary" />
                <span className="text-sm">개인정보 흐름도</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => navigate('/lifecycle/lifecycle')}>
                <CheckSquare className="h-5 w-5 mb-2 text-pia-secondary" />
                <span className="text-sm">Lifecycle Checklist</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => navigate('/lifecycle/improvement-plan')}>
                <AlertCircle className="h-5 w-5 mb-2 text-destructive" />
                <span className="text-sm">침해요인별 개선 가이드</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => navigate('/lifecycle/action-plan')}>
                <ClipboardList className="h-5 w-5 mb-2 text-pia-secondary" />
                <span className="text-sm">조치 계획 수립</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => navigate('/lifecycle/report')}>
                <FileText className="h-5 w-5 mb-2 text-pia-primary" />
                <span className="text-sm">결과보고서</span>
              </Button>
            </div>
          </div>

          {/* 개인정보 처리시스템(Admin) */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-primary">개인정보 처리시스템(Admin)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => navigate('/technical/checklist')}>
                <CheckSquare className="h-5 w-5 mb-2 text-pia-primary" />
                <span className="text-sm">Admin Checklist</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => navigate('/technical/improvement-plan')}>
                <AlertCircle className="h-5 w-5 mb-2 text-destructive" />
                <span className="text-sm">침해요인별 개선 가이드</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => navigate('/technical/action-plan')}>
                <ClipboardList className="h-5 w-5 mb-2 text-pia-secondary" />
                <span className="text-sm">조치 계획 수립</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => navigate('/technical/report')}>
                <FileText className="h-5 w-5 mb-2 text-pia-primary" />
                <span className="text-sm">결과보고서</span>
              </Button>
            </div>
          </div>

          {/* 보안성 검토 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-primary">보안성 검토</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => navigate('/security/checklist')}>
                <CheckSquare className="h-5 w-5 mb-2 text-pia-primary" />
                <span className="text-sm">보안성 검토 Checklist</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => navigate('/security/improvement-plan')}>
                <AlertCircle className="h-5 w-5 mb-2 text-destructive" />
                <span className="text-sm">침해요인별 개선 가이드</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => navigate('/security/action-plan')}>
                <ClipboardList className="h-5 w-5 mb-2 text-pia-secondary" />
                <span className="text-sm">조치 계획 수립</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => navigate('/security/report')}>
                <FileText className="h-5 w-5 mb-2 text-pia-primary" />
                <span className="text-sm">결과보고서</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}