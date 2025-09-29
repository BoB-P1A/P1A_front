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
import { AlertTriangle, Calculator, Shield, RefreshCw } from 'lucide-react';

interface TechnicalRisk {
  id: string;
  category: string;
  threat: string;
  description: string;
  vulnerability: string;
  likelihood: number;  // 1-5
  impact: number;      // 1-5
  risk: number;        // likelihood * impact
  currentControls: string;
  recommendedControls: string;
  status: 'high' | 'medium' | 'low';
}

const technicalRisks: TechnicalRisk[] = [
  {
    id: '1',
    category: '네트워크 보안',
    threat: 'DDoS 공격',
    description: '대량의 트래픽을 통한 서비스 마비',
    vulnerability: '트래픽 제어 메커니즘 부족',
    likelihood: 3,
    impact: 4,
    risk: 12,
    currentControls: '기본 방화벽',
    recommendedControls: 'DDoS 방어 솔루션, CDN 활용',
    status: 'high'
  },
  {
    id: '2',
    category: '어플리케이션 보안',
    threat: 'SQL Injection',
    description: 'SQL 삽입을 통한 데이터베이스 침해',
    vulnerability: '입력값 검증 부족',
    likelihood: 3,
    impact: 5,
    risk: 15,
    currentControls: '기본 입력 검증',
    recommendedControls: 'Prepared Statement, WAF 적용',
    status: 'high'
  },
  {
    id: '3',
    category: '어플리케이션 보안',
    threat: 'XSS 공격',
    description: '악성 스크립트 삽입을 통한 사용자 정보 탈취',
    vulnerability: '출력값 인코딩 미흡',
    likelihood: 4,
    impact: 3,
    risk: 12,
    currentControls: '기본 HTML 인코딩',
    recommendedControls: 'CSP 헤더, 엄격한 입출력 검증',
    status: 'high'
  },
  {
    id: '4',
    category: '시스템 보안',
    threat: '권한 상승',
    description: '낮은 권한에서 높은 권한으로 승격',
    vulnerability: '권한 관리 체계 미흡',
    likelihood: 2,
    impact: 4,
    risk: 8,
    currentControls: '기본 사용자 권한',
    recommendedControls: '최소권한 원칙, 정기 권한 검토',
    status: 'medium'
  },
  {
    id: '5',
    category: '데이터 보안',
    threat: '암호화 우회',
    description: '약한 암호화 알고리즘 또는 키 관리 취약점',
    vulnerability: '구형 암호화 방식 사용',
    likelihood: 2,
    impact: 5,
    risk: 10,
    currentControls: 'AES-128 암호화',
    recommendedControls: 'AES-256, 키 관리 시스템',
    status: 'high'
  },
  {
    id: '6',
    category: '시스템 보안',
    threat: '악성코드 감염',
    description: '시스템 내 악성코드 유입 및 확산',
    vulnerability: '백신 프로그램 미설치 또는 구버전',
    likelihood: 3,
    impact: 3,
    risk: 9,
    currentControls: '기본 백신 프로그램',
    recommendedControls: '실시간 백신, 행위 기반 탐지',
    status: 'medium'
  },
  {
    id: '7',
    category: '네트워크 보안',
    threat: '중간자 공격',
    description: '네트워크 통신 중간에서 데이터 가로채기',
    vulnerability: 'SSL/TLS 미적용 또는 취약한 설정',
    likelihood: 2,
    impact: 4,
    risk: 8,
    currentControls: 'TLS 1.1',
    recommendedControls: 'TLS 1.3, HSTS 적용',
    status: 'medium'
  }
];

export default function TechnicalRisk() {
  const [risks] = useState<TechnicalRisk[]>(technicalRisks);
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
          <h1 className="text-3xl font-bold text-primary">기술적 위험도 산정</h1>
          <p className="text-muted-foreground mt-2">
            기술적 보호조치 관점에서 시스템 위험도를 분석하고 대응방안을 제시합니다
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
            <p className="text-xs text-muted-foreground">개 위협</p>
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

      {/* 기술적 위험 분석 테이블 */}
      <Card className="shadow-pia-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-pia-secondary" />
            기술적 위협 위험도 분석
          </CardTitle>
          <CardDescription>
            시스템 및 어플리케이션 보안 위협의 위험도를 평가하고 대응방안을 제시합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>카테고리</TableHead>
                  <TableHead>위협</TableHead>
                  <TableHead>취약점</TableHead>
                  <TableHead className="text-center">발생가능성</TableHead>
                  <TableHead className="text-center">영향도</TableHead>
                  <TableHead className="text-center">위험도</TableHead>
                  <TableHead>현재 보호조치</TableHead>
                  <TableHead>권장 보호조치</TableHead>
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
                      {risk.threat}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {risk.vulnerability}
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
                      {risk.currentControls}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-pia-secondary">
                      {risk.recommendedControls}
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
          </div>
        </CardContent>
      </Card>

      {/* 카테고리별 위험도 분포 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-pia-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              우선 대응 필요 위협
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {risks
                .filter(r => r.status === 'high')
                .sort((a, b) => b.risk - a.risk)
                .map((risk) => (
                <div key={risk.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{risk.threat}</h4>
                    <Badge variant="destructive" className="text-xs">
                      위험도 {risk.risk}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {risk.description}
                  </p>
                  <div className="text-xs">
                    <span className="font-medium text-pia-secondary">권장 조치: </span>
                    <span className="text-muted-foreground">{risk.recommendedControls}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-pia-card">
          <CardHeader>
            <CardTitle>기술적 보안 가이드</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">네트워크 보안</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• 방화벽, IPS/IDS 구축</p>
                  <p>• VPN, SSL/TLS 적용</p>
                  <p>• 네트워크 분할 및 모니터링</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">어플리케이션 보안</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• 보안 코딩 가이드 준수</p>
                  <p>• 입출력 검증 강화</p>
                  <p>• WAF(웹 어플리케이션 방화벽)</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">시스템 보안</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• 정기적인 보안 패치</p>
                  <p>• 접근권한 관리</p>
                  <p>• 시스템 로그 모니터링</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">데이터 보안</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• 강력한 암호화 적용</p>
                  <p>• 키 관리 시스템</p>
                  <p>• 데이터 백업 및 복구</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}