import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
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
import { api } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

interface TaskRow {
  id: number;
  taskName: string;
  purpose: string;
  personalInfo: string;
  department: string;
  companyId?: string;
}

export default function TaskTable() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const { execute } = useApi();

  // 초기 데이터 로드
  useEffect(() => {
    const loadTasks = async () => {
      try {
          const data = await api.tasks.getAll(user?.company);

          if (Array.isArray(data)) {
              setTasks(data);
          } else {
              console.warn('Tasks data is not an array:', data);
              setTasks([]);
          }
      } catch (error) {
        console.error('Failed to load tasks:', error);
        // 에러 시 기본 데이터
        setTasks([
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
      }
    };
    
    loadTasks();
  }, [user?.company]);

  const handleAddRow = async () => {
    try {
      const newTask = await api.tasks.create({
        taskName: '',
        purpose: '',
        personalInfo: '',
        department: '',
        companyId: user?.company,
      });
      setTasks([...tasks, newTask]);
      toast({ title: "행이 추가되었습니다" });
    } catch (error) {
      console.error('Failed to add task:', error);
      toast({
          title: "업무 추가 실패",
          description: "서버 오류가 발생했습니다.",
          variant: "destructive"
      });
    }
  };

  const handleDeleteRow = async (id: number) => {
    try {
      await execute(() => api.tasks.delete(id));
      setTasks(tasks.filter(task => task.id !== id));
      toast({ title: "행이 삭제되었습니다" });
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast({ title: "삭제 실패", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    try {
      await execute(() => api.tasks.bulkUpdate(tasks));
      toast({ title: "저장되었습니다" });
    } catch (error) {
      console.error('Failed to save tasks:', error);
      toast({
          title: "저장 실패",  // ← 실패 메시지로 변경!
          description: "서버 오류가 발생했습니다.",
          variant: "destructive"
      });
    }
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
          <h1 className="text-3xl font-bold text-primary">개인정보 처리 업무표</h1>
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
                  {Array.isArray(tasks) && tasks.length > 0 ? (
                      tasks.map((task) => (
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
                      ))
                  ) : (
                      <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                              데이터가 없습니다. '행 추가' 버튼을 눌러 새로운 업무를 추가하세요.
                          </TableCell>
                      </TableRow>
                  )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}