import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
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
    id?: string;
    taskName: string;
    purpose: string;
    infomation: string;
    department: string;
    companyId?: string;
    isNew?: boolean;
    isModified?: boolean;
}

export default function TaskTable() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [tasks, setTasks] = useState<TaskRow[]>([]);
    const { execute } = useApi();

    // 변경사항 확인
    const hasUnsavedChanges = tasks.some(task => task.isNew || task.isModified);

    // 페이지 이탈 경고
    const { WarningDialog } = useUnsavedChangesWarning({
        hasUnsavedChanges,
        onSave: handleSave // 저장 함수 전달
    });

    // 초기 데이터 로드
    useEffect(() => {
        const loadTasks = async () => {
            try {
                const data = await api.tasks.getAll(user?.companyId);

                if (Array.isArray(data)) {
                    const formattedTasks = data.map((task: any) => ({
                        id: task._id || task.id,
                        taskName: task.taskName || '',
                        purpose: task.purpose || '',
                        infomation: task.infomation || '',
                        department: task.department || '',
                        companyId: task.companyId || user?.companyId,
                        isNew: false,
                        isModified: false,
                    }));
                    setTasks(formattedTasks);
                } else {
                    console.warn('Tasks data is not an array:', data);
                    setTasks([]);
                }
            } catch (error) {
                console.error('Failed to load tasks:', error);
                toast({
                    title: "데이터 로드 실패",
                    description: "처리업무 목록을 불러올 수 없습니다.",
                    variant: "destructive"
                });
                setTasks([]);
            }
        };

        if (user?.companyId) {
            loadTasks();
        }
    }, [user?.companyId, toast]);

    // 행 추가
    const handleAddRow = () => {
        const newTask: TaskRow = {
            id: `temp_${Date.now()}`,
            taskName: '',
            purpose: '',
            infomation: '',
            department: '',
            companyId: user?.companyId,
            isNew: true,
            isModified: false,
        };
        setTasks([...tasks, newTask]);
        toast({ title: "행이 추가되었습니다. 저장 버튼을 눌러주세요." });
    };

    // 행 삭제
    const handleDeleteRow = async (id?: string) => {
        if (!id) return;

        if (id.startsWith('temp_')) {
            if (!confirm('이 행을 삭제하시겠습니까?')) {
                return;
            }
            setTasks(tasks.filter(task => task.id !== id));
            toast({ title: "행이 제거되었습니다." });
            return;
        }

        const taskToDelete = tasks.find(task => task.id === id);
        const taskName = taskToDelete?.taskName || '이 항목';

        if (!confirm(`정말 "${taskName}"을(를) 삭제하시겠습니까?`)) {
            return;
        }

        try {
            await execute(() => api.tasks.delete(id));
            setTasks(tasks.filter(task => task.id !== id));
            toast({ title: "행이 삭제되었습니다." });
        } catch (error) {
            console.error('Failed to delete task:', error);
            toast({
                title: "삭제 실패",
                description: "서버 오류가 발생했습니다.",
                variant: "destructive"
            });
        }
    };

    // 저장
    async function handleSave() {
        try {
            const tasksToSave = tasks
                .filter(task => task.isNew || task.isModified)
                .map(task => {
                    const { isNew, isModified, ...taskData } = task;
                    return {
                        ...taskData,
                        companyId: user?.companyId,
                    };
                });

            if (tasksToSave.length === 0) {
                toast({ title: "변경사항이 없습니다." });
                return;
            }

            // 평가업무명 필수 입력 검증
            const emptyTaskNames = tasksToSave.filter(task => !task.taskName || task.taskName.trim() === '');
            if (emptyTaskNames.length > 0) {
                toast({
                    title: "입력 오류",
                    description: "평가업무명은 필수 입력 항목입니다.",
                    variant: "destructive"
                });
                return;
            }

            await execute(() => api.tasks.bulkSave(tasksToSave));

            const refreshedData = await api.tasks.getAll(user?.companyId);
            if (Array.isArray(refreshedData)) {
                const formattedTasks = refreshedData.map((task: any) => ({
                    id: task.id,
                    taskName: task.taskName || '',
                    purpose: task.purpose || '',
                    infomation: task.infomation || '',
                    department: task.department || '',
                    companyId: task.companyId || user?.companyId,
                    isNew: false,
                    isModified: false,
                }));
                setTasks(formattedTasks);
            }

            toast({ title: "저장되었습니다." });
        } catch (error) {
            console.error('Failed to save tasks:', error);
            toast({
                title: "저장 실패",
                description: "서버 오류가 발생했습니다.",
                variant: "destructive"
            });
            throw error; // 에러를 던져서 WarningDialog에서 처리
        }
    }

    // 엑셀 다운로드
    const handleExcelDownload = () => {
        const workbook = XLSX.utils.book_new();
        const headers = ['평가업무명', '처리 목적', '처리 개인정보', '주관부서'];
        const data = [
            headers,
            ...tasks.map(task => [
                task.taskName,
                task.purpose,
                task.infomation,
                task.department
            ])
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, '처리업무표');
        XLSX.writeFile(workbook, '개인정보_처리업무표.xlsx');
    };

    // 필드 업데이트
    const handleUpdateTask = (id: string | undefined, field: keyof TaskRow, value: string) => {
        if (!id) return;

        const updated = tasks.map(t => {
            if (t.id === id) {
                const isModified = !t.isNew;
                return { ...t, [field]: value, isModified };
            }
            return t;
        });
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
                                                    value={task.infomation}
                                                    onChange={(e) => handleUpdateTask(task.id, 'infomation', e.target.value)}
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

            {/* 페이지 이탈 경고 모달 */}
            <WarningDialog />
        </div>
    );
}