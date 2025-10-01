import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TechnicalAdminChecklist() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">관리적 보호조치 체크리스트</h1>
        <p className="text-muted-foreground mt-2">
          관리적 보호조치 항목을 체크합니다
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>관리적 보호조치 체크리스트</CardTitle>
          <CardDescription>준비 중입니다</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">이 페이지는 현재 개발 중입니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
