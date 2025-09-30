import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Plus, Trash2 } from 'lucide-react';

const initialTasks = [
  { id: '1', category: '회원 관리', task: '회원가입', personalDataType: '필수정보(이름, 이메일, 전화번호)', purpose: '서비스 이용계약 이행', legalBasis: '계약의 이행' },
  { id: '2', category: '회원 관리', task: '로그인', personalDataType: '인증정보(이메일, 비밀번호)', purpose: '본인 인증 및 서비스 이용', legalBasis: '계약의 이행' },
  { id: '3', category: '서비스 운영', task: '고객상담', personalDataType: '연락처, 상담내용', purpose: '고객 문의 응답 및 서비스 개선', legalBasis: '정당한 이익' }
];

export default function CriteriaTasks() {
  const [tasks, setTasks] = useState(initialTasks);
  const [editingId, setEditingId] = useState(null);

  const handleEdit = (id, field, value) => {
    setTasks(prev => prev.map(task => task.id === id ? { ...task, [field]: value } : task));
  };

  const handleAddTask = () => {
    const newTask = { id: Date.now().toString(), category: '', task: '', personalDataType: '', purpose: '', legalBasis: '' };
    setTasks(prev => [...prev, newTask]);
    setEditingId(newTask.id);
  };

  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const handleSave = () => {
    setEditingId(null);
    console.log('Saving tasks:', tasks);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">처리업무표</h1>
          <p className="text-muted-foreground mt-2">개인정보 처리업무별 세부사항을 관리합니다</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddTask} variant="outline"><Plus className="h-4 w-4 mr-2" />업무 추가</Button>
          <Button onClick={handleSave} className="bg-pia-secondary hover:bg-pia-secondary-light"><Save className="h-4 w-4 mr-2" />저장</Button>
        </div>
      </div>

      <Card className="shadow-pia-card">
        <CardHeader>
          <CardTitle>처리업무 목록</CardTitle>
          <CardDescription>개인정보 처리업무별 상세 정보를 입력하고 수정할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">카테고리</TableHead>
                  <TableHead className="w-[150px]">처리업무</TableHead>
                  <TableHead className="w-[200px]">개인정보 유형</TableHead>
                  <TableHead className="w-[180px]">처리목적</TableHead>
                  <TableHead className="w-[150px]">법적근거</TableHead>
                  <TableHead className="w-[80px]">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      {editingId === task.id ? (
                        <Input value={task.category} onChange={(e) => handleEdit(task.id, 'category', e.target.value)} className="min-w-[100px]" />
                      ) : (
                        <span onClick={() => setEditingId(task.id)} className="cursor-pointer hover:bg-accent/10 p-1 rounded">{task.category}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === task.id ? (
                        <Input value={task.task} onChange={(e) => handleEdit(task.id, 'task', e.target.value)} className="min-w-[120px]" />
                      ) : (
                        <span onClick={() => setEditingId(task.id)} className="cursor-pointer hover:bg-accent/10 p-1 rounded">{task.task}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === task.id ? (
                        <Input value={task.personalDataType} onChange={(e) => handleEdit(task.id, 'personalDataType', e.target.value)} className="min-w-[150px]" />
                      ) : (
                        <span onClick={() => setEditingId(task.id)} className="cursor-pointer hover:bg-accent/10 p-1 rounded">{task.personalDataType}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === task.id ? (
                        <Input value={task.purpose} onChange={(e) => handleEdit(task.id, 'purpose', e.target.value)} className="min-w-[150px]" />
                      ) : (
                        <span onClick={() => setEditingId(task.id)} className="cursor-pointer hover:bg-accent/10 p-1 rounded">{task.purpose}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === task.id ? (
                        <Input value={task.legalBasis} onChange={(e) => handleEdit(task.id, 'legalBasis', e.target.value)} className="min-w-[120px]" />
                      ) : (
                        <span onClick={() => setEditingId(task.id)} className="cursor-pointer hover:bg-accent/10 p-1 rounded">{task.legalBasis}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)} className="text-destructive hover:text-destructive">
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
    </div>
  );
}
