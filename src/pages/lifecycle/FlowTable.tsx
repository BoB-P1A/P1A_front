import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Plus, Trash2, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

// 수집 단계 데이터
interface CollectionData {
  id: string;
  detailTask: string;
  collectionTarget: string;
  collectionPath: string;
  collectionSystem: string;
  collectionItem: string;
  collectionItemName: string;
  collectionPeriod: string;
  collectionManager: string;
  collectionBasis: string;
  isOnline: string;
  isEncrypted: string;
}

// 보유 단계 데이터
interface StorageData {
  id: string;
  detailTask: string;
  inputSystem: string;
  storageSpace: string;
  storageItem: string;
  storageItemName: string;
  encryptionItem: string;
  isOnline: string;
  isEncrypted: string;
}

// 이용 단계 데이터
interface UsageData {
  id: string;
  detailTask: string;
  storageSpace: string;
  usageSystem: string;
  usageItem: string;
  usageItemName: string;
  usagePurpose: string;
  usageMethod: string;
  personalInfoHandler: string;
  isOnline: string;
  isEncrypted: string;
}

// 제공 단계 데이터
interface ProvisionData {
  id: string;
  detailTask: string;
  storageSpace: string;
  provisionSystem: string;
  provider: string;
  recipient: string;
  provisionItem: string;
  provisionItemName: string;
  provisionPurpose: string;
  provisionMethod: string;
  provisionPeriod: string;
  encryptionMethod: string;
  provisionBasis: string;
  provisionSystemOnline: string;
  provisionSystemEncrypted: string;
  recipientOnline: string;
  recipientEncrypted: string;
}

// 파기 단계 데이터
interface DisposalData {
  id: string;
  detailTask: string;
  storageSpace: string;
  disposalSystem: string;
  disposalItem: string;
  disposalItemName: string;
  retentionPeriod: string;
  disposalManager: string;
  disposalProcedure: string;
  separateStorageSpace: string;
  separateStorageEncryptionItem: string;
  disposalOnline: string;
  hasSeparateStorage: string;
  separateStorageOnline: string;
  separateStorageEncrypted: string;
}

interface TaskFlowData {
  collection: CollectionData[];
  storage: StorageData[];
  usage: UsageData[];
  provision: ProvisionData[];
  disposal: DisposalData[];
}

