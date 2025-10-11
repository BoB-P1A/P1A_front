import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, ClipboardList, Save } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { getCompanyData, setCompanyData, getCompanyStorageKey } from '@/lib/utils';
import { toast } from 'sonner';

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

interface ActionPlanItem {
  id: string;
  taskName: string;
  code: string;
  question: string;
  evidence: string;
  improvementGuide: string;
  actionPlan: string;
  actionPeriod: string;
  department: string;
  manager: string;
  actionDate: string;
}

export default function ActionPlan() {
  const { user } = useAuth();
  const [items, setItems] = useState<ActionPlanItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('전체');
  const [taskNames, setTaskNames] = useState<string[]>([]);

  useEffect(() => {
    const loadData = () => {
      const tasks = getCompanyData(user?.company, 'processingTasks', []);
      if (tasks.length > 0) {
        const names = tasks.map((t: any) => t.taskName);
        setTaskNames(names);
      }
    };

    loadData();

    const onStorage = (e: Event) => {
      const customEvent = e as CustomEvent;
      const taskKey = getCompanyStorageKey(user?.company, 'processingTasks');
      if (customEvent.detail?.key === taskKey) {
        loadData();
      }
    };
    window.addEventListener('storageUpdate', onStorage);
    return () => window.removeEventListener('storageUpdate', onStorage);
  }, [user?.company]);

  useEffect(() => {
    const loadActionPlans = () => {
      const parsed: LifecycleItem[] = getCompanyData(user?.company, 'lifecycleData', []);
      const filtered = parsed.filter(item => 
        item.status === '부분이행' || item.status === '미이행'
      );

      const savedImprovements = getCompanyData(user?.company, 'protectionImprovements', {});
      const savedActionPlans = getCompanyData(user?.company, 'protectionActionPlans', {});

      const actionPlanItems: ActionPlanItem[] = filtered.map(item => {
        const itemId = `${item.taskName}-${item.no}`;
        const savedImprovement = savedImprovements[itemId];
        const savedActionPlan = savedActionPlans[itemId];
        return {
          id: itemId,
          taskName: item.taskName,
          code: item.no,
          question: item.item,
          evidence: item.evidence,
          improvementGuide: savedImprovement?.improvementPlan || '',
          actionPlan: savedActionPlan?.actionPlan || '',
          actionPeriod: savedActionPlan?.actionPeriod || '',
          department: savedActionPlan?.department || '',
          manager: savedActionPlan?.manager || '',
          actionDate: savedActionPlan?.actionDate || '',
        };
      });

      setItems(actionPlanItems);
    };

    loadActionPlans();

    const handleStorageUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const lifecycleKey = getCompanyStorageKey(user?.company, 'lifecycleData');
      const improvementsKey = getCompanyStorageKey(user?.company, 'protectionImprovements');
      if (customEvent.detail?.key === lifecycleKey || customEvent.detail?.key === improvementsKey) {
        loadActionPlans();
      }
    };

    window.addEventListener('storageUpdate', handleStorageUpdate);
    return () => window.removeEventListener('storageUpdate', handleStorageUpdate);
  }, [user?.company]);

  const handleFieldChange = (id: string, field: keyof ActionPlanItem, value: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
    setHasChanges(true);
  };

  const handleSave = () => {
    const actionPlans: { [key: string]: any } = {};
    items.forEach(item => {
      actionPlans[item.id] = {
        actionPlan: item.actionPlan,
        actionPeriod: item.actionPeriod,
        department: item.department,
        manager: item.manager,
        actionDate: item.actionDate,
      };
    });
    setCompanyData(user?.company, 'protectionActionPlans', actionPlans);
    setHasChanges(false);
    toast.success('저장되었습니다');
  };

  const handleExportToExcel = () => {
    const exportData = filteredItems.map(item => ({
      '개인정보 처리업무명': item.taskName,
      '질의문 코드': item.code,
      '질의문': item.question,
      '취약점': item.evidence,
      '개선 가이드': item.improvementGuide,
      '조치 방안': item.actionPlan,
      '조치 기간': item.actionPeriod,
      '부서': item.department,
      '담당자': item.manager,
      '조치 일시': item.actionDate,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '조치 계획 수립');
    XLSX.writeFile(wb, '개인정보_조치_계획_수립.xlsx');
  };

  const filteredItems = activeTab === '전체' 
    ? items 
    : items.filter(item => item.taskName === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">개인정보 처리단계별 보호조치 조치 계획 수립</h1>
          <p className="text-muted-foreground mt-2">
            침해요인에 대한 조치 계획을 수립하고 관리합니다
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
                <ClipboardList className="h-5 w-5 text-primary" />
                조치 계획 목록
              </CardTitle>
              <CardDescription>
                각 침해요인에 대한 조치 계획을 수립하세요
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
                    <Label className="font-semibold">취약점</Label>
                    <Textarea value={item.evidence} readOnly className="mt-1" rows={3} />
                  </div>

                  <div>
                    <Label className="font-semibold">개선 가이드</Label>
                    <Textarea value={item.improvementGuide} readOnly className="mt-1" rows={3} />
                  </div>

                  <div>
                    <Label htmlFor={`action-${item.id}`} className="font-semibold">조치 방안</Label>
                    <Textarea
                      id={`action-${item.id}`}
                      value={item.actionPlan}
                      onChange={(e) => handleFieldChange(item.id, 'actionPlan', e.target.value)}
                      placeholder="조치 방안을 입력하세요"
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`period-${item.id}`} className="font-semibold">조치 기간</Label>
                    <Input
                      id={`period-${item.id}`}
                      value={item.actionPeriod}
                      onChange={(e) => handleFieldChange(item.id, 'actionPeriod', e.target.value)}
                      placeholder="예: 2024-01-01 ~ 2024-12-31"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`dept-${item.id}`} className="font-semibold">부서</Label>
                    <Input
                      id={`dept-${item.id}`}
                      value={item.department}
                      onChange={(e) => handleFieldChange(item.id, 'department', e.target.value)}
                      placeholder="담당 부서를 입력하세요"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`manager-${item.id}`} className="font-semibold">담당자</Label>
                    <Input
                      id={`manager-${item.id}`}
                      value={item.manager}
                      onChange={(e) => handleFieldChange(item.id, 'manager', e.target.value)}
                      placeholder="담당자를 입력하세요"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`date-${item.id}`} className="font-semibold">조치 일시</Label>
                    <Input
                      id={`date-${item.id}`}
                      value={item.actionDate}
                      onChange={(e) => handleFieldChange(item.id, 'actionDate', e.target.value)}
                      placeholder="조치 일시를 입력하세요"
                      className="mt-1"
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
