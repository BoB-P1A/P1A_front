import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  CheckSquare, 
  AlertCircle, 
  Shield,
  PieChart,
  Table
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

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
          {/* 개인정보 처리단계별 보호조치 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-primary">개인정보 처리단계별 보호조치</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => window.location.href = '/protection/task-table'}>
                <FileText className="h-5 w-5 mb-2 text-pia-primary" />
                <span className="text-sm">개인정보 처리 업무표</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => window.location.href = '/protection/lifecycle'}>
                <CheckSquare className="h-5 w-5 mb-2 text-pia-secondary" />
                <span className="text-sm">Lifecycle Checklist</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => window.location.href = '/protection/flow-table'}>
                <Table className="h-5 w-5 mb-2 text-accent" />
                <span className="text-sm">개인정보 흐름표</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => window.location.href = '/protection/flowchart'}>
                <PieChart className="h-5 w-5 mb-2 text-pia-primary" />
                <span className="text-sm">개인정보 흐름도</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => window.location.href = '/protection/improvement-plan'}>
                <AlertCircle className="h-5 w-5 mb-2 text-destructive" />
                <span className="text-sm">침해요인별 개선방안</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => window.location.href = '/protection/report'}>
                <FileText className="h-5 w-5 mb-2 text-pia-secondary" />
                <span className="text-sm">결과보고서</span>
              </Button>
            </div>
          </div>

          {/* 기술적 보호조치 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-primary">기술적 보호조치</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => window.location.href = '/technical/checklist'}>
                <CheckSquare className="h-5 w-5 mb-2 text-pia-primary" />
                <span className="text-sm">Admin Checklist</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => window.location.href = '/technical/improvement-plan'}>
                <AlertCircle className="h-5 w-5 mb-2 text-destructive" />
                <span className="text-sm">침해요인별 개선방안</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10" onClick={() => window.location.href = '/technical/report'}>
                <FileText className="h-5 w-5 mb-2 text-pia-secondary" />
                <span className="text-sm">결과보고서</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}