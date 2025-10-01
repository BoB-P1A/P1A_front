import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Save, Plus, Trash2 } from 'lucide-react';

interface TaskRow {
  id: number;
  task: string;
  purpose: string;
  personalInfo: string;
  retentionPeriod: string;
  responsible: string;
}

export default function TaskTable() {
  const [tasks, setTasks] = useState<TaskRow[]>([
    {
      id: 1,
      task: '회원가입',
      purpose: '서비스 이용을 위한 회원 식별',
      personalInfo: '이름, 이메일, 전화번호',
      retentionPeriod: '회원 탈퇴 시까지',
      responsible: '개발팀',
    },
    {
      id: 2,
      task: '고객상담',
      purpose: '고객 문의 응대 및 서비스 개선',
      personalInfo: '이름, 연락처, 상담내용',
      retentionPeriod: '상담 종료 후 3년',
      responsible: 'CS팀',
    },
  ]);

  const handleAddRow = () => {
    const newTask: TaskRow = {
      id: Date.now(),
      task: '',
      purpose: '',
      personalInfo: '',
      retentionPeriod: '',
      responsible: '',
    };
    setTasks([...tasks, newTask]);
  };

  const handleDeleteRow = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleSave = () => {
    // 저장 로직
    console.log('Saving tasks:', tasks);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">처리업무표 입력</h1>
          <p className="text-muted-foreground mt-2">
            개인정보 처리업무를 표 형태로 입력하고 관리합니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddRow}>
            <Plus className="mr-2 h-4 w-4" />
            행 추가
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            저장
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>개인정보 처리업무표</CardTitle>
          <CardDescription>
            각 처리업무별 개인정보 항목과 보유기간을 입력하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">처리업무</TableHead>
                  <TableHead className="min-w-[200px]">수집목적</TableHead>
                  <TableHead className="min-w-[200px]">개인정보 항목</TableHead>
                  <TableHead className="min-w-[150px]">보유기간</TableHead>
                  <TableHead className="min-w-[120px]">담당부서</TableHead>
                  <TableHead className="w-[80px]">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Input 
                        value={task.task}
                        onChange={(e) => {
                          const updated = tasks.map(t => 
                            t.id === task.id ? { ...t, task: e.target.value } : t
                          );
                          setTasks(updated);
                        }}
                        placeholder="처리업무 입력"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={task.purpose}
                        onChange={(e) => {
                          const updated = tasks.map(t => 
                            t.id === task.id ? { ...t, purpose: e.target.value } : t
                          );
                          setTasks(updated);
                        }}
                        placeholder="수집목적 입력"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={task.personalInfo}
                        onChange={(e) => {
                          const updated = tasks.map(t => 
                            t.id === task.id ? { ...t, personalInfo: e.target.value } : t
                          );
                          setTasks(updated);
                        }}
                        placeholder="개인정보 항목 입력"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={task.retentionPeriod}
                        onChange={(e) => {
                          const updated = tasks.map(t => 
                            t.id === task.id ? { ...t, retentionPeriod: e.target.value } : t
                          );
                          setTasks(updated);
                        }}
                        placeholder="보유기간 입력"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={task.responsible}
                        onChange={(e) => {
                          const updated = tasks.map(t => 
                            t.id === task.id ? { ...t, responsible: e.target.value } : t
                          );
                          setTasks(updated);
                        }}
                        placeholder="담당부서 입력"
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteRow(task.id)}
                      >
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
