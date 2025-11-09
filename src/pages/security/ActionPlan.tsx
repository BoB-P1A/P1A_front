import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, ClipboardList, Save } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface SecurityItem {
    id: number | string;
    systemId: string;
    systemName: string;
    subField: string;
    no: string;
    item: string;
    status: '이행' | '부분이행' | '미이행' | '해당없음' | null;
    evidence: string;
    files: any[];
}

interface ActionPlanItem {
    id: string;
    systemId: string;
    systemName: string;
    code: string;
    question: string;
    evidence: string;
    improvementGuide: string;
    actionPlan: string;
    actionPeriod: string;
    department: string;
    manager: string;
    actionDate: string;
}

export default function SecurityActionPlan() {
    const { user } = useAuth();
    const [items, setItems] = useState<ActionPlanItem[]>([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('전체');
    const [securitySystems, setSecuritySystems] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user?.companyId) return;

        const loadData = async () => {
            try {
                setLoading(true);
                const systemsData = await api.security.targets.getAll(user.companyId);
                setSecuritySystems(systemsData);
            } catch (error) {
                toast({ title: '검토대상 목록 로딩 실패', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user?.companyId]);

    useEffect(() => {
        if (!user?.companyId) return;

        const loadActionPlans = async () => {
            try {
                setLoading(true);
                const [checklists, improvements, existingPlans] = await Promise.all([
                    api.security.checklists.getAll({
                        companyId: user.companyId,
                        status: ['부분이행', '미이행']
                    }),
                    api.security.improvements.getAll(user.companyId),
                    api.security.actionPlans.getAll(user.companyId),
                ]);

                const actionPlanItems: ActionPlanItem[] = checklists.map((item: any) => {
                    const itemId = `${item.systemId}-${item.no}`;
                    const improvement = improvements[itemId];
                    const savedPlan = existingPlans[itemId];
                    return {
                        id: itemId,
                        systemId: item.systemId,
                        systemName: item.systemName,
                        code: item.no,
                        question: item.item,
                        evidence: item.evidence,
                        improvementGuide: item.improvementGuides || '',
                        actionPlan: savedPlan?.actionPlan || '',
                        actionPeriod: savedPlan?.actionPeriod || '',
                        department: savedPlan?.department || '',
                        manager: savedPlan?.manager || '',
                        actionDate: savedPlan?.actionDate || '',
                    };
                });

                setItems(actionPlanItems);
            } catch (error) {
                toast({ title: '조치 계획 로딩 실패', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };

        loadActionPlans();
    }, [user?.companyId]);

    const handleFieldChange = (id: string, field: keyof ActionPlanItem, value: string) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
        setHasChanges(true);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const actionPlans: { [key: string]: any } = {};
            items.forEach(item => {
                actionPlans[item.id] = {
                    systemId: item.systemId,
                    systemName: item.systemName,
                    code: item.code,
                    actionPlan: item.actionPlan,
                    actionPeriod: item.actionPeriod,
                    department: item.department,
                    manager: item.manager,
                    actionDate: item.actionDate,
                };
            });
            await api.security.actionPlans.save(user?.companyId as string, actionPlans);
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
            '검토대상명': item.systemName,
            '질의문 코드': item.code,
            '질의문': item.question,
            '취약점': item.evidence,
            '개선 가이드': item.improvementGuide,
            '조치 방안': item.actionPlan,
            '조치 기간': item.actionPeriod,
            '부서': item.department,
            '담당자': item.manager,
            '조치 일시': item.actionDate,
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '조치 계획 수립');
        XLSX.writeFile(wb, '보안성검토_조치_계획_수립.xlsx');
    };

    const filteredItems = activeTab === '전체'
        ? items
        : items.filter(item => item.systemId === activeTab);

    if (loading) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary">보안성 검토 조치 계획 수립</h1>
                    <p className="text-muted-foreground mt-2">
                        보안성 검토 침해요인에 대한 조치 계획을 수립하고 관리합니다
                    </p>
                </div>
                <div className="space-x-2">
                    <Button variant="outline" onClick={handleExportToExcel}>
                        <Download className="mr-2 h-4 w-4" />
                        엑셀 다운로드
                    </Button>
                    <Button onClick={handleSave} disabled={!hasChanges}>
                        <Save className="mr-2 h-4 w-4" />
                        저장
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                    <TabsTrigger value="전체">전체</TabsTrigger>
                    {securitySystems.map(system => (
                        <TabsTrigger key={system.id} value={system.id}>
                            {system.name}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value={activeTab}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-primary" />
                                조치 계획 목록
                            </CardTitle>
                            <CardDescription>
                                각 침해요인에 대한 조치 계획을 수립하세요
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {filteredItems.map((item) => (
                                    <Card key={item.id}>
                                        <CardContent className="space-y-4 pt-6">
                                            <div>
                                                <Label className="font-semibold">검토대상명</Label>
                                                <Input value={item.systemName} readOnly className="mt-1" />
                                            </div>

                                            <div>
                                                <Label className="font-semibold">질의문 코드</Label>
                                                <Input value={item.code} readOnly className="mt-1" />
                                            </div>

                                            <div>
                                                <Label className="font-semibold">질의문</Label>
                                                <Textarea value={item.question} readOnly className="mt-1" rows={2} />
                                            </div>

                                            <div>
                                                <Label className="font-semibold">취약점</Label>
                                                <Textarea value={item.evidence} readOnly className="mt-1" rows={3} />
                                            </div>

                                            <div>
                                                <Label className="font-semibold">개선 가이드</Label>
                                                <Textarea value={item.improvementGuide} readOnly className="mt-1" rows={3} />
                                            </div>

                                            <div>
                                                <Label htmlFor={`action-${item.id}`} className="font-semibold">조치 방안</Label>
                                                <Textarea
                                                    id={`action-${item.id}`}
                                                    value={item.actionPlan}
                                                    onChange={(e) => handleFieldChange(item.id, 'actionPlan', e.target.value)}
                                                    placeholder="조치 방안을 입력하세요"
                                                    className="mt-1"
                                                    rows={3}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor={`period-${item.id}`} className="font-semibold">조치 기간</Label>
                                                <Input
                                                    id={`period-${item.id}`}
                                                    value={item.actionPeriod}
                                                    onChange={(e) => handleFieldChange(item.id, 'actionPeriod', e.target.value)}
                                                    placeholder="조치 기간을 입력하세요"
                                                    className="mt-1"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor={`dept-${item.id}`} className="font-semibold">부서</Label>
                                                <Input
                                                    id={`dept-${item.id}`}
                                                    value={item.department}
                                                    onChange={(e) => handleFieldChange(item.id, 'department', e.target.value)}
                                                    placeholder="담당 부서를 입력하세요"
                                                    className="mt-1"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor={`manager-${item.id}`} className="font-semibold">담당자</Label>
                                                <Input
                                                    id={`manager-${item.id}`}
                                                    value={item.manager}
                                                    onChange={(e) => handleFieldChange(item.id, 'manager', e.target.value)}
                                                    placeholder="담당자를 입력하세요"
                                                    className="mt-1"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor={`date-${item.id}`} className="font-semibold">조치 일시</Label>
                                                <Input
                                                    id={`date-${item.id}`}
                                                    value={item.actionDate}
                                                    onChange={(e) => handleFieldChange(item.id, 'actionDate', e.target.value)}
                                                    placeholder="조치 일시를 입력하세요"
                                                    className="mt-1"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {filteredItems.length === 0 && (
                                    <Card>
                                        <CardContent className="py-8">
                                            <p className="text-center text-muted-foreground">
                                                보안성 검토 Checklist에서 부분이행 또는 미이행 항목이 있을 때 표시됩니다.
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