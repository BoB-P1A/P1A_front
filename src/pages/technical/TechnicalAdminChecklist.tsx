import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Save, RotateCcw } from 'lucide-react';

interface TechnicalItem {
  id: string;
  category: string;
  no: string;
  description: string;
  status: '이행' | '부분이행' | '미이행' | '해당없음' | null;
  comment: string;
  evidence: string;
}

const technicalItems: TechnicalItem[] = [
  {
    id: '1',
    category: '접근통제',
    no: '3.1.1',
    description: '기업정보를 수집하는 경우 목적에 필요한 최소한의 범위로 수립하도록 계획하고 있습니까?',
    status: null,
    comment: '',
    evidence: '',
  },
];

export default function TechnicalAdminChecklist() {
  const [items, setItems] = useState<TechnicalItem[]>(technicalItems);
  const [hasChanges, setHasChanges] = useState(false);

  const handleStatusChange = (id: string, status: TechnicalItem['status']) => {
    setItems(items.map(item => item.id === id ? { ...item, status } : item));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving:', items);
    setHasChanges(false);
  };

  const categories = Array.from(new Set(items.map(item => item.category)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Admin Checklist</h1>
        <Button onClick={handleSave} disabled={!hasChanges}>
          <Save className="mr-2 h-4 w-4" />저장
        </Button>
      </div>

      {categories.map(category => (
        <Card key={category}>
          <CardHeader><CardTitle>{category}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {items.filter(item => item.category === category).map(item => (
              <div key={item.id} className="border rounded-lg p-4 space-y-4">
                <div><Badge>{item.no}</Badge><p className="text-sm mt-2">{item.description}</p></div>
                <RadioGroup value={item.status || ''} onValueChange={(v) => handleStatusChange(item.id, v as any)}>
                  <div className="flex gap-6">
                    {['이행', '부분이행', '미이행', '해당없음'].map(s => (
                      <div key={s} className="flex items-center space-x-2">
                        <RadioGroupItem value={s} id={`${item.id}-${s}`} />
                        <Label htmlFor={`${item.id}-${s}`}>{s}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
