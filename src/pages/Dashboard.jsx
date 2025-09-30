import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  CheckSquare, 
  AlertCircle, 
  TrendingUp,
  Users,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return '관리자';
      case 'developer': return '개발팀';
      case 'privacy-team': return '개인정보팀';
      case 'planning-team': return '기획팀';
      default: return role;
    }
  };

  const stats = [
    {
      title: '진행 중인 평가',
      value: '3',
      description: '현재 평가 진행 중',
      icon: FileText,
      color: 'bg-pia-primary'
    },
    {
      title: '완료된 평가',
      value: '12',
      description: '지난 30일간',
      icon: CheckSquare,
      color: 'bg-pia-secondary'
    },
    {
      title: '위험도 경고',
      value: '2',
      description: '높은 위험도 항목',
      icon: AlertCircle,
      color: 'bg-destructive'
    },
    {
      title: '체크리스트 완료율',
      value: '85%',
      description: '전체 항목 대비',
      icon: TrendingUp,
      color: 'bg-accent'
    }
  ];

  const recentActivities = [
    { title: '개인정보 흐름도 업데이트', time: '2시간 전', type: 'update' },
    { title: '새로운 영향평가 요청', time: '4시간 전', type: 'request' },
    { title: '위험도 산정 완료', time: '1일 전', type: 'complete' },
    { title: '체크리스트 검토 필요', time: '2일 전', type: 'review' }
  ];

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

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="shadow-pia-card hover:shadow-pia-hover transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 활동 */}
        <Card className="shadow-pia-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-pia-primary" />
              최근 활동
            </CardTitle>
            <CardDescription>최근 진행된 활동 내역입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge variant={
                    activity.type === 'complete' ? 'secondary' :
                    activity.type === 'request' ? 'default' :
                    activity.type === 'review' ? 'destructive' : 'outline'
                  }>
                    {activity.type === 'complete' ? '완료' :
                     activity.type === 'request' ? '요청' :
                     activity.type === 'review' ? '검토' : '업데이트'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 바로가기 */}
        <Card className="shadow-pia-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-pia-secondary" />
              주요 기능 바로가기
            </CardTitle>
            <CardDescription>자주 사용하는 기능에 빠르게 접근하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10">
                <FileText className="h-6 w-6 mb-2 text-pia-primary" />
                <span className="text-sm">영향평가 요청</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10">
                <CheckSquare className="h-6 w-6 mb-2 text-pia-secondary" />
                <span className="text-sm">체크리스트</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10">
                <TrendingUp className="h-6 w-6 mb-2 text-accent" />
                <span className="text-sm">위험도 산정</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-accent/10">
                <Users className="h-6 w-6 mb-2 text-muted-foreground" />
                <span className="text-sm">처리업무표</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
