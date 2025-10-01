import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProtectionFlowTable() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">처리흐름도 (표)</h1>
        <p className="text-muted-foreground mt-2">
          개인정보 처리흐름을 표로 관리합니다
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>처리흐름도 (표)</CardTitle>
          <CardDescription>준비 중입니다</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">이 페이지는 현재 개발 중입니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
