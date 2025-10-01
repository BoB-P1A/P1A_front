import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { AlertTriangle, Calculator, CheckCircle, RefreshCw } from 'lucide-react';

interface RiskFactor {
  id: string;
  category: string;
  factor: string;
  description: string;
  likelihood: number;  // 1-5
  impact: number;      // 1-5
  risk: number;        // likelihood * impact
  mitigation: string;
  status: 'high' | 'medium' | 'low';
}

const riskFactors: RiskFactor[] = [
  {
    id: '1',
    category: '데이터 보안',
    factor: '무단 접근',
    description: '권한이 없는 사용자의 개인정보 접근',
    likelihood: 3,
    impact: 4,
    risk: 12,
    mitigation: '다단계 인증, 접근권한 관리 강화',
    status: 'high'
  },
  {
    id: '2',
    category: '데이터 보안',
    factor: '데이터 유출',
    description: '외부로의 개인정보 유출 위험',
    likelihood: 2,
    impact: 5,
    risk: 10,
    mitigation: '네트워크 모니터링, DLP 솔루션 도입',
    status: 'high'
  },
  {
    id: '3',
    category: '시스템 보안',
    factor: '시스템 취약점',
    description: '소프트웨어 취약점을 통한 침해',
    likelihood: 3,
    impact: 3,
    risk: 9,
    mitigation: '정기적인 보안 패치, 취약점 스캔',
    status: 'medium'
  },
  {
    id: '4',
    category: '물리적 보안',
    factor: '물리적 접근',
    description: '서버실 또는 사무실 무단 침입',
    likelihood: 2,
    impact: 3,
    risk: 6,
    mitigation: '출입통제 시스템, CCTV 설치',
    status: 'medium'
  },
  {
    id: '5',
    category: '인적 보안',
    factor: '내부자 위협',
    description: '직원에 의한 의도적/비의도적 정보 유출',
    likelihood: 2,
    impact: 4,
    risk: 8,
    mitigation: '보안 교육, 권한 분리, 모니터링',
    status: 'medium'
  },
  {
    id: '6',
    category: '기술적 보안',
    factor: '암호화 부족',
    description: '개인정보 암호화 미적용 또는 취약한 암호화',
    likelihood: 2,
    impact: 4,
    risk: 8,
    mitigation: '강력한 암호화 알고리즘 적용',
    status: 'medium'
  }
];

