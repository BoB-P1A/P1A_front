import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface EvaluationItem {
  id: number;
  area: string;
  field: string;
  subField: string;
  no: string;
  item: string;
}

interface LifecycleItem {
  id: number;
  subField: string;
  no: string;
  item: string;
  status: '이행' | '부분이행' | '미이행' | '해당없음' | null;
  evidence: string;
  relatedLaw: string;
}

export default function ProtectionLifecycle() {
  const [items, setItems] = useState<LifecycleItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const evaluationItems = localStorage.getItem('evaluationItems');
    if (evaluationItems) {
      const parsed: EvaluationItem[] = JSON.parse(evaluationItems);
      const filtered = parsed.filter(item => item.area === '3. 개인정보 처리단계별 보호조치');
      
      const lifecycleItems: LifecycleItem[] = filtered.map(item => ({
        id: item.id,
        subField: item.subField,
        no: item.no,
        item: item.item,
        status: null,
        evidence: '',
        relatedLaw: '',
      }));
      
      setItems(lifecycleItems);
    }
  }, []);

  const handleStatusChange = (id: number, status: '이행' | '부분이행' | '미이행' | '해당없음') => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
    setHasChanges(true);
  };

  const handleEvidenceChange = (id: number, evidence: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, evidence } : item));
    setHasChanges(true);
  };

  const handleRelatedLawChange = (id: number, relatedLaw: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, relatedLaw } : item));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving lifecycle data:', items);
    localStorage.setItem('lifecycleData', JSON.stringify(items));
    setHasChanges(false);
  };

  const handleReset = () => {
    setItems(prev => prev.map(item => ({ ...item, status: null, evidence: '', relatedLaw: '' })));
    setHasChanges(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Lifecycle Checklist</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleReset}>초기화</Button>
          <Button onClick={handleSave} disabled={!hasChanges}>저장</Button>
        </div>
      </div>

      <div className="space-y-6">
        {items.map(item => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="text-lg">{item.no} - {item.subField}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="font-semibold">평가항목</Label>
                <p className="mt-1 text-sm">{item.item}</p>
              </div>

              <div>
                <Label className="font-semibold mb-2 block">평가 결과</Label>
                <RadioGroup
                  value={item.status || ''}
                  onValueChange={(value) => handleStatusChange(item.id, value as '이행' | '부분이행' | '미이행' | '해당없음')}
                >
                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="이행" id={`${item.id}-이행`} />
                      <Label htmlFor={`${item.id}-이행`}>이행</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="부분이행" id={`${item.id}-부분이행`} />
                      <Label htmlFor={`${item.id}-부분이행`}>부분이행</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="미이행" id={`${item.id}-미이행`} />
                      <Label htmlFor={`${item.id}-미이행`}>미이행</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="해당없음" id={`${item.id}-해당없음`} />
                      <Label htmlFor={`${item.id}-해당없음`}>해당없음</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor={`evidence-${item.id}`} className="font-semibold">평가 근거 및 의견</Label>
                <Textarea
                  id={`evidence-${item.id}`}
                  value={item.evidence}
                  onChange={(e) => handleEvidenceChange(item.id, e.target.value)}
                  placeholder="평가 근거 및 의견을 입력하세요"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor={`law-${item.id}`} className="font-semibold">관련 법률</Label>
                <Textarea
                  id={`law-${item.id}`}
                  value={item.relatedLaw}
                  onChange={(e) => handleRelatedLawChange(item.id, e.target.value)}
                  placeholder="관련 법률을 입력하세요"
                  className="mt-1"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              영향평가 관리 페이지에서 평가항목을 추가해주세요.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
