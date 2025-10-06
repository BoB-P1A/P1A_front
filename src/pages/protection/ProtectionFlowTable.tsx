import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Plus, Trash2, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as XLSX from 'xlsx';

// 수집 단계 데이터
interface CollectionData {
  id: string;
  collectionItem: string;
  collectionPath: string;
  collectionTarget: string;
  collectionPeriod: string;
  collectionManager: string;
  collectionBasis: string;
}

// 보유·이용 단계 데이터
interface StorageData {
  id: string;
  storageType: string;
  encryptionItem: string;
  usagePurpose: string;
  usageItem: string;
  personalInfoHandler: string;
  usageMethod: string;
}

// 제공 단계 데이터
interface ProvisionData {
  id: string;
  provisionPurpose: string;
  provider: string;
  recipient: string;
  provisionInfo: string;
  provisionMethod: string;
  provisionPeriod: string;
  encryptionStatus: string;
  provisionBasis: string;
}

// 파기 단계 데이터
interface DisposalData {
  id: string;
  retentionPeriod: string;
  disposalManager: string;
  disposalProcedure: string;
  separateStorageStatus: string;
}

interface TaskFlowData {
  collection: CollectionData[];
  storage: StorageData[];
  provision: ProvisionData[];
  disposal: DisposalData[];
}