export default function ProtectionFlowTable() {
  const { user } = useAuth();
  const [taskNames, setTaskNames] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState('');
  const [flowDataByTask, setFlowDataByTask] = useState<Record<string, TaskFlowData>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.company) return;
      
      try {
        setLoading(true);
        const tasksResponse = await api.lifecycle.tasks.getAll(user.company);
        const taskNamesList = tasksResponse.map((task: any) => task.taskName).filter((name: string) => name.trim() !== '');
        
        if (taskNamesList.length > 0) {
          setTaskNames(taskNamesList);
          
          const flowTableResponse = await api.lifecycle.flowTables.getAll(user.company);
          
          const newFlowData: Record<string, TaskFlowData> = {};
          taskNamesList.forEach((name: string) => {
            newFlowData[name] = flowTableResponse[name] || {
              collection: [],
              storage: [],
              usage: [],
              provision: [],
              disposal: [],
            };
          });
          
          setFlowDataByTask(newFlowData);
          
          if (!selectedTask || !taskNamesList.includes(selectedTask)) {
            setSelectedTask(taskNamesList[0]);
          }
        }
      } catch (error) {
        toast({ title: '오류', description: '데이터 로딩 실패', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.company]);

  const handleAddRow = (stage: 'collection' | 'storage' | 'usage' | 'provision' | 'disposal') => {
    let newRow: any;

    switch (stage) {
      case 'collection':
        newRow = { detailTask: '', collectionTarget: '', collectionPath: '', collectionSystem: '', collectionItem: '', collectionItemName: '', collectionPeriod: '', collectionManager: '', collectionBasis: '', isOnline: '', isEncrypted: '' };
        break;
      case 'storage':
        newRow = { detailTask: '', inputSystem: '', storageSpace: '', storageItem: '', storageItemName: '', encryptionItem: '', isOnline: '', isEncrypted: '' };
        break;
      case 'usage':
        newRow = { detailTask: '', storageSpace: '', usageSystem: '', usageItem: '', usageItemName: '', usagePurpose: '', usageMethod: '', personalInfoHandler: '', isOnline: '', isEncrypted: '' };
        break;
      case 'provision':
        newRow = { detailTask: '', storageSpace: '', provisionSystem: '', provider: '', recipient: '', provisionItem: '', provisionItemName: '', provisionPurpose: '', provisionMethod: '', provisionPeriod: '', encryptionMethod: '', provisionBasis: '', provisionSystemOnline: '', provisionSystemEncrypted: '', recipientOnline: '', recipientEncrypted: '' };
        break;
      case 'disposal':
        newRow = { detailTask: '', storageSpace: '', disposalSystem: '', disposalItem: '', disposalItemName: '', retentionPeriod: '', disposalManager: '', disposalProcedure: '', separateStorageSpace: '', separateStorageEncryptionItem: '', disposalOnline: '', hasSeparateStorage: '', separateStorageOnline: '', separateStorageEncrypted: '' };
        break;
    }

    setFlowDataByTask(prev => {
      // Ensure the task exists with proper structure
      const currentTask = prev[selectedTask] || {
        collection: [],
        storage: [],
        usage: [],
        provision: [],
        disposal: [],
      };
      
      // Ensure the stage array exists
      const currentStageData = currentTask[stage] || [];
      
      return {
        ...prev,
        [selectedTask]: {
          ...currentTask,
          [stage]: [...currentStageData, newRow],
        },
      };
    });
  };

  const handleDeleteRow = (stage: 'collection' | 'storage' | 'usage' | 'provision' | 'disposal', id: string) => {
    setFlowDataByTask(prev => {
      const currentTask = prev[selectedTask] || {
        collection: [],
        storage: [],
        usage: [],
        provision: [],
        disposal: [],
      };
      const currentStageData = currentTask[stage] || [];
      
      return {
        ...prev,
        [selectedTask]: {
          ...currentTask,
          [stage]: currentStageData.filter((item: any) => item.id !== id),
        },
      };
    });
  };

  const handleEdit = (stage: 'collection' | 'storage' | 'usage' | 'provision' | 'disposal', id: string, field: string, value: string) => {
    setFlowDataByTask(prev => {
      const currentTask = prev[selectedTask] || {
        collection: [],
        storage: [],
        usage: [],
        provision: [],
        disposal: [],
      };
      const currentStageData = currentTask[stage] || [];
      
      return {
        ...prev,
        [selectedTask]: {
          ...currentTask,
          [stage]: currentStageData.map((item: any) => 
            item.id === id ? { ...item, [field]: value } : item
          ),
        },
      };
    });
  };

  const handleSave = async () => {
    if (!user?.company) return;
    
    try {
      setLoading(true);
      const savedData = await api.lifecycle.flowTables.save(user.company, flowDataByTask);
      setFlowDataByTask(savedData);
      toast({ title: '저장되었습니다' });
    } catch (error) {
      toast({ title: '오류', description: '저장 실패', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleExcelDownload = () => {
    const workbook = XLSX.utils.book_new();

    const phaseLabels: Record<string, string> = {
      collection: '수집',
      storage: '보유',
      usage: '이용',
      provision: '제공',
      disposal: '파기',
    };

    ['collection', 'storage', 'usage', 'provision', 'disposal'].forEach(phase => {
      let headers: string[] = [];
      let allRows: any[] = [];
      
      if (phase === 'collection') {
        headers = ['평가업무명', '세부업무명', '수집대상', '수집경로', '수집시스템', '수집항목', '수집항목명칭', '수집주기', '수집담당자', '수집근거', '온라인여부', '암호화여부'];
      } else if (phase === 'storage') {
        headers = ['평가업무명', '세부업무명', '입력시스템', '보유공간', '보유항목', '보유항목명칭', '암호화항목', '온라인여부', '암호화여부'];
      } else if (phase === 'usage') {
        headers = ['평가업무명', '세부업무명', '보유공간', '이용시스템', '이용항목', '이용항목명칭', '이용목적', '이용방법', '개인정보취급자', '온라인여부', '암호화여부'];
      } else if (phase === 'provision') {
        headers = ['평가업무명', '세부업무명', '보유공간', '제공시스템', '제공자', '수신자', '제공항목', '제공항목명칭', '제공목적', '제공방법', '제공주기', '암호화방법', '제공근거', '제공시스템온라인', '제공시스템암호화', '수신자온라인', '수신자암호화'];
      } else {
        headers = ['평가업무명', '세부업무명', '보유공간', '파기시스템', '파기항목', '파기항목명칭', '보관기간', '파기담당자', '파기절차', '분리보관공간', '분리보관암호화항목', '파기온라인', '분리보관', '분리보관온라인', '분리보관암호화'];
      }

      taskNames.forEach(taskName => {
        const taskData = flowDataByTask[taskName];
        const rows = taskData[phase as keyof TaskFlowData];
        rows.forEach((row: any) => {
          allRows.push([taskName, ...Object.values(row).slice(1)]);
        });
      });

      const data = [headers, ...allRows];
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, phaseLabels[phase]);
    });

    XLSX.writeFile(workbook, '개인정보_흐름표.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">개인정보 흐름표</h1>
        <div className="flex gap-2">
          <Button onClick={handleExcelDownload} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            엑셀 다운로드
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            저장
          </Button>
        </div>
      </div>

      <Tabs value={selectedTask} onValueChange={setSelectedTask}>
        <TabsList>
          {taskNames.map(t => <TabsTrigger key={t} value={t}>{t}</TabsTrigger>)}
        </TabsList>

        {taskNames.map(task => (
          <TabsContent key={task} value={task} className="space-y-6">
            {/* 수집 단계 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>수집</CardTitle>
                <Button onClick={() => handleAddRow('collection')} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  행 추가
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">평가업무명</TableHead>
                        <TableHead className="min-w-[120px]">세부업무명</TableHead>
                        <TableHead className="min-w-[120px]">수집대상</TableHead>
                        <TableHead className="min-w-[120px]">수집경로</TableHead>
                        <TableHead className="min-w-[120px]">수집시스템</TableHead>
                        <TableHead className="min-w-[200px]">수집항목</TableHead>
                        <TableHead className="min-w-[150px]">수집항목명칭</TableHead>
                        <TableHead className="min-w-[120px]">수집주기</TableHead>
                        <TableHead className="min-w-[120px]">수집담당자</TableHead>
                        <TableHead className="min-w-[150px]">수집근거</TableHead>
                        <TableHead className="min-w-[100px]">온라인여부</TableHead>
                        <TableHead className="min-w-[100px]">암호화여부</TableHead>
                        <TableHead className="w-[80px]">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flowDataByTask[task]?.collection.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{task}</TableCell>
                          <TableCell><Input value={row.detailTask} onChange={(e) => handleEdit('collection', row.id, 'detailTask', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.collectionTarget} onChange={(e) => handleEdit('collection', row.id, 'collectionTarget', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.collectionPath} onChange={(e) => handleEdit('collection', row.id, 'collectionPath', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.collectionSystem} onChange={(e) => handleEdit('collection', row.id, 'collectionSystem', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.collectionItem} onChange={(e) => handleEdit('collection', row.id, 'collectionItem', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.collectionItemName} onChange={(e) => handleEdit('collection', row.id, 'collectionItemName', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.collectionPeriod} onChange={(e) => handleEdit('collection', row.id, 'collectionPeriod', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.collectionManager} onChange={(e) => handleEdit('collection', row.id, 'collectionManager', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.collectionBasis} onChange={(e) => handleEdit('collection', row.id, 'collectionBasis', e.target.value)} /></TableCell>
                          <TableCell>
                            <Select value={row.isOnline} onValueChange={(value) => handleEdit('collection', row.id, 'isOnline', value)}>
                              <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="True">True</SelectItem>
                                <SelectItem value="False">False</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select value={row.isEncrypted} onValueChange={(value) => handleEdit('collection', row.id, 'isEncrypted', value)}>
                              <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="True">True</SelectItem>
                                <SelectItem value="False">False</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteRow('collection', row.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* 보유 단계 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>보유</CardTitle>
                <Button onClick={() => handleAddRow('storage')} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  행 추가
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">평가업무명</TableHead>
                        <TableHead className="min-w-[120px]">세부업무명</TableHead>
                        <TableHead className="min-w-[120px]">입력시스템</TableHead>
                        <TableHead className="min-w-[120px]">보유공간</TableHead>
                        <TableHead className="min-w-[200px]">보유항목</TableHead>
                        <TableHead className="min-w-[150px]">보유항목명칭</TableHead>
                        <TableHead className="min-w-[200px]">암호화항목</TableHead>
                        <TableHead className="min-w-[100px]">온라인여부</TableHead>
                        <TableHead className="min-w-[100px]">암호화여부</TableHead>
                        <TableHead className="w-[80px]">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flowDataByTask[task]?.storage.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{task}</TableCell>
                          <TableCell><Input value={row.detailTask} onChange={(e) => handleEdit('storage', row.id, 'detailTask', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.inputSystem} onChange={(e) => handleEdit('storage', row.id, 'inputSystem', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.storageSpace} onChange={(e) => handleEdit('storage', row.id, 'storageSpace', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.storageItem} onChange={(e) => handleEdit('storage', row.id, 'storageItem', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.storageItemName} onChange={(e) => handleEdit('storage', row.id, 'storageItemName', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.encryptionItem} onChange={(e) => handleEdit('storage', row.id, 'encryptionItem', e.target.value)} /></TableCell>
                          <TableCell>
                            <Select value={row.isOnline} onValueChange={(value) => handleEdit('storage', row.id, 'isOnline', value)}>
                              <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="True">True</SelectItem>
                                <SelectItem value="False">False</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select value={row.isEncrypted} onValueChange={(value) => handleEdit('storage', row.id, 'isEncrypted', value)}>
                              <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="True">True</SelectItem>
                                <SelectItem value="False">False</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteRow('storage', row.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* 이용 단계 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>이용</CardTitle>
                <Button onClick={() => handleAddRow('usage')} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  행 추가
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">평가업무명</TableHead>
                        <TableHead className="min-w-[120px]">세부업무명</TableHead>
                        <TableHead className="min-w-[120px]">보유공간</TableHead>
                        <TableHead className="min-w-[120px]">이용시스템</TableHead>
                        <TableHead className="min-w-[200px]">이용항목</TableHead>
                        <TableHead className="min-w-[150px]">이용항목명칭</TableHead>
                        <TableHead className="min-w-[150px]">이용목적</TableHead>
                        <TableHead className="min-w-[200px]">이용방법</TableHead>
                        <TableHead className="min-w-[120px]">개인정보취급자</TableHead>
                        <TableHead className="min-w-[100px]">온라인여부</TableHead>
                        <TableHead className="min-w-[100px]">암호화여부</TableHead>
                        <TableHead className="w-[80px]">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flowDataByTask[task]?.usage?.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{task}</TableCell>
                          <TableCell><Input value={row.detailTask} onChange={(e) => handleEdit('usage', row.id, 'detailTask', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.storageSpace} onChange={(e) => handleEdit('usage', row.id, 'storageSpace', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.usageSystem} onChange={(e) => handleEdit('usage', row.id, 'usageSystem', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.usageItem} onChange={(e) => handleEdit('usage', row.id, 'usageItem', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.usageItemName} onChange={(e) => handleEdit('usage', row.id, 'usageItemName', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.usagePurpose} onChange={(e) => handleEdit('usage', row.id, 'usagePurpose', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.usageMethod} onChange={(e) => handleEdit('usage', row.id, 'usageMethod', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.personalInfoHandler} onChange={(e) => handleEdit('usage', row.id, 'personalInfoHandler', e.target.value)} /></TableCell>
                          <TableCell>
                            <Select value={row.isOnline} onValueChange={(value) => handleEdit('usage', row.id, 'isOnline', value)}>
                              <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="True">True</SelectItem>
                                <SelectItem value="False">False</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select value={row.isEncrypted} onValueChange={(value) => handleEdit('usage', row.id, 'isEncrypted', value)}>
                              <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="True">True</SelectItem>
                                <SelectItem value="False">False</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteRow('usage', row.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* 제공 단계 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>제공</CardTitle>
                <Button onClick={() => handleAddRow('provision')} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  행 추가
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">평가업무명</TableHead>
                        <TableHead className="min-w-[120px]">세부업무명</TableHead>
                        <TableHead className="min-w-[120px]">보유공간</TableHead>
                        <TableHead className="min-w-[120px]">제공시스템</TableHead>
                        <TableHead className="min-w-[100px]">제공자</TableHead>
                        <TableHead className="min-w-[100px]">수신자</TableHead>
                        <TableHead className="min-w-[200px]">제공항목</TableHead>
                        <TableHead className="min-w-[150px]">제공항목명칭</TableHead>
                        <TableHead className="min-w-[150px]">제공목적</TableHead>
                        <TableHead className="min-w-[200px]">제공방법</TableHead>
                        <TableHead className="min-w-[100px]">제공주기</TableHead>
                        <TableHead className="min-w-[150px]">암호화방법</TableHead>
                        <TableHead className="min-w-[150px]">제공근거</TableHead>
                        <TableHead className="min-w-[130px]">제공시스템온라인</TableHead>
                        <TableHead className="min-w-[130px]">제공시스템암호화</TableHead>
                        <TableHead className="min-w-[130px]">수신자온라인</TableHead>
                        <TableHead className="min-w-[130px]">수신자암호화</TableHead>
                        <TableHead className="w-[80px]">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flowDataByTask[task]?.provision.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{task}</TableCell>
                          <TableCell><Input value={row.detailTask} onChange={(e) => handleEdit('provision', row.id, 'detailTask', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.storageSpace} onChange={(e) => handleEdit('provision', row.id, 'storageSpace', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.provisionSystem} onChange={(e) => handleEdit('provision', row.id, 'provisionSystem', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.provider} onChange={(e) => handleEdit('provision', row.id, 'provider', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.recipient} onChange={(e) => handleEdit('provision', row.id, 'recipient', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.provisionItem} onChange={(e) => handleEdit('provision', row.id, 'provisionItem', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.provisionItemName} onChange={(e) => handleEdit('provision', row.id, 'provisionItemName', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.provisionPurpose} onChange={(e) => handleEdit('provision', row.id, 'provisionPurpose', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.provisionMethod} onChange={(e) => handleEdit('provision', row.id, 'provisionMethod', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.provisionPeriod} onChange={(e) => handleEdit('provision', row.id, 'provisionPeriod', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.encryptionMethod} onChange={(e) => handleEdit('provision', row.id, 'encryptionMethod', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.provisionBasis} onChange={(e) => handleEdit('provision', row.id, 'provisionBasis', e.target.value)} /></TableCell>
                          <TableCell>
                            <Select value={row.provisionSystemOnline} onValueChange={(value) => handleEdit('provision', row.id, 'provisionSystemOnline', value)}>
                              <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="True">True</SelectItem>
                                <SelectItem value="False">False</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select value={row.provisionSystemEncrypted} onValueChange={(value) => handleEdit('provision', row.id, 'provisionSystemEncrypted', value)}>
                              <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="True">True</SelectItem>
                                <SelectItem value="False">False</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select value={row.recipientOnline} onValueChange={(value) => handleEdit('provision', row.id, 'recipientOnline', value)}>
                              <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="True">True</SelectItem>
                                <SelectItem value="False">False</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select value={row.recipientEncrypted} onValueChange={(value) => handleEdit('provision', row.id, 'recipientEncrypted', value)}>
                              <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="True">True</SelectItem>
                                <SelectItem value="False">False</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteRow('provision', row.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* 파기 단계 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>파기</CardTitle>
                <Button onClick={() => handleAddRow('disposal')} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  행 추가
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">평가업무명</TableHead>
                        <TableHead className="min-w-[120px]">세부업무명</TableHead>
                        <TableHead className="min-w-[120px]">보유공간</TableHead>
                        <TableHead className="min-w-[120px]">파기시스템</TableHead>
                        <TableHead className="min-w-[200px]">파기항목</TableHead>
                        <TableHead className="min-w-[150px]">파기항목명칭</TableHead>
                        <TableHead className="min-w-[100px]">보관기간</TableHead>
                        <TableHead className="min-w-[120px]">파기담당자</TableHead>
                        <TableHead className="min-w-[200px]">파기절차</TableHead>
                        <TableHead className="min-w-[120px]">분리보관공간</TableHead>
                        <TableHead className="min-w-[150px]">분리보관암호화항목</TableHead>
                        <TableHead className="min-w-[100px]">파기온라인</TableHead>
                        <TableHead className="min-w-[120px]">분리보관</TableHead>
                        <TableHead className="min-w-[130px]">분리보관온라인</TableHead>
                        <TableHead className="min-w-[130px]">분리보관암호화</TableHead>
                        <TableHead className="w-[80px]">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flowDataByTask[task]?.disposal.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{task}</TableCell>
                          <TableCell><Input value={row.detailTask} onChange={(e) => handleEdit('disposal', row.id, 'detailTask', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.storageSpace} onChange={(e) => handleEdit('disposal', row.id, 'storageSpace', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.disposalSystem} onChange={(e) => handleEdit('disposal', row.id, 'disposalSystem', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.disposalItem} onChange={(e) => handleEdit('disposal', row.id, 'disposalItem', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.disposalItemName} onChange={(e) => handleEdit('disposal', row.id, 'disposalItemName', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.retentionPeriod} onChange={(e) => handleEdit('disposal', row.id, 'retentionPeriod', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.disposalManager} onChange={(e) => handleEdit('disposal', row.id, 'disposalManager', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.disposalProcedure} onChange={(e) => handleEdit('disposal', row.id, 'disposalProcedure', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.separateStorageSpace} onChange={(e) => handleEdit('disposal', row.id, 'separateStorageSpace', e.target.value)} /></TableCell>
                          <TableCell><Input value={row.separateStorageEncryptionItem} onChange={(e) => handleEdit('disposal', row.id, 'separateStorageEncryptionItem', e.target.value)} /></TableCell>
                          <TableCell>
                            <Select value={row.disposalOnline} onValueChange={(value) => handleEdit('disposal', row.id, 'disposalOnline', value)}>
                              <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="True">True</SelectItem>
                                <SelectItem value="False">False</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select value={row.hasSeparateStorage} onValueChange={(value) => handleEdit('disposal', row.id, 'hasSeparateStorage', value)}>
                              <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="True">True</SelectItem>
                                <SelectItem value="False">False</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select value={row.separateStorageOnline} onValueChange={(value) => handleEdit('disposal', row.id, 'separateStorageOnline', value)}>
                              <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="True">True</SelectItem>
                                <SelectItem value="False">False</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select value={row.separateStorageEncrypted} onValueChange={(value) => handleEdit('disposal', row.id, 'separateStorageEncrypted', value)}>
                              <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="True">True</SelectItem>
                                <SelectItem value="False">False</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteRow('disposal', row.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
