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

interface TechnicalRisk {
  id: number;
  category: string;
  risk: string;
  level: 'high' | 'medium' | 'low';
  currentStatus: string;
  improvementPlan: string;
  responsible: string;
  deadline: string;
}

export default function TechnicalImprovementPlan() {
  const technicalRisks: TechnicalRisk[] = [
    {
      id: 1,
      category: '네트워크 보안',
      risk: '방화벽 설정 미흡',
      level: 'high',
      currentStatus: '일부 포트 개방 상태',
      improvementPlan: '불필요한 포트 차단 및 방화벽 규칙 강화',
      responsible: '인프라팀',
      deadline: '2024-02-15',
    },
    {
      id: 2,
      category: '시스템 보안',
      risk: '취약점 패치 지연',
      level: 'medium',
      currentStatus: '일부 서버 패치 미적용',
      improvementPlan: '자동 패치 시스템 도입 및 정기 점검',
      responsible: '시스템팀',
      deadline: '2024-03-15',
    },
    {
      id: 3,
      category: '애플리케이션 보안',
      risk: 'SQL Injection 취약점',
      level: 'high',
      currentStatus: '입력값 검증 불충분',
      improvementPlan: 'Prepared Statement 적용 및 입력값 검증 강화',
      responsible: '개발팀',
      deadline: '2024-02-28',
    },
  ];

  const handleExportToExcel = () => {
    console.log('Exporting technical risks to Excel...');
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
          <h1 className="text-3xl font-bold text-primary">침해요인별 개선방안 (기술적)</h1>
          <p className="text-muted-foreground mt-2">
            기술적 보호조치의 침해요인과 개선방안을 관리합니다
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
            기술적 침해요인 목록
          </CardTitle>
          <CardDescription>
            기술적 보호조치 관련 침해요인과 개선방안을 확인하세요
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
              {technicalRisks.map((risk) => (
                <TableRow key={risk.id}>
                  <TableCell className="font-medium">{risk.category}</TableCell>
                  <TableCell>{risk.risk}</TableCell>
                  <TableCell>{getRiskLevelBadge(risk.level)}</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={risk.currentStatus}>
                      {risk.currentStatus}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={risk.improvementPlan}>
                      {risk.improvementPlan}
                    </div>
                  </TableCell>
                  <TableCell>{risk.responsible}</TableCell>
                  <TableCell>{risk.deadline}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>기술적 위험도 통계</CardTitle>
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
