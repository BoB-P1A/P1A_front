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

interface ImpactCriteria {
  level: string;
  score: string;
  description: string;
  examples: string;
  color: string;
}

const defaultCriteria: ImpactCriteria[] = [
  {
    level: '매우 높음',
    score: '5',
    description: '개인의 권리와 자유에 중대한 영향을 미칠 가능성이 매우 높음',
    examples: '민감정보 대량 처리, 자동화된 의사결정, 생체정보',
    color: 'bg-red-500'
  },
  {
    level: '높음',
    score: '4',
    description: '개인의 권리와 자유에 상당한 영향을 미칠 가능성이 높음',
    examples: '대량 개인정보 처리, 프로파일링, 위치정보',
    color: 'bg-orange-500'
  },
  {
    level: '보통',
    score: '3',
    description: '개인의 권리와 자유에 보통 수준의 영향을 미칠 가능성',
    examples: '일반적인 고객정보 처리, 마케팅 활용',
    color: 'bg-yellow-500'
  },
  {
    level: '낮음',
    score: '2',
    description: '개인의 권리와 자유에 제한적 영향을 미칠 가능성',
    examples: '기본적인 회원정보 처리, 단순 문의응답',
    color: 'bg-blue-500'
  },
  {
    level: '매우 낮음',
    score: '1',
    description: '개인의 권리와 자유에 최소한의 영향을 미칠 가능성',
    examples: '공개된 정보 활용, 익명화된 통계',
    color: 'bg-green-500'
  }
];

export default function CriteriaImpact() {
  const [criteria, setCriteria] = useState<ImpactCriteria[]>(defaultCriteria);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const handleEdit = (index: number, field: keyof ImpactCriteria, value: string) => {
    setCriteria(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
    setHasChanges(true);
  };

  const handleSave = () => {
    setEditingIndex(null);
    setHasChanges(false);
    // TODO: API 호출로 저장
    console.log('Saving impact criteria:', criteria);
  };

  const handleReset = () => {
    setCriteria(defaultCriteria);
    setEditingIndex(null);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">영향도 등급표</h1>
          <p className="text-muted-foreground mt-2">
            개인정보 처리로 인한 영향도 평가 기준을 관리합니다
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

      <Card className="shadow-pia-card">
        <CardHeader>
          <CardTitle>영향도 평가 기준</CardTitle>
          <CardDescription>
            개인정보 처리가 정보주체에게 미치는 영향의 정도를 평가하는 기준표입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">등급</TableHead>
                <TableHead className="w-[80px]">점수</TableHead>
                <TableHead className="w-[300px]">설명</TableHead>
                <TableHead>예시</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {criteria.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      {editingIndex === index ? (
                        <Input
                          value={item.level}
                          onChange={(e) => handleEdit(index, 'level', e.target.value)}
                          className="w-24"
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingIndex(index)} 
                          className="cursor-pointer hover:bg-accent/10 p-1 rounded"
                        >
                          {item.level}
                        </span>
                      )}
                    </div>
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
                        value={item.description}
                        onChange={(e) => handleEdit(index, 'description', e.target.value)}
                        className="min-w-[250px]"
                      />
                    ) : (
                      <span 
                        onClick={() => setEditingIndex(index)} 
                        className="cursor-pointer hover:bg-accent/10 p-1 rounded text-sm"
                      >
                        {item.description}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingIndex === index ? (
                      <Input
                        value={item.examples}
                        onChange={(e) => handleEdit(index, 'examples', e.target.value)}
                        className="min-w-[200px]"
                      />
                    ) : (
                      <span 
                        onClick={() => setEditingIndex(index)} 
                        className="cursor-pointer hover:bg-accent/10 p-1 rounded text-sm text-muted-foreground"
                      >
                        {item.examples}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-pia-card">
        <CardHeader>
          <CardTitle>사용 가이드</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p><strong>영향도 평가 기준:</strong></p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>개인정보 처리로 인해 정보주체의 권리와 자유에 미치는 영향 정도를 평가</li>
              <li>높은 점수일수록 더 많은 보호조치와 주의가 필요</li>
              <li>민감정보, 대량처리, 자동화 의사결정 등은 높은 영향도로 분류</li>
              <li>각 처리업무별로 해당하는 영향도 등급을 선택하여 활용</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}