export default function ProtectionRisk() {
  const [risks] = useState<RiskFactor[]>(riskFactors);
  const [isCalculating, setIsCalculating] = useState(false);

  const getRiskLevel = (score: number): string => {
    if (score >= 15) return '매우 높음';
    if (score >= 10) return '높음';
    if (score >= 6) return '보통';
    if (score >= 3) return '낮음';
    return '매우 낮음';
  };

  const getRiskColor = (score: number): string => {
    if (score >= 15) return 'bg-red-500';
    if (score >= 10) return 'bg-orange-500';
    if (score >= 6) return 'bg-yellow-500';
    if (score >= 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getRiskBadgeVariant = (status: string) => {
    switch (status) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const handleCalculateRisk = async () => {
    setIsCalculating(true);
    // 위험도 계산 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsCalculating(false);
  };

  const totalRisks = risks.length;
  const highRisks = risks.filter(r => r.status === 'high').length;
  const mediumRisks = risks.filter(r => r.status === 'medium').length;
  const lowRisks = risks.filter(r => r.status === 'low').length;
  const averageRisk = Math.round(risks.reduce((sum, r) => sum + r.risk, 0) / totalRisks);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">위험도 산정</h1>
          <p className="text-muted-foreground mt-2">
            개인정보 처리과정의 침해요인을 분석하고 위험도를 산정합니다
          </p>
        </div>
        <Button 
          onClick={handleCalculateRisk} 
          className="bg-pia-secondary hover:bg-pia-secondary-light"
          disabled={isCalculating}
        >
          {isCalculating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              계산 중...
            </>
          ) : (
            <>
              <Calculator className="h-4 w-4 mr-2" />
              위험도 재계산
            </>
          )}
        </Button>
      </div>

      {/* 위험도 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-pia-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">전체 위험요소</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-primary">{totalRisks}</div>
            <p className="text-xs text-muted-foreground">개 항목</p>
          </CardContent>
        </Card>

        <Card className="shadow-pia-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">고위험</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-destructive">{highRisks}</div>
            <p className="text-xs text-muted-foreground">즉시 조치 필요</p>
          </CardContent>
        </Card>

        <Card className="shadow-pia-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">중위험</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-yellow-600">{mediumRisks}</div>
            <p className="text-xs text-muted-foreground">관리 강화 필요</p>
          </CardContent>
        </Card>

        <Card className="shadow-pia-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">평균 위험도</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-primary">{averageRisk}</div>
            <p className="text-xs text-muted-foreground">{getRiskLevel(averageRisk)}</p>
          </CardContent>
        </Card>
      </div>

      {/* 위험도 분석 테이블 */}
      <Card className="shadow-pia-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            침해요인 위험도 분석
          </CardTitle>
          <CardDescription>
            각 침해요인별 발생가능성과 영향도를 기반으로 위험도를 산정합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>카테고리</TableHead>
                <TableHead>침해요인</TableHead>
                <TableHead>설명</TableHead>
                <TableHead className="text-center">발생가능성</TableHead>
                <TableHead className="text-center">영향도</TableHead>
                <TableHead className="text-center">위험도</TableHead>
                <TableHead>개선방안</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {risks.map((risk) => (
                <TableRow key={risk.id}>
                  <TableCell>
                    <Badge variant="outline">{risk.category}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {risk.factor}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {risk.description}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm">{risk.likelihood}</span>
                      <Progress value={risk.likelihood * 20} className="w-12 h-2" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm">{risk.impact}</span>
                      <Progress value={risk.impact * 20} className="w-12 h-2" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getRiskColor(risk.risk)}`}></div>
                      <span className="font-medium">{risk.risk}</span>
                      <span className="text-xs text-muted-foreground">
                        ({getRiskLevel(risk.risk)})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {risk.mitigation}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRiskBadgeVariant(risk.status)}>
                      {risk.status === 'high' ? '고위험' :
                       risk.status === 'medium' ? '중위험' : '저위험'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 개선방안 요약 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-pia-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              즉시 개선 필요 항목
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {risks.filter(r => r.status === 'high').map((risk) => (
                <div key={risk.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{risk.factor}</h4>
                    <Badge variant="destructive" className="text-xs">
                      위험도 {risk.risk}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {risk.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-pia-card">
          <CardHeader>
            <CardTitle>위험도 산정 기준</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">발생가능성 (1-5점)</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>5점: 매우 높음 (거의 확실)</p>
                  <p>4점: 높음 (가능성 높음)</p>
                  <p>3점: 보통 (50% 정도)</p>
                  <p>2점: 낮음 (가능성 낮음)</p>
                  <p>1점: 매우 낮음 (거의 없음)</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">영향도 (1-5점)</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>5점: 매우 높음 (심각한 피해)</p>
                  <p>4점: 높음 (상당한 피해)</p>
                  <p>3점: 보통 (보통 수준 피해)</p>
                  <p>2점: 낮음 (경미한 피해)</p>
                  <p>1점: 매우 낮음 (미미한 피해)</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">위험도 = 발생가능성 × 영향도</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>15-25점: 매우 높음 (즉시 조치)</p>
                  <p>10-14점: 높음 (우선 조치)</p>
                  <p>6-9점: 보통 (관리 필요)</p>
                  <p>3-5점: 낮음 (주기적 점검)</p>
                  <p>1-2점: 매우 낮음 (현상 유지)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}