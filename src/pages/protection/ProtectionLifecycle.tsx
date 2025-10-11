import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, Trash2, RotateCcw, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCompanyData, setCompanyData, getCompanyStorageKey } from '@/lib/utils';

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
  taskName: string;
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

interface ProcessingTask {
  id: number;
  taskName: string;
  purpose: string;
  personalInfo: string;
  department: string;
}

export default function ProtectionLifecycle() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ProcessingTask[]>([]);
  const [items, setItems] = useState<LifecycleItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    const loadTasks = () => {
      const processingTasks = getCompanyData(user?.company, 'processingTasks', []);
      if (processingTasks.length > 0) {
        setTasks(processingTasks);
        if (!activeTab) {
          setActiveTab(processingTasks[0].taskName);
        }
      }
    };

    loadTasks();

    const handleStorageUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const taskKey = getCompanyStorageKey(user?.company, 'processingTasks');
      const evalKey = getCompanyStorageKey(user?.company, 'evaluationItems');
      if (customEvent.detail?.key === taskKey || customEvent.detail?.key === evalKey) {
        loadTasks();
      }
    };

    window.addEventListener('storageUpdate', handleStorageUpdate);
    return () => window.removeEventListener('storageUpdate', handleStorageUpdate);
  }, []);

  useEffect(() => {
    if (!activeTab) return;

    const evaluationItems: EvaluationItem[] = getCompanyData(user?.company, 'evaluationItems', []);
    // 평가영역이 '1'로 시작하는 항목들을 필터링 (예: '1. 개인정보 처리단계별 보호조치')
    const filtered = evaluationItems.filter(item => item.area?.startsWith('1.'));

    const savedItems: LifecycleItem[] = getCompanyData(user?.company, 'lifecycleData', []);
    const savedForTask = savedItems.filter((s) => s.taskName === activeTab);

    const merged: LifecycleItem[] = filtered.map((item) => {
      const saved = savedForTask.find((s) => s.id === item.id);
      return {
        id: item.id,
        taskName: activeTab,
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
  }, [activeTab, tasks.length, user?.company]);

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
    const savedAll: LifecycleItem[] = getCompanyData(user?.company, 'lifecycleData', []);
    const others = savedAll.filter((s) => s.taskName !== activeTab);
    const toSave = items.map((it) => ({ ...it, taskName: activeTab }));
    setCompanyData(user?.company, 'lifecycleData', [...others, ...toSave]);
    setHasChanges(false);
  };

  const handleReset = () => {
    setItems(prev => prev.map(item => ({ ...item, status: null, evidence: '', files: [] })));
    setHasChanges(true);
  };

  const getItemsForTask = (taskName: string) => {
    return items;
  };

  if (tasks.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              처리업무표에서 평가업무를 추가해주세요.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Lifecycle Checklist</h1>
        <div className="space-x-2">
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {tasks.map(task => (
            <TabsTrigger key={task.id} value={task.taskName}>
              {task.taskName}
            </TabsTrigger>
          ))}
        </TabsList>

        {tasks.map(task => (
          <TabsContent key={task.id} value={task.taskName} className="mt-6">
            <div className="space-y-6">
              {getItemsForTask(task.taskName).map((item, index, array) => {
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

              {getItemsForTask(task.taskName).length === 0 && (
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
    </div>
  );
}
