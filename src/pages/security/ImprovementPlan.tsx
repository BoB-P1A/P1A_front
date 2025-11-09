import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, AlertTriangle, Save } from 'lucide-react';
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

interface ImprovementItem {
    id: string;
    systemId: string;
    systemName: string;
    code: string;
    question: string;
    evidence: string;
    relatedLaw: string;
    riskFactor: string;
    improvementPlan: string;
}

export default function SecurityImprovementPlan() {
    const { user } = useAuth();
    const [items, setItems] = useState<ImprovementItem[]>([]);
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

        const loadImprovements = async () => {
            try {
                setLoading(true);
                const [checklists, saved] = await Promise.all([
                    api.security.checklists.getAll({
                        companyId: user.companyId,
                        status: ['부분이행', '미이행']
                    }),
                    api.security.improvements.getAll(user.companyId),
                ]);

                // 백엔드 응답을 프론트엔드 형식으로 변환
                const improvementItems: ImprovementItem[] = checklists.map((item: any) => {
                    const itemId = `${item.systemId}-${item.no}`;
                    const savedItem = saved[itemId];
                    return {
                        id: itemId,
                        systemId: item.systemId,
                        systemName: item.systemName,
                        code: item.no,                    // ← no를 code로 매핑
                        question: item.item || '',         // ← item을 question으로 매핑
                        evidence: item.evidence || '',
                        relatedLaw: item.law || '',        // ← law를 relatedLaw로 매핑
                        riskFactor: item.riskFactors || '', // ← riskFactors를 riskFactor로 매핑
                        improvementPlan: item.improvementGuides || '', // ← improvementGuides를 improvementPlan으로 매핑
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
    }, [user?.companyId]);

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
            await api.security.improvements.save(user?.companyId as string, improvements);
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
            '관련 법률': item.relatedLaw,
            '침해요인': item.riskFactor,
            '개선 가이드': item.improvementPlan,
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '침해요인별 개선 가이드');
        XLSX.writeFile(wb, '보안성검토_침해요인별_개선_가이드.xlsx');
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
                    <h1 className="text-3xl font-bold text-primary">보안성 검토 침해요인별 개선 가이드</h1>
                    <p className="text-muted-foreground mt-2">
                        보안성 검토의 침해요인과 개선 가이드를 관리합니다
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
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                침해요인 목록 및 개선 가이드
                            </CardTitle>
                            <CardDescription>
                                보안성 검토 관련 침해요인과 개선 가이드를 확인하세요
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
                                                <Label htmlFor={`law-${item.id}`} className="font-semibold">관련 법률</Label>
                                                <Textarea
                                                    id={`law-${item.id}`}
                                                    value={item.relatedLaw}
                                                    readOnly
                                                    onChange={(e) => handleRelatedLawChange(item.id, e.target.value)}
                                                    className="mt-1"
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
                                                    className="mt-1"
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
                                                    className="mt-1"
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