export default function ProtectionFlowTable() {
  const [taskNames, setTaskNames] = useState<string[]>(['회원가입', '고객상담']);
  const [selectedTask, setSelectedTask] = useState('회원가입');
  const [flowDataByTask, setFlowDataByTask] = useState<Record<string, TaskFlowData>>({
    '회원가입': {
      collection: [],
      storage: [],
      provision: [],
      disposal: [],
    },
    '고객상담': {
      collection: [],
      storage: [],
      provision: [],
      disposal: [],
    },
  });

  // 처리업무표에서 업무명 가져오기
  useEffect(() => {
    const savedTasks = localStorage.getItem('processingTasks');
    if (savedTasks) {
      const tasks = JSON.parse(savedTasks);
      const taskNamesList = tasks.map((task: any) => task.taskName).filter((name: string) => name.trim() !== '');
      if (taskNamesList.length > 0) {
        setTaskNames(taskNamesList);
        
        // 새로운 업무에 대한 빈 데이터 구조 생성
        const newFlowData = { ...flowDataByTask };
        taskNamesList.forEach((name: string) => {
          if (!newFlowData[name]) {
            newFlowData[name] = {
              collection: [],
              storage: [],
              provision: [],
              disposal: [],
            };
          }
        });
        setFlowDataByTask(newFlowData);
        
        // 선택된 태스크가 없으면 첫 번째로 설정
        if (!taskNamesList.includes(selectedTask)) {
          setSelectedTask(taskNamesList[0]);
        }
      }
    }
  }, []);

  const handleAddRow = (stage: 'collection' | 'storage' | 'provision' | 'disposal') => {
    const newId = Date.now().toString();
    let newRow: any;

    switch (stage) {
      case 'collection':
        newRow = { id: newId, collectionItem: '', collectionPath: '', collectionTarget: '', collectionPeriod: '', collectionManager: '', collectionBasis: '' };
        break;
      case 'storage':
        newRow = { id: newId, storageType: '', encryptionItem: '', usagePurpose: '', usageItem: '', personalInfoHandler: '', usageMethod: '' };
        break;
      case 'provision':
        newRow = { id: newId, provisionPurpose: '', provider: '', recipient: '', provisionInfo: '', provisionMethod: '', provisionPeriod: '', encryptionStatus: '', provisionBasis: '' };
        break;
      case 'disposal':
        newRow = { id: newId, retentionPeriod: '', disposalManager: '', disposalProcedure: '', separateStorageStatus: '' };
        break;
    }

    setFlowDataByTask(prev => ({
      ...prev,
      [selectedTask]: {
        ...prev[selectedTask],
        [stage]: [...prev[selectedTask][stage], newRow],
      },
    }));
  };

  const handleDeleteRow = (stage: 'collection' | 'storage' | 'provision' | 'disposal', id: string) => {
    setFlowDataByTask(prev => ({
      ...prev,
      [selectedTask]: {
        ...prev[selectedTask],
        [stage]: prev[selectedTask][stage].filter((item: any) => item.id !== id),
      },
    }));
  };

  const handleEdit = (stage: 'collection' | 'storage' | 'provision' | 'disposal', id: string, field: string, value: string) => {
    setFlowDataByTask(prev => ({
      ...prev,
      [selectedTask]: {
        ...prev[selectedTask],
        [stage]: prev[selectedTask][stage].map((item: any) => 
          item.id === id ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  const handleSave = () => {
    localStorage.setItem('flowTableData', JSON.stringify(flowDataByTask));
    alert('저장되었습니다.');
  };

  const handleExcelDownload = () => {
    const workbook = XLSX.utils.book_new();

    const phaseLabels: Record<string, string> = {
      collection: '수집',
      storage: '보유이용',
      provision: '제공',
      disposal: '파기',
    };

    ['collection', 'storage', 'provision', 'disposal'].forEach(phase => {
      let headers: string[] = [];
      let allRows: any[] = [];
      
      if (phase === 'collection') {
        headers = ['평가업무명', '수집 항목', '수집 경로', '수집 대상', '수집 주기', '수집 담당자', '수집 근거'];
      } else if (phase === 'storage') {
        headers = ['평가업무명', '보유 형태', '암호화 항목', '이용 목적', '이용 항목', '개인정보취급자', '이용 방법'];
      } else if (phase === 'provision') {
        headers = ['평가업무명', '제공 목적', '제공자', '수신자', '제공 정보', '제공 방법', '제공 주기', '암호화 여부', '제공근거'];
      } else {
        headers = ['평가업무명', '보관 기간', '파기 담당자', '파기 절차', '분리보관 여부'];
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
            전체 저장
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
                        <TableHead className="min-w-[120px]">평가 업무명</TableHead>
                        <TableHead className="min-w-[150px]">수집 항목</TableHead>
                        <TableHead className="min-w-[120px]">수집 경로</TableHead>
                        <TableHead className="min-w-[120px]">수집 대상</TableHead>
                        <TableHead className="min-w-[120px]">수집 주기</TableHead>
                        <TableHead className="min-w-[120px]">수집 담당자</TableHead>
                        <TableHead className="min-w-[120px]">수집 근거</TableHead>
                        <TableHead className="w-[80px]">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flowDataByTask[task]?.collection.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{task}</TableCell>
                          <TableCell>
                            <Input value={row.collectionItem} onChange={(e) => handleEdit('collection', row.id, 'collectionItem', e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Input value={row.collectionPath} onChange={(e) => handleEdit('collection', row.id, 'collectionPath', e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Input value={row.collectionTarget} onChange={(e) => handleEdit('collection', row.id, 'collectionTarget', e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Input value={row.collectionPeriod} onChange={(e) => handleEdit('collection', row.id, 'collectionPeriod', e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Input value={row.collectionManager} onChange={(e) => handleEdit('collection', row.id, 'collectionManager', e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Input value={row.collectionBasis} onChange={(e) => handleEdit('collection', row.id, 'collectionBasis', e.target.value)} />
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

            {/* 보유·이용 단계 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>보유·이용</CardTitle>
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
                        <TableHead className="min-w-[120px]">평가 업무명</TableHead>
                        <TableHead className="min-w-[120px]">보유 형태</TableHead>
                        <TableHead className="min-w-[120px]">암호화 항목</TableHead>
                        <TableHead className="min-w-[120px]">이용 목적</TableHead>
                        <TableHead className="min-w-[120px]">이용 항목</TableHead>
                        <TableHead className="min-w-[150px]">개인정보취급자</TableHead>
                        <TableHead className="min-w-[120px]">이용 방법</TableHead>
                        <TableHead className="w-[80px]">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flowDataByTask[task]?.storage.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{task}</TableCell>
                          <TableCell>
                            <Input value={row.storageType} onChange={(e) => handleEdit('storage', row.id, 'storageType', e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Input value={row.encryptionItem} onChange={(e) => handleEdit('storage', row.id, 'encryptionItem', e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Input value={row.usagePurpose} onChange={(e) => handleEdit('storage', row.id, 'usagePurpose', e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Input value={row.usageItem} onChange={(e) => handleEdit('storage', row.id, 'usageItem', e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Input value={row.personalInfoHandler} onChange={(e) => handleEdit('storage', row.id, 'personalInfoHandler', e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Input value={row.usageMethod} onChange={(e) => handleEdit('storage', row.id, 'usageMethod', e.target.value)} />
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
                        <TableHead className="min-w-[120px]">제공 목적</TableHead>
                        <TableHead className="min-w-[100px]">제공자</TableHead>
                        <TableHead className="min-w-[100px]">수신자</TableHead>
                        <TableHead className="min-w-[120px]">제공 정보</TableHead>
                        <TableHead className="min-w-[120px]">제공 방법</TableHead>
                        <TableHead className="min-w-[100px]">제공 주기</TableHead>
                        <TableHead className="min-w-[120px]">암호화 여부</TableHead>
                        <TableHead className="min-w-[120px]">제공근거</TableHead>
                        <TableHead className="w-[80px]">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flowDataByTask[task]?.provision.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{task}</TableCell>
                          <TableCell>
                            <Input value={row.provisionPurpose} onChange={(e) => handleEdit('provision', row.id, 'provisionPurpose', e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Input value={row.provider} onChange={(e) => handleEdit('provision', row.id, 'provider', e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Input value={row.recipient} onChange={(e) => handleEdit('provision', row.id, 'recipient', e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Input value={row.provisionInfo} onChange={(e) => handleEdit('provision', row.id, 'provisionInfo', e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Input value={row.provisionMethod} onChange={(e) => handleEdit('provision', row.id, 'provisionMethod', e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Input value={row.provisionPeriod} onChange={(e) => handleEdit('provision', row.id, 'provisionPeriod', e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Input value={row.encryptionStatus} onChange={(e) => handleEdit('provision', row.id, 'encryptionStatus', e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Input value={row.provisionBasis} onChange={(e) => handleEdit('provision', row.id, 'provisionBasis', e.target.value)} />
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
                        <TableHead className="min-w-[120px]">평가 업무명</TableHead>
                        <TableHead className="min-w-[120px]">보관 기간</TableHead>
                        <TableHead className="min-w-[120px]">파기 담당자</TableHead>
                        <TableHead className="min-w-[150px]">파기 절차</TableHead>
                        <TableHead className="min-w-[120px]">분리보관 여부</TableHead>
                        <TableHead className="w-[80px]">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flowDataByTask[task]?.disposal.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{task}</TableCell>
                          <TableCell>
                            <Input value={row.retentionPeriod} onChange={(e) => handleEdit('disposal', row.id, 'retentionPeriod', e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Input value={row.disposalManager} onChange={(e) => handleEdit('disposal', row.id, 'disposalManager', e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Input value={row.disposalProcedure} onChange={(e) => handleEdit('disposal', row.id, 'disposalProcedure', e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Input value={row.separateStorageStatus} onChange={(e) => handleEdit('disposal', row.id, 'separateStorageStatus', e.target.value)} />
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
