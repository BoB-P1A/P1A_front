import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProtectionRisk() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">위험도 분석</h1>
        <p className="text-muted-foreground mt-2">
          개인정보 위험도를 분석합니다
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>위험도 분석</CardTitle>
          <CardDescription>준비 중입니다</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">이 페이지는 현재 개발 중입니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
