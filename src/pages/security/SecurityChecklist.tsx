import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Upload, Download, RotateCcw, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCompanyData, setCompanyData, getCompanyStorageKey } from '@/lib/utils';
import { toast } from 'sonner';

interface EvaluationItem {
  id: number;
  area: string;
  field: string;
  subField: string;
  no: string;
  item: string;
}

interface SecurityItem {
  id: number;
  targetName: string;
  field: string;
  subField: string;
  no: string;
  item: string;
  status: '이행' | '부분이행' | '미이행' | '해당없음' | null;
  evidence: string;
  files: FileAttachment[];
}

interface FileAttachment {
  name: string;
  data: string;
  type: string;
}

interface TargetInfo {
  id: number;
  name: string;
}

export default function SecurityChecklist() {
  const { user } = useAuth();
  const [targets, setTargets] = useState<TargetInfo[]>([]);
  const [items, setItems] = useState<SecurityItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<TargetInfo | null>(null);
  const [targetName, setTargetName] = useState('');

  useEffect(() => {
    const loadTargets = () => {
      const savedTargets = getCompanyData(user?.company, 'securityTargets', []);
      if (savedTargets.length > 0) {
        setTargets(savedTargets);
        if (!activeTab) {
          setActiveTab(savedTargets[0].name);
        }
      }

      const evaluationItems = getCompanyData(user?.company, 'evaluationItems', []);
      // 평가영역이 '3'으로 시작하는 항목들을 필터링 (예: '3. 보안성 검토')
      const filtered = evaluationItems.filter((item: any) => item.area?.startsWith('3.'));
      
      const savedData = getCompanyData(user?.company, 'securityData', []);
      
      const securityItems: SecurityItem[] = filtered.map((item: any) => {
        const saved = savedData.find((s: SecurityItem) => s.id === item.id);
        return {
          id: item.id,
          targetName: saved?.targetName || (targets.length > 0 ? targets[0].name : ''),
          field: item.field,
          subField: item.subField,
          no: item.no,
          item: item.item,
          status: saved?.status || null,
          evidence: saved?.evidence || '',
          files: saved?.files || [],
        };
      });
      
      setItems(securityItems);
    };

    loadTargets();

    const handleStorageUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const targetsKey = getCompanyStorageKey(user?.company, 'securityTargets');
      const evalKey = getCompanyStorageKey(user?.company, 'evaluationItems');
      if (customEvent.detail?.key === targetsKey || customEvent.detail?.key === evalKey) {
        loadTargets();
      }
    };

    window.addEventListener('storageUpdate', handleStorageUpdate);
    return () => window.removeEventListener('storageUpdate', handleStorageUpdate);
  }, [user?.company, activeTab]);

  useEffect(() => {
    if (!activeTab) return;

    const evaluationItems = getCompanyData(user?.company, 'evaluationItems', []);
    // 평가영역이 '3'으로 시작하는 항목들을 필터링 (예: '3. 보안성 검토')
    const filtered = evaluationItems.filter((item: any) => item.area?.startsWith('3.'));

    const savedItems: SecurityItem[] = getCompanyData(user?.company, 'securityData', []);
    const savedForTarget = savedItems.filter((s) => s.targetName === activeTab);

    const merged: SecurityItem[] = filtered.map((item: any) => {
      const saved = savedForTarget.find((s: any) => s.id === item.id);
      return {
        id: item.id,
        targetName: activeTab,
        field: item.field,
        subField: item.subField,
        no: item.no,
        item: item.item,
        status: saved?.status ?? null,
        evidence: saved?.evidence ?? '',
        files: saved?.files ?? [],
      };
    });

    setItems(merged);
  }, [activeTab, targets.length, user?.company]);

  const handleStatusChange = (id: number, status: '이행' | '부분이행' | '미이행' | '해당없음') => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
    setHasChanges(true);
  };

  const handleEvidenceChange = (id: number, evidence: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, evidence } : item));
    setHasChanges(true);
  };

  const handleFileUpload = (id: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData: FileAttachment = {
          name: file.name,
          data: e.target?.result as string,
          type: file.type,
        };
        setItems(prev => prev.map(item => 
          item.id === id ? { ...item, files: [...item.files, fileData] } : item
        ));
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileDelete = (itemId: number, fileName: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, files: item.files.filter(f => f.name !== fileName) } 
        : item
    ));
    setHasChanges(true);
  };

  const handleFileDownload = (file: FileAttachment) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    link.click();
  };

  const handleSave = () => {
    try {
      const savedAll: SecurityItem[] = getCompanyData(user?.company, 'securityData', []);
      const others = savedAll.filter((s) => s.targetName !== activeTab);
      const toSave = items.map((it) => ({ ...it, targetName: activeTab }));
      setCompanyData(user?.company, 'securityData', [...others, ...toSave]);
      setHasChanges(false);
      toast.success('저장되었습니다');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        toast.error('저장 용량이 초과되었습니다. 파일 크기를 줄이거나 개수를 줄여주세요.');
      } else {
        toast.error('저장 중 오류가 발생했습니다.');
      }
    }
  };

  const handleReset = () => {
    setItems(prev => prev.map(item => ({ ...item, status: null, evidence: '', files: [] })));
    setHasChanges(true);
  };

  const handleOpenDialog = (target?: TargetInfo) => {
    if (target) {
      setEditingTarget(target);
      setTargetName(target.name);
    } else {
      setEditingTarget(null);
      setTargetName('');
    }
    setIsDialogOpen(true);
  };

  const handleSaveTarget = () => {
    let updatedTargets;
    if (editingTarget) {
      updatedTargets = targets.map(t => 
        t.id === editingTarget.id ? { ...t, name: targetName } : t
      );
    } else {
      const newTarget: TargetInfo = {
        id: Date.now(),
        name: targetName,
      };
      updatedTargets = [...targets, newTarget];
      if (targets.length === 0) {
        setActiveTab(targetName);
      }
    }
    setTargets(updatedTargets);
    setCompanyData(user?.company, 'securityTargets', updatedTargets);
    setIsDialogOpen(false);
    setEditingTarget(null);
    setTargetName('');
  };

  const handleDeleteTarget = (id: number) => {
    const updatedTargets = targets.filter(t => t.id !== id);
    setTargets(updatedTargets);
    setCompanyData(user?.company, 'securityTargets', updatedTargets);
    if (updatedTargets.length > 0 && activeTab === targets.find(t => t.id === id)?.name) {
      setActiveTab(updatedTargets[0].name);
    }
  };

  const getItemsForTarget = (targetName: string) => {
    return targetName === activeTab ? items : [];
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold text-primary">보안성 검토 Checklist</h1>
        <div className="space-x-2 flex items-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                검토대상 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTarget ? '검토대상 수정' : '새 검토대상 추가'}
                </DialogTitle>
                <DialogDescription>
                  검토대상명을 입력해주세요
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="targetName">검토대상명</Label>
                  <Input
                    id="targetName" 
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    placeholder="예: 회원관리시스템"
                  />
                </div>
                <Button onClick={handleSaveTarget} className="w-full">
                  저장
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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

      {targets.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              검토대상을 추가해주세요.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              {targets.map(target => (
                <TabsTrigger key={target.id} value={target.name}>
                  {target.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex gap-2">
              {targets.map(target => 
                activeTab === target.name && (
                  <div key={target.id} className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleOpenDialog(target)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteTarget(target.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              )}
            </div>
          </div>

          {targets.map(target => (
            <TabsContent key={target.id} value={target.name}>
              <div className="space-y-6">
                {getItemsForTarget(target.name).map((item, index, array) => {
                  const prevItem = index > 0 ? array[index - 1] : null;
                  const showFieldHeader = !prevItem || prevItem.field !== item.field;
                  
                  return (
                    <div key={item.id}>
                      {showFieldHeader && (
                        <div className="mb-4 mt-6 first:mt-0">
                          <h2 className="text-xl font-semibold text-primary border-b pb-2">
                            {item.field}
                          </h2>
                        </div>
                      )}
                      <Card>
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
                        <Label className="font-semibold">증적 자료</Label>
                        <div className="mt-2 space-y-2">
                          {item.files.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm truncate flex-1">{file.name}</span>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleFileDownload(file)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleFileDelete(item.id, file.name)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <div>
                            <input
                              type="file"
                              id={`file-${item.id}`}
                              className="hidden"
                              onChange={(e) => handleFileUpload(item.id, e)}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById(`file-${item.id}`)?.click()}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              파일 업로드
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                      </Card>
                    </div>
                  );
                })}

                {getItemsForTarget(target.name).length === 0 && (
                  <Card>
                    <CardContent className="py-8">
                      <p className="text-center text-muted-foreground">
                        평가 항목이 없습니다. 영향평가 관리에서 평가 항목을 추가해주세요.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
