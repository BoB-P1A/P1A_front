import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Save, RefreshCw } from 'lucide-react';

interface PersonalDataScale {
  level: string;
  range: string;
  score: string;
  riskLevel: string;
  color: string;
}

const defaultScale: PersonalDataScale[] = [
  {
    level: '대량',
    range: '100,000건 이상',
    score: '5',
    riskLevel: '매우 높음',
    color: 'bg-red-500'
  },
  {
    level: '다량',
    range: '10,000 ~ 99,999건',
    score: '4',
    riskLevel: '높음',
    color: 'bg-orange-500'
  },
  {
    level: '중량',
    range: '1,000 ~ 9,999건',
    score: '3',
    riskLevel: '보통',
    color: 'bg-yellow-500'
  },
  {
    level: '소량',
    range: '100 ~ 999건',
    score: '2',
    riskLevel: '낮음',
    color: 'bg-blue-500'
  },
  {
    level: '극소량',
    range: '100건 미만',
    score: '1',
    riskLevel: '매우 낮음',
    color: 'bg-green-500'
  }
];

export default function CriteriaPersonalData() {
  const [scale, setScale] = useState<PersonalDataScale[]>(defaultScale);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const handleEdit = (index: number, field: keyof PersonalDataScale, value: string) => {
    setScale(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
    setHasChanges(true);
  };

  const handleSave = () => {
    setEditingIndex(null);
    setHasChanges(false);
    // TODO: API 호출로 저장
    console.log('Saving personal data scale:', scale);
  };

  const handleReset = () => {
    setScale(defaultScale);
    setEditingIndex(null);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">개인정보건수 등급표</h1>
          <p className="text-muted-foreground mt-2">
            처리하는 개인정보의 건수에 따른 위험도 평가 기준을 관리합니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            기본값 복원
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-pia-secondary hover:bg-pia-secondary-light"
            disabled={!hasChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 등급표 */}
        <div className="lg:col-span-2">
          <Card className="shadow-pia-card">
            <CardHeader>
              <CardTitle>개인정보 건수별 등급</CardTitle>
              <CardDescription>
                처리하는 개인정보의 건수에 따른 위험도 평가 기준입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">등급</TableHead>
                    <TableHead className="w-[150px]">건수 범위</TableHead>
                    <TableHead className="w-[80px]">점수</TableHead>
                    <TableHead>위험도</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scale.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          {editingIndex === index ? (
                            <Input
                              value={item.level}
                              onChange={(e) => handleEdit(index, 'level', e.target.value)}
                              className="w-20"
                            />
                          ) : (
                            <span 
                              onClick={() => setEditingIndex(index)} 
                              className="cursor-pointer hover:bg-accent/10 p-1 rounded font-medium"
                            >
                              {item.level}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {editingIndex === index ? (
                          <Input
                            value={item.range}
                            onChange={(e) => handleEdit(index, 'range', e.target.value)}
                            className="w-32"
                          />
                        ) : (
                          <span 
                            onClick={() => setEditingIndex(index)} 
                            className="cursor-pointer hover:bg-accent/10 p-1 rounded"
                          >
                            {item.range}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingIndex === index ? (
                          <Input
                            value={item.score}
                            onChange={(e) => handleEdit(index, 'score', e.target.value)}
                            className="w-16"
                            type="number"
                            min="1"
                            max="5"
                          />
                        ) : (
                          <Badge variant="outline" className="cursor-pointer" onClick={() => setEditingIndex(index)}>
                            {item.score}점
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingIndex === index ? (
                          <Input
                            value={item.riskLevel}
                            onChange={(e) => handleEdit(index, 'riskLevel', e.target.value)}
                            className="w-24"
                          />
                        ) : (
                          <Badge 
                            variant={item.score === '5' || item.score === '4' ? 'destructive' :
                                   item.score === '3' ? 'default' : 'secondary'}
                            className="cursor-pointer" 
                            onClick={() => setEditingIndex(index)}
                          >
                            {item.riskLevel}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* 가이드 및 통계 */}
        <div className="space-y-6">
          <Card className="shadow-pia-card">
            <CardHeader>
              <CardTitle>건수별 보호조치</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="font-medium text-sm">대량 (5점)</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-5">
                    강화된 암호화, 접근제어, 모니터링 시스템 필수
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="font-medium text-sm">다량 (4점)</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-5">
                    암호화, 접근권한 관리, 정기 점검 필요
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="font-medium text-sm">중량 (3점)</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-5">
                    기본 보안조치 및 정기 백업 실시
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="font-medium text-sm">소량 (2점)</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-5">
                    표준 보안조치 적용
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-medium text-sm">극소량 (1점)</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-5">
                    최소한의 보안조치 적용
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-pia-card">
            <CardHeader>
              <CardTitle>평가 기준</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p><strong>건수 산정 기준:</strong></p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>개인정보 주체 수 기준으로 산정</li>
                  <li>동일 주체의 복수 정보는 1건으로 계산</li>
                  <li>연간 최대 처리 건수를 기준으로 평가</li>
                  <li>예상 증가량을 고려하여 여유분 반영</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}