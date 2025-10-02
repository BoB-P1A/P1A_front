import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Printer } from 'lucide-react';

export default function ProtectionReport() {
  const handleDownload = () => {
    console.log('Downloading protection report...');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">개인정보 처리단계별 보호조치 결과보고서</h1>
          <p className="text-muted-foreground mt-2">
            개인정보 처리단계별 보호조치 수행 과정의 전체 결과를 확인합니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            인쇄
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            다운로드
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            종합 결과 요약
          </CardTitle>
          <CardDescription>
            개인정보 처리단계별 보호조치 전체 프로세스의 결과를 요약합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">총 평가항목</div>
              <div className="text-2xl font-bold text-primary mt-2">24개</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">이행 완료</div>
              <div className="text-2xl font-bold text-green-600 mt-2">18개</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">이행률</div>
              <div className="text-2xl font-bold text-blue-600 mt-2">75%</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">1. 처리업무표</h3>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                총 2개의 처리업무가 등록되었습니다. (회원가입, 고객상담)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">2. Lifecycle Checklist</h3>
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">수집 단계</span>
                <span className="text-sm font-medium">이행률: 80%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">이용 단계</span>
                <span className="text-sm font-medium">이행률: 70%</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">3. 개인정보 흐름표</h3>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                처리업무별 개인정보 흐름이 정의되었습니다.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">4. 개인정보 흐름도</h3>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                시각화된 개인정보 처리 흐름도가 생성되었습니다.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">5. 침해요인별 개선방안</h3>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                식별된 침해요인에 대한 개선방안이 수립되었습니다.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">종합 의견</h3>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                개인정보 처리단계별 보호조치가 전반적으로 양호하게 이행되고 있으며, 
                일부 미이행 항목에 대해서는 개선방안을 수립하여 지속적으로 관리할 필요가 있습니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
