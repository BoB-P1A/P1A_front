import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, AlertTriangle } from 'lucide-react';

interface RiskFactor {
  id: number;
  category: string;
  risk: string;
  level: 'high' | 'medium' | 'low';
  currentStatus: string;
  improvementPlan: string;
  responsible: string;
  deadline: string;
}

export default function ImprovementPlan() {
  const riskFactors: RiskFactor[] = [
    {
      id: 1,
      category: '접근 통제',
      risk: '미승인 접근',
      level: 'high',
      currentStatus: '일부 시스템에 접근 통제 미흡',
      improvementPlan: '역할 기반 접근 제어(RBAC) 시스템 도입',
      responsible: '보안팀',
      deadline: '2024-03-31',
    },
    {
      id: 2,
      category: '암호화',
      risk: '데이터 유출',
      level: 'high',
      currentStatus: '일부 민감정보 평문 저장',
      improvementPlan: 'AES-256 암호화 적용',
      responsible: '개발팀',
      deadline: '2024-02-28',
    },
    {
      id: 3,
      category: '로깅',
      risk: '감사 추적 불가',
      level: 'medium',
      currentStatus: '시스템 로그 일부만 수집',
      improvementPlan: '통합 로깅 시스템 구축',
      responsible: '인프라팀',
      deadline: '2024-04-30',
    },
  ];

  const handleExportToExcel = () => {
    // 엑셀 다운로드 로직
    console.log('Exporting to Excel...');
  };

  const getRiskLevelBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge variant="destructive">높음</Badge>;
      case 'medium':
        return <Badge variant="secondary">중간</Badge>;
      case 'low':
        return <Badge variant="outline">낮음</Badge>;
      default:
        return <Badge>{level}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">침해요인별 개선방안</h1>
          <p className="text-muted-foreground mt-2">
            식별된 침해요인과 개선방안을 관리합니다
          </p>
        </div>
        <Button onClick={handleExportToExcel}>
          <Download className="mr-2 h-4 w-4" />
          엑셀 다운로드
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            침해요인 목록 및 개선방안
          </CardTitle>
          <CardDescription>
            각 침해요인에 대한 현황과 개선방안을 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>카테고리</TableHead>
                <TableHead>침해요인</TableHead>
                <TableHead>위험도</TableHead>
                <TableHead>현황</TableHead>
                <TableHead>개선방안</TableHead>
                <TableHead>담당부서</TableHead>
                <TableHead>완료기한</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riskFactors.map((factor) => (
                <TableRow key={factor.id}>
                  <TableCell className="font-medium">{factor.category}</TableCell>
                  <TableCell>{factor.risk}</TableCell>
                  <TableCell>{getRiskLevelBadge(factor.level)}</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={factor.currentStatus}>
                      {factor.currentStatus}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={factor.improvementPlan}>
                      {factor.improvementPlan}
                    </div>
                  </TableCell>
                  <TableCell>{factor.responsible}</TableCell>
                  <TableCell>{factor.deadline}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>위험도 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-destructive">2</div>
              <div className="text-sm text-muted-foreground">높음</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-500">1</div>
              <div className="text-sm text-muted-foreground">중간</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-500">0</div>
              <div className="text-sm text-muted-foreground">낮음</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
