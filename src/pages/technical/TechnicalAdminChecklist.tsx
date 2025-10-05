import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Upload, Download } from 'lucide-react';

interface EvaluationItem {
  id: number;
  area: string;
  field: string;
  subField: string;
  no: string;
  item: string;
}

interface TechnicalItem {
  id: number;
  systemName: string;
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

interface SystemInfo {
  id: number;
  name: string;
}

export default function TechnicalAdminChecklist() {
  const [systems, setSystems] = useState<SystemInfo[]>([]);
  const [items, setItems] = useState<TechnicalItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState<SystemInfo | null>(null);
  const [systemName, setSystemName] = useState('');

  useEffect(() => {
    const savedSystems = localStorage.getItem('technicalSystems');
    if (savedSystems) {
      const parsed: SystemInfo[] = JSON.parse(savedSystems);
      setSystems(parsed);
      if (parsed.length > 0 && !activeTab) {
        setActiveTab(parsed[0].name);
      }
    }

    const evaluationItems = localStorage.getItem('evaluationItems');
    if (evaluationItems) {
      const parsed: EvaluationItem[] = JSON.parse(evaluationItems);
      const filtered = parsed.filter(item => item.area === '4. 대상시스템의 기술적 보호조치');
      
      const savedData = localStorage.getItem('technicalData');
      const savedItems = savedData ? JSON.parse(savedData) : [];
      
      const technicalItems: TechnicalItem[] = filtered.map(item => {
        const saved = savedItems.find((s: TechnicalItem) => s.id === item.id);
        return {
          id: item.id,
          systemName: saved?.systemName || (systems.length > 0 ? systems[0].name : ''),
          field: item.field,
          subField: item.subField,
          no: item.no,
          item: item.item,
          status: saved?.status || null,
          evidence: saved?.evidence || '',
          files: saved?.files || [],
        };
      });
      
      setItems(technicalItems);
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
    const updatedItems = items.map(item => ({
      ...item,
      systemName: activeTab
    }));
    localStorage.setItem('technicalData', JSON.stringify(updatedItems));
    setItems(updatedItems);
    setHasChanges(false);
  };

  const handleReset = () => {
    setItems(prev => prev.map(item => ({ ...item, status: null, evidence: '', files: [] })));
    setHasChanges(true);
  };

  const handleOpenDialog = (system?: SystemInfo) => {
    if (system) {
      setEditingSystem(system);
      setSystemName(system.name);
    } else {
      setEditingSystem(null);
      setSystemName('');
    }
    setIsDialogOpen(true);
  };

  const handleSaveSystem = () => {
    let updatedSystems;
    if (editingSystem) {
      updatedSystems = systems.map(s => 
        s.id === editingSystem.id ? { ...s, name: systemName } : s
      );
    } else {
      const newSystem: SystemInfo = {
        id: Date.now(),
        name: systemName,
      };
      updatedSystems = [...systems, newSystem];
      if (systems.length === 0) {
        setActiveTab(systemName);
      }
    }
    setSystems(updatedSystems);
    localStorage.setItem('technicalSystems', JSON.stringify(updatedSystems));
    setIsDialogOpen(false);
    setEditingSystem(null);
    setSystemName('');
  };

  const handleDeleteSystem = (id: number) => {
    const updatedSystems = systems.filter(s => s.id !== id);
    setSystems(updatedSystems);
    localStorage.setItem('technicalSystems', JSON.stringify(updatedSystems));
    if (updatedSystems.length > 0 && activeTab === systems.find(s => s.id === id)?.name) {
      setActiveTab(updatedSystems[0].name);
    }
  };

  const getItemsForSystem = (systemName: string) => {
    return items;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold">Admin Checklist</h1>
        <div className="space-x-2 flex items-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                시스템 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSystem ? '시스템 수정' : '새 시스템 추가'}
                </DialogTitle>
                <DialogDescription>
                  시스템명을 입력해주세요
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="systemName">시스템명</Label>
                  <Input 
                    id="systemName" 
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    placeholder="예: 회원관리시스템"
                  />
                </div>
                <Button onClick={handleSaveSystem} className="w-full">
                  저장
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleReset}>초기화</Button>
          <Button onClick={handleSave} disabled={!hasChanges}>저장</Button>
        </div>
      </div>

      {systems.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              시스템을 추가해주세요.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              {systems.map(system => (
                <TabsTrigger key={system.id} value={system.name}>
                  {system.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex gap-2">
              {systems.map(system => 
                activeTab === system.name && (
                  <div key={system.id} className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleOpenDialog(system)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteSystem(system.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              )}
            </div>
          </div>

          {systems.map(system => (
            <TabsContent key={system.id} value={system.name}>
              <div className="space-y-6">
                {getItemsForSystem(system.name).map((item, index, array) => {
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

                {getItemsForSystem(system.name).length === 0 && (
                  <Card>
                    <CardContent className="py-8">
                      <p className="text-center text-muted-foreground">
                        영향평가 관리 페이지에서 평가항목을 추가해주세요.
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
