// src/pages/TaskTable.tsx
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Plus, Trash2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

type TaskRow = {
  id?: string;           // ObjectId string (신규는 undefined)
  taskName: string;
  purpose: string;
  personalInfo: string;
  department: string;
};

export default function TaskTable() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const companyId = user?.companyId || user?.company; // 과거 코드 호환

  // 최초 로드
  useEffect(() => {
    if (!companyId) return;
    (async () => {
      try {
        const data = await api.tasks.getAll(companyId);
        // 백엔드 DTO 필드명과 맞춤
        const rows: TaskRow[] = Array.isArray(data) ? data.map((d: any) => ({
          id: d.id,
          taskName: d.taskName || '',
          purpose: d.purpose || '',
          personalInfo: d.personalInfo || '',
          department: d.department || '',
        })) : [];
        setTasks(rows);
      } catch (e) {
        toast({ title: '처리업무 로드 실패', variant: 'destructive' });
        setTasks([]);
      }
    })();
  }, [companyId]);

  // 행 추가 → 서버에도 즉시 생성(push)
  const handleAddRow = async () => {
    if (!companyId) return;
    try {
      const created = await api.tasks.create({
        companyId,
        taskName: '',
        purpose: '',
        personalInfo: '',
        department: '',
      });
      setTasks(prev => [...prev, {
        id: created.id,
        taskName: created.taskName || '',
        purpose: created.purpose || '',
        personalInfo: created.personalInfo || '',
        department: created.department || '',
      }]);
      toast({ title: '행이 추가되었습니다' });
    } catch (e) {
      toast({ title: '업무 추가 실패', variant: 'destructive' });
    }
  };

  // 로컬 상태 수정
  const handleUpdateLocal = (index: number, field: keyof TaskRow, value: string) => {
    setTasks(prev => {
      const cp = [...prev];
      cp[index] = { ...cp[index], [field]: value };
      return cp;
    });
  };

  // 단건 삭제(서버 → 로컬)
  const handleDeleteRow = async (index: number) => {
    const row = tasks[index];
    try {
      if (row.id) {
        await api.tasks.delete(row.id);
      }
      setTasks(prev => prev.filter((_, i) => i !== index));
      toast({ title: '행이 삭제되었습니다' });
    } catch (e) {
      toast({ title: '삭제 실패', variant: 'destructive' });
    }
  };

  // 전체 저장(화면 상태 = 서버 상태)
  const handleSave = async () => {
    if (!companyId) return;
    try {
      const payload = tasks.map(t => ({
        id: t.id, // 신규는 undefined → 서버에서 새 ObjectId 생성
        taskName: t.taskName,
        purpose: t.purpose,
        personalInfo: t.personalInfo,
        department: t.department,
      }));
      await api.tasks.bulkReplace(companyId, payload);
      toast({ title: '저장되었습니다' });
    } catch (e) {
      toast({ title: '저장 실패', variant: 'destructive' });
    }
  };

  // 엑셀 다운로드
  const handleExcelDownload = () => {
    const workbook = XLSX.utils.book_new();
    const headers = ['평가업무명', '처리 목적', '처리 개인정보', '주관부서'];
    const data = [headers, ...tasks.map(t => [t.taskName, t.purpose, t.personalInfo, t.department])];
    const sheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, sheet, '처리업무표');
    XLSX.writeFile(workbook, '개인정보_처리업무표.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">개인정보 처리 업무표</h1>
          <p className="text-muted-foreground mt-2">개인정보 처리업무를 표 형태로 입력하고 관리합니다</p>
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
          <CardDescription>각 처리업무별 개인정보 항목과 담당부서를 입력하세요</CardDescription>
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
                {tasks.length > 0 ? tasks.map((t, i) => (
                  <TableRow key={t.id || `new-${i}`}>
                    <TableCell>
                      <Input value={t.taskName} onChange={e => handleUpdateLocal(i, 'taskName', e.target.value)} placeholder="평가업무명 입력" />
                    </TableCell>
                    <TableCell>
                      <Input value={t.purpose} onChange={e => handleUpdateLocal(i, 'purpose', e.target.value)} placeholder="처리 목적 입력" />
                    </TableCell>
                    <TableCell>
                      <Input value={t.personalInfo} onChange={e => handleUpdateLocal(i, 'personalInfo', e.target.value)} placeholder="처리 개인정보 입력" />
                    </TableCell>
                    <TableCell>
                      <Input value={t.department} onChange={e => handleUpdateLocal(i, 'department', e.target.value)} placeholder="주관부서 입력" />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteRow(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
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