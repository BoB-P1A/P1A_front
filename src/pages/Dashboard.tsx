
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, BarChart3, ClipboardList } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';
import { api, apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ChecklistItem {
    no: string;
    status: '이행' | '부분이행' | '미이행' | '해당없음' | null;
    evidence?: string;
    files?: unknown[];
    taskId?: string;
    systemId?: string;
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

interface ActionPlanItem {
    no: string;
    title: string;
    period: string;
    department: string;
    owner: string;
    date: string;
}

interface TaskWithChecklist {
    id: string;
    taskName: string;
    lifecycleChecklist?: ChecklistItem[];
    actionPlans?: ActionPlanItem[];
}

interface SystemWithChecklist {
    id: string;
    systemName: string;
    technicalChecklist?: ChecklistItem[];
    securityChecklist?: ChecklistItem[];
    actionPlans?: ActionPlanItem[];
}

interface NonComplianceItem {
    area: string;
    field: string;
    subField: string;
    no: string;
    targetName: string; // 평가대상 (taskName 또는 systemName)
    period: string;
    owner: string;
    status: '부분이행' | '미이행';
    areaType: 'lifecycle' | 'admin' | 'security';
}

// 파스텔톤 색상 정의
const COLORS = {
    이행: '#7eb8da',      // 파스텔 블루
    부분이행: '#f7d794',  // 파스텔 옐로우/오렌지
    미이행: '#f5a5a5',    // 파스텔 레드
};

export default function Dashboard() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [activeStatusTab, setActiveStatusTab] = useState<'미이행' | '부분이행'>('미이행');
    const [loading, setLoading] = useState(true);

    // 데이터 상태
    const [allEvaluationItems, setAllEvaluationItems] = useState<EvaluationItem[]>([]);
    const [lifecycleChecklists, setLifecycleChecklists] = useState<ChecklistItem[]>([]);
    const [technicalChecklists, setTechnicalChecklists] = useState<ChecklistItem[]>([]);
    const [securityChecklists, setSecurityChecklists] = useState<ChecklistItem[]>([]);

    // Task/System 데이터 (평가대상 이름 표시용)
    const [lifecycleTasks, setLifecycleTasks] = useState<TaskWithChecklist[]>([]);
    const [technicalSystems, setTechnicalSystems] = useState<SystemWithChecklist[]>([]);
    const [securitySystems, setSecuritySystems] = useState<SystemWithChecklist[]>([]);

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
        return Math.round(rate * 10) / 10;
    };

    // 상태별 개수 계산 함수
    const calculateStatusCounts = (checklists: ChecklistItem[]) => {
        const validChecklists = checklists.filter(item =>
            item.status && item.status !== '해당없음'
        );

        return {
            이행: validChecklists.filter(item => item.status === '이행').length,
            부분이행: validChecklists.filter(item => item.status === '부분이행').length,
            미이행: validChecklists.filter(item => item.status === '미이행').length,
        };
    };

    // 미이행/부분이행 항목 추출 함수 (Lifecycle용)
    const getLifecycleNonComplianceItems = (
        tasks: TaskWithChecklist[],
        evaluationItems: EvaluationItem[],
        statusFilter: '미이행' | '부분이행'
    ): NonComplianceItem[] => {
        const result: NonComplianceItem[] = [];

        tasks.forEach(task => {
            if (!task.lifecycleChecklist) return;

            // actionPlans를 Map으로 변환
            const actionPlansMap = new Map<string, ActionPlanItem>();
            if (task.actionPlans) {
                task.actionPlans.forEach(plan => {
                    actionPlansMap.set(plan.no, plan);
                });
            }

            task.lifecycleChecklist
                .filter(item => item.status === statusFilter)
                .forEach(checklist => {
                    const evalItem = evaluationItems.find(e => e.no === checklist.no);
                    const actionPlan = actionPlansMap.get(checklist.no);

                    if (evalItem) {
                        result.push({
                            area: evalItem.area,
                            field: evalItem.field,
                            subField: evalItem.subField,
                            no: checklist.no,
                            targetName: task.taskName, // 처리업무명
                            period: actionPlan?.period || '-',
                            owner: actionPlan?.owner || '-',
                            status: statusFilter,
                            areaType: 'lifecycle'
                        });
                    }
                });
        });

        return result;
    };

    // 미이행/부분이행 항목 추출 함수 (Technical용)
    const getTechnicalNonComplianceItems = (
        systems: SystemWithChecklist[],
        evaluationItems: EvaluationItem[],
        statusFilter: '미이행' | '부분이행'
    ): NonComplianceItem[] => {
        const result: NonComplianceItem[] = [];

        systems.forEach(system => {
            if (!system.technicalChecklist) return;

            // actionPlans를 Map으로 변환
            const actionPlansMap = new Map<string, ActionPlanItem>();
            if (system.actionPlans) {
                system.actionPlans.forEach(plan => {
                    actionPlansMap.set(plan.no, plan);
                });
            }

            system.technicalChecklist
                .filter(item => item.status === statusFilter)
                .forEach(checklist => {
                    const evalItem = evaluationItems.find(e => e.no === checklist.no);
                    const actionPlan = actionPlansMap.get(checklist.no);

                    if (evalItem) {
                        result.push({
                            area: evalItem.area,
                            field: evalItem.field,
                            subField: evalItem.subField,
                            no: checklist.no,
                            targetName: system.systemName, // 시스템명
                            period: actionPlan?.period || '-',
                            owner: actionPlan?.owner || '-',
                            status: statusFilter,
                            areaType: 'admin'
                        });
                    }
                });
        });

        return result;
    };

    // 미이행/부분이행 항목 추출 함수 (Security용)
    const getSecurityNonComplianceItems = (
        systems: SystemWithChecklist[],
        evaluationItems: EvaluationItem[],
        statusFilter: '미이행' | '부분이행'
    ): NonComplianceItem[] => {
        const result: NonComplianceItem[] = [];

        systems.forEach(system => {
            if (!system.securityChecklist) return;

            // actionPlans를 Map으로 변환
            const actionPlansMap = new Map<string, ActionPlanItem>();
            if (system.actionPlans) {
                system.actionPlans.forEach(plan => {
                    actionPlansMap.set(plan.no, plan);
                });
            }

            system.securityChecklist
                .filter(item => item.status === statusFilter)
                .forEach(checklist => {
                    const evalItem = evaluationItems.find(e => e.no === checklist.no);
                    const actionPlan = actionPlansMap.get(checklist.no);

                    if (evalItem) {
                        result.push({
                            area: evalItem.area,
                            field: evalItem.field,
                            subField: evalItem.subField,
                            no: checklist.no,
                            targetName: system.systemName, // 검토대상명 (시스템명)
                            period: actionPlan?.period || '-',
                            owner: actionPlan?.owner || '-',
                            status: statusFilter,
                            areaType: 'security'
                        });
                    }
                });
        });

        return result;
    };

    // 데이터 로드
    useEffect(() => {
        const fetchData = async () => {
            if (!user?.companyId) return;

            try {
                setLoading(true);

                // 회사 정보 및 평가항목 가져오기
                const companyResponse = await api.companies.getById(user.companyId);
                const companyData = companyResponse;

                if (companyData?.evaluationItems) {
                    setAllEvaluationItems(companyData.evaluationItems);
                }

                // Lifecycle 체크리스트 (tasks-with-checklists 사용)
                const lifecycleResponse = await apiClient.get("/lifecycle/tasks-with-checklists", {
                    params: { companyId: user.companyId }
                });

                const allLifecycleChecklists: ChecklistItem[] = [];

                if (lifecycleResponse.data) {
                    setLifecycleTasks(lifecycleResponse.data);
                    lifecycleResponse.data.forEach((task: TaskWithChecklist) => {
                        if (task.lifecycleChecklist) {
                            allLifecycleChecklists.push(...task.lifecycleChecklist.map(item => ({
                                ...item,
                                taskId: task.id
                            })));
                        }
                    });
                }
                setLifecycleChecklists(allLifecycleChecklists);

                // Technical 체크리스트 (systems-with-checklists 사용)
                const technicalResponse = await apiClient.get("/technical/systems-with-checklists", {
                    params: { companyId: user.companyId }
                });

                const allTechnicalChecklists: ChecklistItem[] = [];

                if (technicalResponse.data) {
                    setTechnicalSystems(technicalResponse.data);
                    technicalResponse.data.forEach((system: SystemWithChecklist) => {
                        if (system.technicalChecklist) {
                            allTechnicalChecklists.push(...system.technicalChecklist.map(item => ({
                                ...item,
                                systemId: system.id
                            })));
                        }
                    });
                }
                setTechnicalChecklists(allTechnicalChecklists);

                // Security 체크리스트 (systems-with-checklists 사용)
                const securityResponse = await apiClient.get("/security/systems-with-checklists", {
                    params: { companyId: user.companyId }
                });

                const allSecurityChecklists: ChecklistItem[] = [];

                if (securityResponse.data) {
                    setSecuritySystems(securityResponse.data);
                    securityResponse.data.forEach((system: SystemWithChecklist) => {
                        if (system.securityChecklist) {
                            allSecurityChecklists.push(...system.securityChecklist.map(item => ({
                                ...item,
                                systemId: system.id
                            })));
                        }
                    });
                }
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

    // 상태별 개수
    const lifecycleStatusCounts = calculateStatusCounts(lifecycleChecklists);
    const adminStatusCounts = calculateStatusCounts(technicalChecklists);
    const securityStatusCounts = calculateStatusCounts(securityChecklists);

    // 영역별 이행률 데이터 (도넛 차트용)
    const areaImplementationData = [
        { name: '개인정보 처리단계(Lifecycle)', value: lifecycleRate, color: '#9566b2' },
        { name: '개인정보 처리시스템(Admin)', value: adminRate, color: '#00a0af' },
        { name: '보안성 검토', value: securityRate, color: '#2d364c' }
    ];

    // 막대그래프 데이터
    const barChartData = [
        {
            name: 'Lifecycle',
            이행: lifecycleStatusCounts.이행,
            부분이행: lifecycleStatusCounts.부분이행,
            미이행: lifecycleStatusCounts.미이행,
        },
        {
            name: 'Admin',
            이행: adminStatusCounts.이행,
            부분이행: adminStatusCounts.부분이행,
            미이행: adminStatusCounts.미이행,
        },
        {
            name: '보안성 검토',
            이행: securityStatusCounts.이행,
            부분이행: securityStatusCounts.부분이행,
            미이행: securityStatusCounts.미이행,
        }
    ];

    // 미이행/부분이행 항목 목록
    const allNonComplianceItems: NonComplianceItem[] = [
        ...getLifecycleNonComplianceItems(lifecycleTasks, lifecycleEvaluationItems, activeStatusTab),
        ...getTechnicalNonComplianceItems(technicalSystems, adminEvaluationItems, activeStatusTab),
        ...getSecurityNonComplianceItems(securitySystems, securityEvaluationItems, activeStatusTab),
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary">대시보드</h1>
                    <p className="text-muted-foreground mt-1">
                        안녕하세요, {user?.name}님!
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

            {/* 메인 컨텐츠 - 2열 레이아웃 */}
            <div className="grid grid-cols-5 gap-4">
                {/* 좌측: 차트 영역 */}
                <div className="col-span-3 space-y-4">
                    {/* 영역별 이행률 차트 */}
                    <Card className="shadow-pia-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Shield className="h-4 w-4 text-pia-secondary" />
                                점검 영역별 보호수준
                            </CardTitle>
                            <CardDescription className="text-xs">
                                영역별 이행률을 확인하세요
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="grid grid-cols-3 gap-2">
                                {areaImplementationData.map((area, index) => {
                                    const donutData = [
                                        { name: 'completed', value: area.value },
                                        { name: 'remaining', value: 100 - area.value }
                                    ];

                                    return (
                                        <div key={index} className="text-center">
                                            <p
                                                className="text-xs font-medium mb-1 truncate"
                                                style={{ color: area.color }}
                                                title={area.name}
                                            >
                                                {area.name}
                                            </p>
                                            <ResponsiveContainer width="100%" height={100}>
                                                <PieChart>
                                                    <Pie
                                                        data={donutData}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        outerRadius={38}
                                                        innerRadius={25}
                                                        dataKey="value"
                                                        startAngle={90}
                                                        endAngle={-270}
                                                    >
                                                        <Cell fill={area.color} />
                                                        <Cell fill="#e5e7eb" />
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <p className="text-base font-bold -mt-1" style={{ color: area.color }}>
                                                {area.value.toFixed(1)}%
                                            </p>
                                            <p className="text-xs text-muted-foreground">이행률</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 영역별 이행 상태 막대그래프 */}
                    <Card className="shadow-pia-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BarChart3 className="h-4 w-4 text-pia-secondary" />
                                영역별 이행 상태
                            </CardTitle>
                            <CardDescription className="text-xs">
                                각 영역의 이행, 부분이행, 미이행 항목 개수를 확인하세요
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                                    <Bar dataKey="이행" fill={COLORS.이행} name="이행" barSize={18} />
                                    <Bar dataKey="부분이행" fill={COLORS.부분이행} name="부분이행" barSize={18} />
                                    <Bar dataKey="미이행" fill={COLORS.미이행} name="미이행" barSize={18} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* 우측: 조치 필요 항목 */}
                <div className="col-span-2">
                    <Card className="shadow-pia-card h-full flex flex-col">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ClipboardList className="h-4 w-4 text-pia-secondary" />
                                조치 필요 항목
                            </CardTitle>
                            <CardDescription className="text-xs">
                                미이행 및 부분이행 항목
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 flex-1 flex flex-col min-h-0">
                            <Tabs
                                value={activeStatusTab}
                                onValueChange={(value) => setActiveStatusTab(value as '미이행' | '부분이행')}
                                className="flex flex-col flex-1 min-h-0"
                            >
                                <TabsList className="mb-2 w-full">
                                    <TabsTrigger value="미이행" className="text-xs flex-1">
                                        미이행 ({
                                        lifecycleStatusCounts.미이행 +
                                        adminStatusCounts.미이행 +
                                        securityStatusCounts.미이행
                                    })
                                    </TabsTrigger>
                                    <TabsTrigger value="부분이행" className="text-xs flex-1">
                                        부분이행 ({
                                        lifecycleStatusCounts.부분이행 +
                                        adminStatusCounts.부분이행 +
                                        securityStatusCounts.부분이행
                                    })
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value={activeStatusTab} className="flex-1 min-h-0 mt-0">
                                    {allNonComplianceItems.length > 0 ? (
                                        <div className="overflow-y-auto h-[400px] border rounded-md">
                                            <Table>
                                                <TableHeader className="sticky top-0 bg-background z-10">
                                                    <TableRow>
                                                        <TableHead className="w-[70px] text-xs">No.</TableHead>
                                                        <TableHead className="text-xs">평가대상</TableHead>
                                                        <TableHead className="text-xs">조치기간</TableHead>
                                                        <TableHead className="text-xs">담당자</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {allNonComplianceItems.map((item, index) => (
                                                        <TableRow key={`${item.areaType}-${item.no}-${index}`}>
                                                            <TableCell className="text-xs font-medium">{item.no}</TableCell>
                                                            <TableCell className="text-xs">{item.targetName}</TableCell>
                                                            <TableCell className="text-xs">{item.period}</TableCell>
                                                            <TableCell className="text-xs">{item.owner}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-muted-foreground text-sm">
                                            {activeStatusTab} 항목이 없습니다.
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}