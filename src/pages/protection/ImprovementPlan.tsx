import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, AlertTriangle, Save } from 'lucide-react';
import * as XLSX from 'xlsx';

interface LifecycleItem {
  id: number;
  taskName: string;
  subField: string;
  no: string;
  item: string;
  status: '이행' | '부분이행' | '미이행' | '해당없음' | null;
  evidence: string;
  files: any[];
}

interface ImprovementItem {
  id: string;
  taskName: string;
  code: string;
  question: string;
  evidence: string;
  relatedLaw: string;
  riskFactor: string;
  improvementPlan: string;
}

export default function ImprovementPlan() {
  const [items, setItems] = useState<ImprovementItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('전체');
  const [taskNames, setTaskNames] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('processingTasks');
    const tasks = stored ? JSON.parse(stored) : [];
    const names = tasks.map((t: any) => t.taskName).filter(Boolean);
    setTaskNames(names);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'processingTasks') {
        const tasks = e.newValue ? JSON.parse(e.newValue) : [];
        const names = tasks.map((t: any) => t.taskName).filter(Boolean);
        setTaskNames(names);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const lifecycleData = localStorage.getItem('lifecycleData');
    if (lifecycleData) {
      const parsed: LifecycleItem[] = JSON.parse(lifecycleData);
      const filtered = parsed.filter(item => 
        item.status === '부분이행' || item.status === '미이행'
      );

      const savedImprovements = localStorage.getItem('protectionImprovements');
      const saved = savedImprovements ? JSON.parse(savedImprovements) : {};

      const improvementItems: ImprovementItem[] = filtered.map(item => {
        const itemId = `${item.taskName}-${item.no}`;
        const savedItem = saved[itemId];
        return {
          id: itemId,
          taskName: item.taskName,
          code: item.no,
          question: item.item,
          evidence: item.evidence,
          relatedLaw: savedItem?.relatedLaw || '',
          riskFactor: savedItem?.riskFactor || '',
          improvementPlan: savedItem?.improvementPlan || '',
        };
      });

      setItems(improvementItems);
    }
  }, []);

  const handleRelatedLawChange = (id: string, value: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, relatedLaw: value } : item
    ));
    setHasChanges(true);
  };

  const handleRiskFactorChange = (id: string, value: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, riskFactor: value } : item
    ));
    setHasChanges(true);
  };

  const handleImprovementPlanChange = (id: string, value: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, improvementPlan: value } : item
    ));
    setHasChanges(true);
  };

  const handleSave = () => {
    const improvements: { [key: string]: { relatedLaw: string; riskFactor: string; improvementPlan: string } } = {};
    items.forEach(item => {
      improvements[item.id] = {
        relatedLaw: item.relatedLaw,
        riskFactor: item.riskFactor,
        improvementPlan: item.improvementPlan,
      };
    });
    localStorage.setItem('protectionImprovements', JSON.stringify(improvements));
    setHasChanges(false);
  };

  const handleExportToExcel = () => {
    const exportData = filteredItems.map(item => ({
      '개인정보 처리업무명': item.taskName,
      '질의문 코드': item.code,
      '질의문': item.question,
      '평가 근거 및 의견': item.evidence,
      '관련 법률': item.relatedLaw,
      '침해요인': item.riskFactor,
      '개선방안': item.improvementPlan,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '침해요인별 개선방안');
    XLSX.writeFile(wb, '개인정보_침해요인별_개선방안.xlsx');
  };

  const filteredItems = activeTab === '전체' 
    ? items 
    : items.filter(item => item.taskName === activeTab);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">침해요인별 개선방안</h1>
          <p className="text-muted-foreground mt-2">
            식별된 침해요인과 개선방안을 관리합니다
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleExportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            엑셀 다운로드
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            저장
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="전체">전체</TabsTrigger>
          {taskNames.map(name => (
            <TabsTrigger key={name} value={name}>{name}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
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
              <div className="space-y-6">
                {filteredItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <Label className="font-semibold">개인정보 처리업무명</Label>
                    <Input value={item.taskName} readOnly className="mt-1" />
                  </div>

                  <div>
                    <Label className="font-semibold">질의문 코드</Label>
                    <Input value={item.code} readOnly className="mt-1" />
                  </div>

                  <div>
                    <Label className="font-semibold">질의문</Label>
                    <Textarea value={item.question} readOnly className="mt-1" rows={2} />
                  </div>

                  <div>
                    <Label className="font-semibold">평가 근거 및 의견</Label>
                    <Textarea value={item.evidence} readOnly className="mt-1" rows={3} />
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

                  <div>
                    <Label htmlFor={`risk-${item.id}`} className="font-semibold">침해요인</Label>
                    <Textarea
                      id={`risk-${item.id}`}
                      value={item.riskFactor}
                      onChange={(e) => handleRiskFactorChange(item.id, e.target.value)}
                      placeholder="침해요인을 입력하세요"
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`plan-${item.id}`} className="font-semibold">개선방안</Label>
                    <Textarea
                      id={`plan-${item.id}`}
                      value={item.improvementPlan}
                      onChange={(e) => handleImprovementPlanChange(item.id, e.target.value)}
                      placeholder="개선방안을 입력하세요"
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

                {filteredItems.length === 0 && (
                  <Card>
                    <CardContent className="py-8">
                      <p className="text-center text-muted-foreground">
                        Lifecycle Checklist에서 부분이행 또는 미이행 항목이 있을 때 표시됩니다.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
