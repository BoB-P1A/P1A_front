import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Save, RotateCcw } from 'lucide-react';

interface LifecycleItem {
  id: string;
  phase: string;
  category: string;
  no: string;
  description: string;
  mandatory: boolean;
  status: '이행' | '부분이행' | '미이행' | '해당없음' | null;
  comment: string;
  evidence: string;
}

const lifecycleData: LifecycleItem[] = [
  {
    id: '1',
    phase: '수집',
    category: '적법한 수집 근거 관리',
    no: '1.2.2',
    description: '개인정보 보호책임자는 침묵 권한 관리, 접속기록 관리 및 접속 조치 등 내부 관리계획의 이행 실태를 연 1회 이상 점검·관리하고 있습니까?',
    mandatory: true,
    status: null,
    comment: '',
    evidence: '',
  },
];

export default function ProtectionLifecycle() {
  const [items, setItems] = useState<LifecycleItem[]>(lifecycleData);
  const [hasChanges, setHasChanges] = useState(false);

  const handleStatusChange = (id: string, status: LifecycleItem['status']) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, status } : item
    ));
    setHasChanges(true);
  };

  const handleCommentChange = (id: string, comment: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, comment } : item
    ));
    setHasChanges(true);
  };

  const handleEvidenceChange = (id: string, evidence: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, evidence } : item
    ));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving lifecycle data:', items);
    setHasChanges(false);
  };

  const handleReset = () => {
    setItems(items.map(item => ({ ...item, status: null, comment: '', evidence: '' })));
    setHasChanges(true);
  };

  const phases = Array.from(new Set(items.map(item => item.phase)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Lifecycle Checklist</h1>
          <p className="text-muted-foreground mt-2">
            개인정보 생명주기 단계별 보호조치를 확인하고 기록합니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            초기화
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            저장
          </Button>
        </div>
      </div>

      {phases.map(phase => (
        <Card key={phase}>
          <CardHeader>
            <CardTitle>{phase} 단계</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {items.filter(item => item.phase === phase).map(item => (
              <div key={item.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.no}</Badge>
                      {item.mandatory && <Badge variant="default">필수</Badge>}
                      <span className="text-sm font-medium">{item.category}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>

                <div className="space-y-3 bg-muted/30 p-4 rounded-md">
                  <Label>이행 상태</Label>
                  <RadioGroup
                    value={item.status || ''}
                    onValueChange={(value) => handleStatusChange(item.id, value as LifecycleItem['status'])}
                  >
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="이행" id={`${item.id}-이행`} />
                        <Label htmlFor={`${item.id}-이행`} className="cursor-pointer">이행</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="부분이행" id={`${item.id}-부분이행`} />
                        <Label htmlFor={`${item.id}-부분이행`} className="cursor-pointer">부분이행</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="미이행" id={`${item.id}-미이행`} />
                        <Label htmlFor={`${item.id}-미이행`} className="cursor-pointer">미이행</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="해당없음" id={`${item.id}-해당없음`} />
                        <Label htmlFor={`${item.id}-해당없음`} className="cursor-pointer">해당없음</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`comment-${item.id}`}>평가 근거 및 의견</Label>
                  <Textarea
                    id={`comment-${item.id}`}
                    placeholder="평가 근거나 의견을 입력하세요"
                    value={item.comment}
                    onChange={(e) => handleCommentChange(item.id, e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`evidence-${item.id}`}>증빙 자료</Label>
                  <Textarea
                    id={`evidence-${item.id}`}
                    placeholder="증빙 자료 정보를 입력하세요"
                    value={item.evidence}
                    onChange={(e) => handleEvidenceChange(item.id, e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
