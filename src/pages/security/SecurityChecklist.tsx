import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, RotateCcw, Save, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCompanyData, setCompanyData, getCompanyStorageKey } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface SecurityItem {
  id: number;
  targetName: string;
  category: string;
  subField: string;
  no: string;
  item: string;
  status: '이행' | '부분이행' | '미이행' | '해당없음' | null;
  evidence: string;
  files: any[];
}

export default function SecurityChecklist() {
  const { user } = useAuth();
  const [items, setItems] = useState<SecurityItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('전체');
  const [targetNames, setTargetNames] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTargetName, setNewTargetName] = useState('');

  useEffect(() => {
    const loadEvaluationItems = () => {
      const evaluationItems = getCompanyData(user?.company, 'evaluationItems', []);
      // 평가영역이 '3'으로 시작하는 항목들을 필터링 (예: '3. 보안성 검토')
      const securityItems = evaluationItems.filter((item: any) => item.area?.startsWith('3.'));
      
      const targets = getCompanyData(user?.company, 'securityTargets', []);
      const savedData = getCompanyData(user?.company, 'securityData', []);
      
      if (targets.length > 0) {
        const names = targets.map((t: any) => t.name);
        setTargetNames(names);
      }

      const expandedItems: SecurityItem[] = [];
      targets.forEach((target: any) => {
        securityItems.forEach((evalItem: any) => {
          const itemId = `${target.name}-${evalItem.no}`;
          const existing = savedData.find((d: any) => d.id === itemId);
          expandedItems.push({
            id: existing?.id || itemId,
            targetName: target.name,
            category: evalItem.field,
            subField: evalItem.subField,
            no: evalItem.no,
            item: evalItem.item,
            status: existing?.status || null,
            evidence: existing?.evidence || '',
            files: existing?.files || [],
          });
        });
      });

      setItems(expandedItems);
    };

    loadEvaluationItems();

    const handleStorageUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const targetsKey = getCompanyStorageKey(user?.company, 'securityTargets');
      const evaluationKey = getCompanyStorageKey(user?.company, 'evaluationItems');
      if (customEvent.detail?.key === targetsKey || customEvent.detail?.key === evaluationKey) {
        loadEvaluationItems();
      }
    };

    window.addEventListener('storageUpdate', handleStorageUpdate);
    return () => window.removeEventListener('storageUpdate', handleStorageUpdate);
  }, [user?.company]);

  const handleAddTarget = () => {
    if (!newTargetName.trim()) {
      toast.error('검토대상명을 입력하세요');
      return;
    }
    
    const targets = getCompanyData(user?.company, 'securityTargets', []);
    const newTarget = { id: Date.now(), name: newTargetName };
    const updatedTargets = [...targets, newTarget];
    
    setCompanyData(user?.company, 'securityTargets', updatedTargets);
    setNewTargetName('');
    setIsDialogOpen(false);
    toast.success('검토대상이 추가되었습니다');
  };

  const handleDeleteTarget = (targetName: string) => {
    if (!confirm(`"${targetName}" 검토대상을 삭제하시겠습니까?`)) return;
    
    const targets = getCompanyData(user?.company, 'securityTargets', []);
    const updatedTargets = targets.filter((t: any) => t.name !== targetName);
    setCompanyData(user?.company, 'securityTargets', updatedTargets);
    
    const updatedItems = items.filter(item => item.targetName !== targetName);
    setItems(updatedItems);
    
    if (activeTab === targetName) {
      setActiveTab('전체');
    }
    
    toast.success('검토대상이 삭제되었습니다');
  };

  const handleStatusChange = (id: number | string, status: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: status as any } : item
    ));
  };

  const handleEvidenceChange = (id: number | string, evidence: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, evidence } : item
    ));
  };

  const handleSave = () => {
    setCompanyData(user?.company, 'securityData', items);
    toast.success('저장되었습니다');
  };

  const handleReset = () => {
    if (!confirm('모든 데이터를 초기화하시겠습니까?')) return;
    setCompanyData(user?.company, 'securityData', []);
    setCompanyData(user?.company, 'securityTargets', []);
    setItems([]);
    setTargetNames([]);
    setActiveTab('전체');
    toast.success('초기화되었습니다');
  };

  const filteredItems = activeTab === '전체' 
    ? items 
    : items.filter(item => item.targetName === activeTab);

  const groupedItems: { [key: string]: SecurityItem[] } = {};
  filteredItems.forEach(item => {
    if (!groupedItems[item.category]) {
      groupedItems[item.category] = [];
    }
    groupedItems[item.category].push(item);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">보안성 검토 Checklist</h1>
          <p className="text-muted-foreground mt-2">
            보안성 검토 항목에 대한 평가를 수행합니다
          </p>
        </div>
        <div className="space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                검토대상 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 검토대상 추가</DialogTitle>
                <DialogDescription>검토대상명을 입력하세요</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="targetName">검토대상명</Label>
                  <Input
                    id="targetName"
                    value={newTargetName}
                    onChange={(e) => setNewTargetName(e.target.value)}
                    placeholder="예: 회원관리 시스템"
                  />
                </div>
                <Button onClick={handleAddTarget} className="w-full">추가</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            초기화
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            저장
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="전체">전체</TabsTrigger>
          {targetNames.map(name => (
            <TabsTrigger key={name} value={name}>{name}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          {activeTab !== '전체' && (
            <div className="mb-4">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDeleteTarget(activeTab)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                "{activeTab}" 검토대상 삭제
              </Button>
            </div>
          )}

          {Object.keys(groupedItems).map((category) => (
            <Card key={category} className="mb-6">
              <CardHeader>
                <CardTitle>{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {groupedItems[category].map((item) => (
                    <Card key={item.id}>
                      <CardContent className="space-y-4 pt-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="font-semibold">검토대상명</Label>
                            <Input value={item.targetName} readOnly className="mt-1" />
                          </div>
                          <div>
                            <Label className="font-semibold">질의문 코드</Label>
                            <Input value={item.no} readOnly className="mt-1" />
                          </div>
                        </div>

                        <div>
                          <Label className="font-semibold">세부분야</Label>
                          <Input value={item.subField} readOnly className="mt-1" />
                        </div>

                        <div>
                          <Label className="font-semibold">질의문</Label>
                          <Textarea value={item.item} readOnly className="mt-1" rows={2} />
                        </div>

                        <div>
                          <Label htmlFor={`status-${item.id}`} className="font-semibold">평가</Label>
                          <Select 
                            value={item.status || ''} 
                            onValueChange={(value) => handleStatusChange(item.id, value)}
                          >
                            <SelectTrigger id={`status-${item.id}`} className="mt-1">
                              <SelectValue placeholder="평가를 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="이행">이행</SelectItem>
                              <SelectItem value="부분이행">부분이행</SelectItem>
                              <SelectItem value="미이행">미이행</SelectItem>
                              <SelectItem value="해당없음">해당없음</SelectItem>
                            </SelectContent>
                          </Select>
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredItems.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  검토대상을 추가하고 평가를 시작하세요.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
