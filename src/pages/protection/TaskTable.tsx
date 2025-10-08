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
import { Save, Plus, Trash2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { getCompanyData, setCompanyData } from '@/lib/utils';

interface TaskRow {
  id: number;
  taskName: string;
  purpose: string;
  personalInfo: string;
  department: string;
}

export default function TaskTable() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskRow[]>(() => {
    return getCompanyData(user?.company, 'processingTasks', [
      {
        id: 1,
        taskName: '회원가입',
        purpose: '서비스 이용을 위한 회원 식별',
        personalInfo: '이름, 이메일, 전화번호',
        department: '개발팀',
      },
      {
        id: 2,
        taskName: '고객상담',
        purpose: '고객 문의 응대 및 서비스 개선',
        personalInfo: '이름, 연락처, 상담내용',
        department: 'CS팀',
      },
    ]);
  });

  const handleAddRow = () => {
    const newTask: TaskRow = {
      id: Date.now(),
      taskName: '',
      purpose: '',
      personalInfo: '',
      department: '',
    };
    setTasks([...tasks, newTask]);
  };

  const handleDeleteRow = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleSave = () => {
    setCompanyData(user?.company, 'processingTasks', tasks);
    alert('저장되었습니다. 개인정보 흐름표 페이지에서 업무별 탭이 업데이트됩니다.');
  };

  const handleExcelDownload = () => {
    const workbook = XLSX.utils.book_new();
    const headers = ['평가업무명', '처리 목적', '처리 개인정보', '주관부서'];
    const data = [
      headers,
      ...tasks.map(task => [task.taskName, task.purpose, task.personalInfo, task.department])
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, '처리업무표');
    XLSX.writeFile(workbook, '개인정보_처리업무표.xlsx');
  };

  const handleUpdateTask = (id: number, field: keyof TaskRow, value: string) => {
    const updated = tasks.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    );
    setTasks(updated);
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
          <Button variant="outline" onClick={handleExcelDownload}>
            <Download className="mr-2 h-4 w-4" />
            엑셀 다운로드
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
            각 처리업무별 개인정보 항목과 담당부서를 입력하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">평가업무명</TableHead>
                  <TableHead className="min-w-[200px]">처리 목적</TableHead>
                  <TableHead className="min-w-[200px]">처리 개인정보</TableHead>
                  <TableHead className="min-w-[120px]">주관부서</TableHead>
                  <TableHead className="w-[80px]">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Input 
                        value={task.taskName}
                        onChange={(e) => handleUpdateTask(task.id, 'taskName', e.target.value)}
                        placeholder="평가업무명 입력"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={task.purpose}
                        onChange={(e) => handleUpdateTask(task.id, 'purpose', e.target.value)}
                        placeholder="처리 목적 입력"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={task.personalInfo}
                        onChange={(e) => handleUpdateTask(task.id, 'personalInfo', e.target.value)}
                        placeholder="처리 개인정보 입력"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={task.department}
                        onChange={(e) => handleUpdateTask(task.id, 'department', e.target.value)}
                        placeholder="주관부서 입력"
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
