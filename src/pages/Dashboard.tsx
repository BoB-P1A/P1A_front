import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Legend,
    Tooltip
} from 'recharts';
import {api, apiClient} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ChecklistItem {
    no: string;
    status: '이행' | '부분이행' | '미이행' | '해당없음' | null;
    evidence?: string;
    files?: any[];
}

interface EvaluationItem {
    id: number;
    area: string;
    field: string;
    subField: string;
    no: string;
    item: string;
    riskFactors: string;
    improvementGuides: string;
    law: string;
}

export default function Dashboard() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'area' | 'field' | 'subField'>('area');
    const [loading, setLoading] = useState(true);

    // 데이터 상태
    const [allEvaluationItems, setAllEvaluationItems] = useState<EvaluationItem[]>([]);
    const [lifecycleChecklists, setLifecycleChecklists] = useState<ChecklistItem[]>([]);
    const [technicalChecklists, setTechnicalChecklists] = useState<ChecklistItem[]>([]);
    const [securityChecklists, setSecurityChecklists] = useState<ChecklistItem[]>([]);

    // 영역별로 필터링된 평가항목
    const lifecycleEvaluationItems = allEvaluationItems.filter(item => item.area?.startsWith('1.'));
    const adminEvaluationItems = allEvaluationItems.filter(item => item.area?.startsWith('2.'));
    const securityEvaluationItems = allEvaluationItems.filter(item => item.area?.startsWith('3.'));

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'admin': return '관리자';
            case 'developer': return '개발팀';
            case 'privacy-team': return '개인정보팀';
            case 'planning-team': return '사업주관팀';
            default: return role;
        }
    };

    // 이행률 계산 함수 (해당없음과 null 제외)
    const calculateImplementationRate = (checklists: ChecklistItem[]): number => {
        if (!checklists || checklists.length === 0) return 0;

        // "해당없음"과 null을 제외한 항목만 계산
        const validChecklists = checklists.filter(item =>
            item.status && item.status !== '해당없음'
        );

        if (validChecklists.length === 0) return 0;

        const implemented = validChecklists.filter(item => item.status === '이행').length;
        const partial = validChecklists.filter(item => item.status === '부분이행').length;
        const notImplemented = validChecklists.filter(item => item.status === '미이행').length;

        const total = implemented + partial + notImplemented;
        if (total === 0) return 0;

        const rate = (implemented + partial * 0.5) / total * 100;
        return Math.round(rate * 10) / 10; // 소수점 첫째자리까지
    };

    // 분야별 이행률 계산
    const calculateFieldRates = (
        checklists: ChecklistItem[],
        evaluationItems: EvaluationItem[]
    ): { subject: string; value: number }[] => {
        const fieldMap = new Map<string, ChecklistItem[]>();

        checklists.forEach(checklist => {
            const evalItem = evaluationItems.find(item => item.no === checklist.no);
            if (evalItem) {
                const field = evalItem.field;
                if (!fieldMap.has(field)) {
                    fieldMap.set(field, []);
                }
                fieldMap.get(field)!.push(checklist);
            }
        });

        const result: { subject: string; value: number }[] = [];
        fieldMap.forEach((items, field) => {
            result.push({
                subject: field,
                value: calculateImplementationRate(items)
            });
        });

        // 데이터가 없으면 빈 배열 반환
        return result.length > 0 ? result : [{ subject: '데이터 없음', value: 0 }];
    };

    // 세부분야별 이행률 계산
    const calculateSubFieldRates = (
        checklists: ChecklistItem[],
        evaluationItems: EvaluationItem[]
    ): { subject: string; value: number }[] => {
        const subFieldMap = new Map<string, ChecklistItem[]>();

        checklists.forEach(checklist => {
            const evalItem = evaluationItems.find(item => item.no === checklist.no);
            if (evalItem) {
                const subField = evalItem.subField;
                if (!subFieldMap.has(subField)) {
                    subFieldMap.set(subField, []);
                }
                subFieldMap.get(subField)!.push(checklist);
            }
        });

        const result: { subject: string; value: number }[] = [];
        subFieldMap.forEach((items, subField) => {
            result.push({
                subject: subField,
                value: calculateImplementationRate(items)
            });
        });

        // 데이터가 없으면 빈 배열 반환
        return result.length > 0 ? result : [{ subject: '데이터 없음', value: 0 }];
    };

    // 데이터 로드
    useEffect(() => {
        const fetchData = async () => {
            if (!user?.companyId) return;

            try {
                setLoading(true);

                // 회사 정보 및 평가항목 가져오기
                const companyResponse = await api.companies.getById(user.companyId);
                console.log('Company Response:', companyResponse);

                const companyData = companyResponse;
                console.log('Company Data:', companyData);
                console.log('Evaluation Items:', companyData?.evaluationItems);

                if (companyData?.evaluationItems) {
                    setAllEvaluationItems(companyData.evaluationItems);
                }

                // Lifecycle 체크리스트 (tasks-with-checklists 사용)
                const lifecycleResponse = await apiClient.get("/lifecycle/tasks-with-checklists", {
                    params: { companyId: user.companyId }
                });
                console.log('Lifecycle Response:', lifecycleResponse);

                const allLifecycleChecklists: ChecklistItem[] = [];
                if (lifecycleResponse.data) {
                    lifecycleResponse.data.forEach((task: any) => {
                        if (task.lifecycleChecklist) {
                            allLifecycleChecklists.push(...task.lifecycleChecklist);
                        }
                    });
                }
                console.log('Lifecycle Checklists:', allLifecycleChecklists);
                setLifecycleChecklists(allLifecycleChecklists);

                // Technical 체크리스트 (systems-with-checklists 사용)
                const technicalResponse = await apiClient.get("/technical/systems-with-checklists", {
                    params: { companyId: user.companyId }
                });
                console.log('Technical Response:', technicalResponse);

                const allTechnicalChecklists: ChecklistItem[] = [];
                if (technicalResponse.data) {
                    technicalResponse.data.forEach((system: any) => {
                        if (system.technicalChecklist) {
                            allTechnicalChecklists.push(...system.technicalChecklist);
                        }
                    });
                }
                console.log('Technical Checklists:', allTechnicalChecklists);
                setTechnicalChecklists(allTechnicalChecklists);

                // Security 체크리스트 (systems-with-checklists 사용)
                const securityResponse = await apiClient.get("/security/systems-with-checklists", {
                    params: { companyId: user.companyId }
                });
                console.log('Security Response:', securityResponse);

                const allSecurityChecklists: ChecklistItem[] = [];
                if (securityResponse.data) {
                    securityResponse.data.forEach((system: any) => {
                        if (system.securityChecklist) {
                            allSecurityChecklists.push(...system.securityChecklist);
                        }
                    });
                }
                console.log('Security Checklists:', allSecurityChecklists);
                setSecurityChecklists(allSecurityChecklists);

            } catch (error) {
                console.error('데이터 로드 실패:', error);
                toast({
                    title: '데이터 로드 실패',
                    description: '대시보드 데이터를 불러오는데 실패했습니다.',
                    variant: 'destructive'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.companyId, toast]);

    // 차트 데이터 계산
    const lifecycleRate = calculateImplementationRate(lifecycleChecklists);
    const adminRate = calculateImplementationRate(technicalChecklists);
    const securityRate = calculateImplementationRate(securityChecklists);

    // 영역별 이행률 데이터 (도넛 차트용)
    const areaImplementationData = [
        { name: '개인정보 처리단계(Lifecycle)', value: lifecycleRate, color: '#6366f1' },
        { name: '개인정보 처리시스템(Admin)', value: adminRate, color: '#8b5cf6' },
        { name: '보안성 검토', value: securityRate, color: '#ec4899' }
    ];

    // 분야별 레이더 차트 데이터 (각 영역에 해당하는 평가항목만 사용)
    const lifecycleFieldData = calculateFieldRates(lifecycleChecklists, lifecycleEvaluationItems);
    const adminFieldData = calculateFieldRates(technicalChecklists, adminEvaluationItems);
    const securityFieldData = calculateFieldRates(securityChecklists, securityEvaluationItems);

    // 세부분야별 레이더 차트 데이터 (각 영역에 해당하는 평가항목만 사용)
    const lifecycleSubFieldData = calculateSubFieldRates(lifecycleChecklists, lifecycleEvaluationItems);
    const adminSubFieldData = calculateSubFieldRates(technicalChecklists, adminEvaluationItems);
    const securitySubFieldData = calculateSubFieldRates(securityChecklists, securityEvaluationItems);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary">대시보드</h1>
                    <p className="text-muted-foreground mt-2">
                        안녕하세요, {user?.name}님! 현재 역할: {getRoleDisplayName(user?.role || '')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="px-3 py-1">
                        {user?.company}
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">
                        {getRoleDisplayName(user?.role || '')}
                    </Badge>
                </div>
            </div>

            {/* 탭 메뉴 */}
            <Card className="shadow-pia-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-pia-secondary" />
                        점검 영역별 보호수준
                    </CardTitle>
                    <CardDescription>
                        영역별 / 분야별 / 세부분야별 이행률을 확인하세요
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="area">영역별</TabsTrigger>
                            <TabsTrigger value="field">분야별</TabsTrigger>
                            <TabsTrigger value="subField">세부분야별</TabsTrigger>
                        </TabsList>

                        {/* 영역별 탭 */}
                        <TabsContent value="area" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {areaImplementationData.map((area, index) => {
                                    // 도넛 차트를 위한 데이터: 이행률과 미이행률
                                    const donutData = [
                                        { name: 'completed', value: area.value },
                                        { name: 'remaining', value: 100 - area.value }
                                    ];

                                    return (
                                        <Card key={index} className="shadow-sm">
                                            <CardHeader>
                                                <CardTitle
                                                    className="text-center text-lg"
                                                    style={{ color: area.color }}
                                                >
                                                    {area.name}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ResponsiveContainer width="100%" height={250}>
                                                    <PieChart>
                                                        <Pie
                                                            data={donutData}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={false}
                                                            outerRadius={80}
                                                            innerRadius={50}
                                                            dataKey="value"
                                                            startAngle={90}
                                                            endAngle={-270}
                                                        >
                                                            <Cell fill={area.color} />
                                                            <Cell fill="#e5e7eb" />
                                                        </Pie>
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="text-center mt-4">
                                                    <p className="text-2xl font-bold" style={{ color: area.color }}>
                                                        {area.value.toFixed(1)}%
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mt-1">이행률</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </TabsContent>

                        {/* 분야별 탭 */}
                        <TabsContent value="field" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Lifecycle 분야별 */}
                                <Card className="shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-blue-600 text-center">
                                            개인정보 처리단계(Lifecycle)
                                        </CardTitle>
                                        <CardDescription className="text-center">
                                            분야별 이행률
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <RadarChart data={lifecycleFieldData}>
                                                <PolarGrid stroke="#e5e7eb" />
                                                <PolarAngleAxis
                                                    dataKey="subject"
                                                    tick={{ fill: '#6b7280', fontSize: 10 }}
                                                />
                                                <PolarRadiusAxis
                                                    angle={90}
                                                    domain={[0, 100]}
                                                    tick={{ fill: '#6b7280', fontSize: 10 }}
                                                />
                                                <Radar
                                                    name="이행률"
                                                    dataKey="value"
                                                    stroke="#6366f1"
                                                    fill="#6366f1"
                                                    fillOpacity={0.5}
                                                />
                                                <Tooltip
                                                    formatter={(value: number) => `${value.toFixed(1)}%`}
                                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                                />
                                                <Legend />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Admin 분야별 */}
                                <Card className="shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-purple-600 text-center">
                                            개인정보 처리시스템(Admin)
                                        </CardTitle>
                                        <CardDescription className="text-center">
                                            분야별 이행률
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <RadarChart data={adminFieldData}>
                                                <PolarGrid stroke="#e5e7eb" />
                                                <PolarAngleAxis
                                                    dataKey="subject"
                                                    tick={{ fill: '#6b7280', fontSize: 10 }}
                                                />
                                                <PolarRadiusAxis
                                                    angle={90}
                                                    domain={[0, 100]}
                                                    tick={{ fill: '#6b7280', fontSize: 10 }}
                                                />
                                                <Radar
                                                    name="이행률"
                                                    dataKey="value"
                                                    stroke="#8b5cf6"
                                                    fill="#8b5cf6"
                                                    fillOpacity={0.5}
                                                />
                                                <Tooltip
                                                    formatter={(value: number) => `${value.toFixed(1)}%`}
                                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                                />
                                                <Legend />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Security 분야별 */}
                                <Card className="shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-pink-600 text-center">
                                            보안성 검토
                                        </CardTitle>
                                        <CardDescription className="text-center">
                                            분야별 이행률
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <RadarChart data={securityFieldData}>
                                                <PolarGrid stroke="#e5e7eb" />
                                                <PolarAngleAxis
                                                    dataKey="subject"
                                                    tick={{ fill: '#6b7280', fontSize: 10 }}
                                                />
                                                <PolarRadiusAxis
                                                    angle={90}
                                                    domain={[0, 100]}
                                                    tick={{ fill: '#6b7280', fontSize: 10 }}
                                                />
                                                <Radar
                                                    name="이행률"
                                                    dataKey="value"
                                                    stroke="#ec4899"
                                                    fill="#ec4899"
                                                    fillOpacity={0.5}
                                                />
                                                <Tooltip
                                                    formatter={(value: number) => `${value.toFixed(1)}%`}
                                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                                />
                                                <Legend />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* 세부분야별 탭 */}
                        <TabsContent value="subField" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Lifecycle 세부분야별 */}
                                <Card className="shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-blue-600 text-center">
                                            개인정보 처리단계(Lifecycle)
                                        </CardTitle>
                                        <CardDescription className="text-center">
                                            세부분야별 이행률
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <RadarChart data={lifecycleSubFieldData}>
                                                <PolarGrid stroke="#e5e7eb" />
                                                <PolarAngleAxis
                                                    dataKey="subject"
                                                    tick={{ fill: '#6b7280', fontSize: 9 }}
                                                />
                                                <PolarRadiusAxis
                                                    angle={90}
                                                    domain={[0, 100]}
                                                    tick={{ fill: '#6b7280', fontSize: 10 }}
                                                />
                                                <Radar
                                                    name="이행률"
                                                    dataKey="value"
                                                    stroke="#6366f1"
                                                    fill="#6366f1"
                                                    fillOpacity={0.5}
                                                />
                                                <Tooltip
                                                    formatter={(value: number) => `${value.toFixed(1)}%`}
                                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                                />
                                                <Legend />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Admin 세부분야별 */}
                                <Card className="shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-purple-600 text-center">
                                            개인정보 처리시스템(Admin)
                                        </CardTitle>
                                        <CardDescription className="text-center">
                                            세부분야별 이행률
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <RadarChart data={adminSubFieldData}>
                                                <PolarGrid stroke="#e5e7eb" />
                                                <PolarAngleAxis
                                                    dataKey="subject"
                                                    tick={{ fill: '#6b7280', fontSize: 9 }}
                                                />
                                                <PolarRadiusAxis
                                                    angle={90}
                                                    domain={[0, 100]}
                                                    tick={{ fill: '#6b7280', fontSize: 10 }}
                                                />
                                                <Radar
                                                    name="이행률"
                                                    dataKey="value"
                                                    stroke="#8b5cf6"
                                                    fill="#8b5cf6"
                                                    fillOpacity={0.5}
                                                />
                                                <Tooltip
                                                    formatter={(value: number) => `${value.toFixed(1)}%`}
                                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                                />
                                                <Legend />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Security 세부분야별 */}
                                <Card className="shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-pink-600 text-center">
                                            보안성 검토
                                        </CardTitle>
                                        <CardDescription className="text-center">
                                            세부분야별 이행률
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <RadarChart data={securitySubFieldData}>
                                                <PolarGrid stroke="#e5e7eb" />
                                                <PolarAngleAxis
                                                    dataKey="subject"
                                                    tick={{ fill: '#6b7280', fontSize: 9 }}
                                                />
                                                <PolarRadiusAxis
                                                    angle={90}
                                                    domain={[0, 100]}
                                                    tick={{ fill: '#6b7280', fontSize: 10 }}
                                                />
                                                <Radar
                                                    name="이행률"
                                                    dataKey="value"
                                                    stroke="#ec4899"
                                                    fill="#ec4899"
                                                    fillOpacity={0.5}
                                                />
                                                <Tooltip
                                                    formatter={(value: number) => `${value.toFixed(1)}%`}
                                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                                />
                                                <Legend />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}