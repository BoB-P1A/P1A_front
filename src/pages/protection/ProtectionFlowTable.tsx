import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Plus, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FlowData {
  id: string;
  collectionType: string;
  collectionMethod: string;
  collectionTarget: string;
  collectionTiming: string;
  personalInfoItems: string;
  usageMethod: string;
}

const taskNames = ['회원가입', '고객상담'];

export default function ProtectionFlowTable() {
  const [selectedTask, setSelectedTask] = useState('회원가입');
  const [flowDataByTask, setFlowDataByTask] = useState<Record<string, FlowData[]>>({
    '회원가입': [{ id: '1', collectionType: '(필수) 성명, 이메일', collectionMethod: '온라인', collectionTarget: '민원인', collectionTiming: '상시', personalInfoItems: '이용자', usageMethod: '관리 시스템' }],
    '고객상담': [],
  });

  const handleEdit = (id: string, field: keyof FlowData, value: string) => {
    setFlowDataByTask(prev => ({
      ...prev,
      [selectedTask]: prev[selectedTask].map(item => item.id === id ? { ...item, [field]: value } : item),
    }));
  };

  const handleAddFlow = () => {
    setFlowDataByTask(prev => ({
      ...prev,
      [selectedTask]: [...(prev[selectedTask] || []), { id: Date.now().toString(), collectionType: '', collectionMethod: '', collectionTarget: '', collectionTiming: '', personalInfoItems: '', usageMethod: '' }],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between"><h1 className="text-3xl font-bold text-primary">개인정보 흐름표</h1><Button onClick={handleAddFlow}><Plus className="mr-2 h-4 w-4" />행 추가</Button></div>
      <Card>
        <CardHeader><CardTitle>처리업무별 흐름표</CardTitle></CardHeader>
        <CardContent>
          <Tabs value={selectedTask} onValueChange={setSelectedTask}>
            <TabsList>{taskNames.map(t => <TabsTrigger key={t} value={t}>{t}</TabsTrigger>)}</TabsList>
            {taskNames.map(task => (
              <TabsContent key={task} value={task}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>수집 항목</TableHead>
                      <TableHead>수집 경로</TableHead>
                      <TableHead>수집 대상</TableHead>
                      <TableHead>수집 주기</TableHead>
                      <TableHead>개인정보 취급자</TableHead>
                      <TableHead>이용 방법</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(flowDataByTask[task] || []).map(flow => (
                      <TableRow key={flow.id}>
                        <TableCell><Input value={flow.collectionType} onChange={(e) => handleEdit(flow.id, 'collectionType', e.target.value)} /></TableCell>
                        <TableCell><Input value={flow.collectionMethod} onChange={(e) => handleEdit(flow.id, 'collectionMethod', e.target.value)} /></TableCell>
                        <TableCell><Input value={flow.collectionTarget} onChange={(e) => handleEdit(flow.id, 'collectionTarget', e.target.value)} /></TableCell>
                        <TableCell><Input value={flow.collectionTiming} onChange={(e) => handleEdit(flow.id, 'collectionTiming', e.target.value)} /></TableCell>
                        <TableCell><Input value={flow.personalInfoItems} onChange={(e) => handleEdit(flow.id, 'personalInfoItems', e.target.value)} /></TableCell>
                        <TableCell><Input value={flow.usageMethod} onChange={(e) => handleEdit(flow.id, 'usageMethod', e.target.value)} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
