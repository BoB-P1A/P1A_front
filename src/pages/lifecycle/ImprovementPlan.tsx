import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface LifecycleItem {
    id: number;
    taskId: string;
    taskName: string;
    subField: string;
    no: string;
    item: string;
    status: '이행' | '부분이행' | '미이행' | '해당없음' | null;
    evidence: string;
    files: any[];
}

interface ImprovementItem {
    id: string;
    taskId: string;
    taskName: string;
    code: string;
    question: string;
    evidence: string;
    relatedLaw: string;
    riskFactor: string;
    improvementPlan: string;
}

export default function LifecycleImprovementPlan() {
    const { user } = useAuth();
    const [items, setItems] = useState<ImprovementItem[]>([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('전체');
    const [tasks, setTasks] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(false);

    // 처리업무 목록 로딩
    useEffect(() => {
        if (!user?.companyId) return;

        const loadData = async () => {
            try {
                setLoading(true);
                const tasksData = await api.lifecycle.tasks.getAll(user.companyId);
                const mappedTasks = tasksData.map((t: any) => ({
                    id: t.id,        // ObjectId
                    name: t.taskName // 업무명
                }));
                setTasks(mappedTasks);
            } catch (error) {
                toast({ title: '처리업무 목록 로딩 실패', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user?.companyId]);

    // 개선 가이드 로딩
    useEffect(() => {
        if (!user?.companyId) return;

        const loadImprovements = async () => {
            try {
                setLoading(true);
                const [checklists, saved] = await Promise.all([
                    // status 필터링으로 부분이행/미이행 항목만 조회
                    api.lifecycle.checklists.getAll({
                        companyId: user.companyId,
                        status: ['부분이행', '미이행']
                    }),
                    api.lifecycle.improvements.getAll(user.companyId),
                ]);

                // 백엔드 응답을 프론트엔드 형식으로 변환
                const improvementItems: ImprovementItem[] = checklists.map((item: any) => {
                    const itemId = `${item.taskId}-${item.no}`;
                    const savedItem = saved[itemId];

                    // taskId로부터 taskName 찾기
                    const task = tasks.find(t => t.id === item.taskId);

                    return {
                        id: itemId,
                        taskId: item.taskId,           // ObjectId
                        taskName: task?.name || '',    // 탭 표시용
                        code: item.no || '',           // no를 code로 매핑
                        question: item.item || '',     // item을 question으로 매핑
                        evidence: item.evidence || '',
                        relatedLaw: item.law || '',    // law를 relatedLaw로 매핑
                        riskFactor: item.riskFactors || '',        // riskFactors를 riskFactor로 매핑
                        improvementPlan: item.improvementGuides || '', // improvementGuides를 improvementPlan으로 매핑
                    };
                });

                setItems(improvementItems);
            } catch (error) {
                toast({ title: '개선 가이드 로딩 실패', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };

        loadImprovements();
    }, [user?.companyId, tasks]);

    const handleRelatedLawChange = (id: string, value: string) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, relatedLaw: value } : item
        ));
        setHasChanges(true);
    };

    const handleRiskFactorChange = (id: string, value: string) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, riskFactor: value } : item
        ));
        setHasChanges(true);
    };

    const handleImprovementPlanChange = (id: string, value: string) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, improvementPlan: value } : item
        ));
        setHasChanges(true);
    };

    // 저장 로직 (readOnly이므로 사용 안 함)
    const handleSave = async () => {
        try {
            setLoading(true);
            const improvements: { [key: string]: { relatedLaw: string; riskFactor: string; improvementPlan: string } } = {};
            items.forEach(item => {
                improvements[item.id] = {
                    relatedLaw: item.relatedLaw,
                    riskFactor: item.riskFactor,
                    improvementPlan: item.improvementPlan,
                };
            });
            await api.lifecycle.improvements.save(user?.companyId as string, improvements);
            setHasChanges(false);
            toast({ title: '저장되었습니다' });
        } catch (error) {
            toast({ title: '저장 실패', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleExportToExcel = () => {
        const exportData = filteredItems.map(item => ({
            '평가업무명': item.taskName,
            '질의문 코드': item.code,
            '질의문': item.question,
            '취약점': item.evidence,
            '관련 법률': item.relatedLaw,
            '침해요인': item.riskFactor,
            '개선 가이드': item.improvementPlan,
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '침해요인별 개선 가이드');
        XLSX.writeFile(wb, '개인정보_처리단계_침해요인별_개선_가이드.xlsx');
    };

    // 필터링 로직
    const filteredItems = activeTab === '전체'
        ? items
        : items.filter(item => item.taskId === activeTab);

    if (loading) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary">개인정보 처리단계(Lifecycle) 침해요인별 개선 가이드</h1>
                    <p className="text-muted-foreground mt-2">
                        개인정보 처리단계(Lifecycle)의 침해요인과 개선 가이드를 관리합니다
                    </p>
                </div>
                <div className="space-x-2">
                    <Button variant="outline" onClick={handleExportToExcel}>
                        <Download className="mr-2 h-4 w-4" />
                        엑셀 다운로드
                    </Button>
                    {/*<Button onClick={handleSave} disabled={!hasChanges}>*/}
                    {/*  <Save className="mr-2 h-4 w-4" />*/}
                    {/*  저장*/}
                    {/*</Button>*/}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                    <TabsTrigger value="전체">전체</TabsTrigger>
                    {tasks.map(task => (
                        <TabsTrigger key={task.id} value={task.id}>
                            {task.name}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value={activeTab}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                침해요인 목록 및 개선 가이드
                            </CardTitle>
                            <CardDescription>
                                개인정보 처리단계(Lifecycle) 침해요인과 개선 가이드를 확인하세요
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {filteredItems.map((item) => (
                                    <Card key={item.id}>
                                        <CardContent className="space-y-4 pt-6">
                                            <div>
                                                <Label className="font-semibold">평가업무명</Label>
                                                <Input value={item.taskName} readOnly className="mt-1" />
                                            </div>

                                            <div>
                                                <Label className="font-semibold">질의문 코드</Label>
                                                <Input value={item.code} readOnly className="mt-1" />
                                            </div>

                                            <div>
                                                <Label className="font-semibold">질의문</Label>
                                                <Textarea value={item.question} readOnly className="mt-1 resize-none" rows={2} />
                                            </div>

                                            <div>
                                                <Label className="font-semibold">취약점</Label>
                                                <Textarea value={item.evidence} readOnly className="mt-1 resize-none" rows={3} />
                                            </div>

                                            <div>
                                                <Label htmlFor={`law-${item.id}`} className="font-semibold">관련 법률</Label>
                                                <Textarea
                                                    id={`law-${item.id}`}
                                                    value={item.relatedLaw}
                                                    readOnly
                                                    onChange={(e) => handleRelatedLawChange(item.id, e.target.value)}
                                                    className="mt-1 resize-none"
                                                    rows={2}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor={`risk-${item.id}`} className="font-semibold">침해요인</Label>
                                                <Textarea
                                                    id={`risk-${item.id}`}
                                                    value={item.riskFactor}
                                                    readOnly
                                                    onChange={(e) => handleRiskFactorChange(item.id, e.target.value)}
                                                    className="mt-1 resize-none"
                                                    rows={3}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor={`plan-${item.id}`} className="font-semibold">개선 가이드</Label>
                                                <Textarea
                                                    id={`plan-${item.id}`}
                                                    value={item.improvementPlan}
                                                    readOnly
                                                    onChange={(e) => handleImprovementPlanChange(item.id, e.target.value)}
                                                    className="mt-1 resize-none"
                                                    rows={3}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {filteredItems.length === 0 && (
                                    <Card>
                                        <CardContent className="py-8">
                                            <p className="text-center text-muted-foreground">
                                                Lifecycle Checklist에서 부분이행 또는 미이행 항목이 있을 때 표시됩니다.
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}