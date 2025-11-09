
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Document, Packer, Paragraph, Table as DocxTable, TableCell, TableRow, TextRun, WidthType, HeadingLevel, AlignmentType } from 'docx';
import { Table, TableBody, TableCell as UITableCell, TableHead, TableHeader, TableRow as UITableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function SecurityReport() {
    const { user } = useAuth();
    const [securityData, setSecurityData] = useState<any[]>([]);
    const [improvements, setImprovements] = useState<any>({});
    const [securitySystems, setSecuritySystems] = useState<{ id: string; name: string }[]>([]);
    const [actionPlansData, setActionPlansData] = useState<any>({});

    useEffect(() => {
        const loadData = async () => {
            if (!user?.companyId) return;

            try {
                const [checklistData, improvementsData, systemsData, actionPlans] = await Promise.all([
                    api.security.checklists.getAll({ companyId: user.companyId }),
                    api.security.improvements.getAll(user.companyId),
                    api.security.targets.getAll(user.companyId),
                    api.security.actionPlans.getAll(user.companyId),
                ]);

                setSecurityData(Array.isArray(checklistData) ? checklistData : []);
                setImprovements(improvementsData || {});
                setSecuritySystems(Array.isArray(systemsData) ? systemsData : []);
                setActionPlansData(actionPlans || {});
            } catch (error) {
                console.error('Failed to load data:', error);
                setSecurityData([]);
                setImprovements({});
                setSecuritySystems([]);
                setActionPlansData({});
            }
        };

        loadData();
    }, [user?.companyId]);

    const handleDownload = async () => {
        try {
            const sections = [];
            sections.push(new Paragraph({
                text: '보안성 검토 결과보고서',
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            }));

            // 1. 영향평가 기준
            sections.push(new Paragraph({
                text: '1. 영향평가 기준',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 }
            }));

            const criteriaBySystem: { [systemId: string]: { [subField: string]: string[] } } = {};
            if (Array.isArray(securityData)) {
                securityData.forEach((item: any) => {
                    if (item.status !== '해당없음') {
                        if (!criteriaBySystem[item.systemId]) criteriaBySystem[item.systemId] = {};
                        if (!criteriaBySystem[item.systemId][item.subField]) {
                            criteriaBySystem[item.systemId][item.subField] = [];
                        }
                        criteriaBySystem[item.systemId][item.subField].push(item.no);
                    }
                });
            }

            const systemOrder = securitySystems.map((s: any) => s.id);
            const sortedSystemIds = Object.keys(criteriaBySystem).sort((a, b) => {
                const indexA = systemOrder.indexOf(a);
                const indexB = systemOrder.indexOf(b);
                return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
            });

            sortedSystemIds.forEach(systemId => {
                const system = securitySystems.find(s => s.id === systemId);
                const systemName = system?.name || systemId;

                sections.push(new Paragraph({
                    spacing: { before: 200, after: 100 },
                    children: [new TextRun({ text: `[${systemName}]`, bold: true })]
                }));
                Object.keys(criteriaBySystem[systemId]).forEach(subField => {
                    sections.push(new Paragraph({
                        text: `- ${subField} (${criteriaBySystem[systemId][subField].join(', ')})`
                    }));
                });
            });

            // 2. 침해요인 분석
            sections.push(new Paragraph({
                text: '2. 평가기준에 따른 개인정보 침해요인 분석･평가',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 }
            }));

            const riskItems: any[] = [];
            if (Array.isArray(securityData)) {
                securityData.forEach((item: any) => {
                    if (item.status === '부분이행' || item.status === '미이행') {
                        riskItems.push({
                            systemId: item.systemId,
                            systemName: item.systemName,
                            code: item.no,
                            evidence: item.evidence || '',
                            riskFactor: item.riskFactors || ''
                        });
                    }
                });
            }

            if (riskItems.length > 0) {
                const riskRows = [
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph('검토대상명')] }),
                            new TableCell({ children: [new Paragraph('질의문 코드')] }),
                            new TableCell({ children: [new Paragraph('취약점')] }),
                            new TableCell({ children: [new Paragraph('침해요인')] })
                        ]
                    }),
                    ...riskItems.map((item: any) => new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph(item.systemName)] }),
                            new TableCell({ children: [new Paragraph(item.code)] }),
                            new TableCell({ children: [new Paragraph(item.evidence)] }),
                            new TableCell({ children: [new Paragraph(item.riskFactor)] })
                        ]
                    }))
                ];
                sections.push(new DocxTable({
                    rows: riskRows,
                    width: { size: 100, type: WidthType.PERCENTAGE }
                }));
            }

            // 3. 개선 조치 계획
            sections.push(new Paragraph({
                text: '3. 주요 위험요소에 따른 개선 조치 계획',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 }
            }));

            // securityData 기반으로 생성
            const actionPlansBySystem: { [systemId: string]: any[] } = {};

            if (Array.isArray(securityData)) {
                securityData.forEach((item: any) => {
                    if (item.status === '부분이행' || item.status === '미이행') {
                        if (!actionPlansBySystem[item.systemId]) {
                            actionPlansBySystem[item.systemId] = [];
                        }
                        actionPlansBySystem[item.systemId].push({
                            code: item.no,
                            question: item.item || '',
                            evidence: item.evidence || '',
                            improvementGuide: item.improvementGuides || '',
                            actionPlan: '',
                            actionPeriod: '',
                            department: '',
                            manager: '',
                            actionDate: ''
                        });
                    }
                });
            }

            // actionPlans API 데이터와 병합
            Object.keys(actionPlansData).forEach(id => {
                const plan = actionPlansData[id];
                if (plan && plan.systemId && actionPlansBySystem[plan.systemId]) {
                    const targetItem = actionPlansBySystem[plan.systemId].find(
                        (item: any) => item.code === plan.code
                    );
                    if (targetItem) {
                        targetItem.actionPlan = plan.actionPlan || '';
                        targetItem.actionPeriod = plan.actionPeriod || '';
                        targetItem.department = plan.department || '';
                        targetItem.manager = plan.manager || '';
                        targetItem.actionDate = plan.actionDate || '';
                    }
                }
            });

            // Sort by systems order
            const sortedActionSystemIds = Object.keys(actionPlansBySystem).sort((a, b) => {
                const indexA = systemOrder.indexOf(a);
                const indexB = systemOrder.indexOf(b);
                return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
            });

            sortedActionSystemIds.forEach(systemId => {
                const system = securitySystems.find(s => s.id === systemId);
                const systemName = system?.name || systemId;

                sections.push(new Paragraph({
                    spacing: { before: 200, after: 100 },
                    children: [new TextRun({ text: `[${systemName}]`, bold: true })]
                }));

                const actionRows = [
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph('질의문 코드')] }),
                            new TableCell({ children: [new Paragraph('질의문')] }),
                            new TableCell({ children: [new Paragraph('취약점')] }),
                            new TableCell({ children: [new Paragraph('개선 가이드')] }),
                            new TableCell({ children: [new Paragraph('조치 방안')] }),
                            new TableCell({ children: [new Paragraph('조치 기간')] }),
                            new TableCell({ children: [new Paragraph('부서')] }),
                            new TableCell({ children: [new Paragraph('담당자')] }),
                            new TableCell({ children: [new Paragraph('조치 일시')] })
                        ]
                    }),
                    ...actionPlansBySystem[systemId].map(act => new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph(act.code || '')] }),
                            new TableCell({ children: [new Paragraph(act.question || '')] }),
                            new TableCell({ children: [new Paragraph(act.evidence || '')] }),
                            new TableCell({ children: [new Paragraph(act.improvementGuide || '')] }),
                            new TableCell({ children: [new Paragraph(act.actionPlan || '')] }),
                            new TableCell({ children: [new Paragraph(act.actionPeriod || '')] }),
                            new TableCell({ children: [new Paragraph(act.department || '')] }),
                            new TableCell({ children: [new Paragraph(act.manager || '')] }),
                            new TableCell({ children: [new Paragraph(act.actionDate || '')] })
                        ]
                    }))
                ];
                sections.push(new DocxTable({
                    rows: actionRows,
                    width: { size: 100, type: WidthType.PERCENTAGE }
                }));
            });

            // 4. 평가결과
            sections.push(new Paragraph({
                text: '4. 평가결과',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 }
            }));

            const resultsBySystem: { [systemId: string]: { [field: string]: { 이행: number, 부분이행: number, 미이행: number, 해당없음: number } } } = {};
            if (Array.isArray(securityData)) {
                securityData.forEach((item: any) => {
                    if (!resultsBySystem[item.systemId]) resultsBySystem[item.systemId] = {};
                    if (!resultsBySystem[item.systemId][item.field]) {
                        resultsBySystem[item.systemId][item.field] = { 이행: 0, 부분이행: 0, 미이행: 0, 해당없음: 0 };
                    }
                    if (item.status) {
                        resultsBySystem[item.systemId][item.field][item.status]++;
                    }
                });
            }

            const sortedResultSystemIds = Object.keys(resultsBySystem).sort((a, b) => {
                const indexA = systemOrder.indexOf(a);
                const indexB = systemOrder.indexOf(b);
                return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
            });

            sortedResultSystemIds.forEach(systemId => {
                const system = securitySystems.find(s => s.id === systemId);
                const systemName = system?.name || systemId;

                sections.push(new Paragraph({
                    spacing: { before: 200, after: 100 },
                    children: [new TextRun({ text: `[${systemName}]`, bold: true })]
                }));

                Object.keys(resultsBySystem[systemId]).forEach(field => {
                    const counts = resultsBySystem[systemId][field];
                    const total = counts.이행 + counts.부분이행 + counts.미이행;
                    const rate = total > 0 ? ((counts.이행 + counts.부분이행 * 0.5) / total * 100).toFixed(1) : '0.0';

                    sections.push(new Paragraph({
                        text: `${field}: 이행 ${counts.이행}건, 부분이행 ${counts.부분이행}건, 미이행 ${counts.미이행}건, 해당없음 ${counts.해당없음}건 (이행률: ${rate}%)`
                    }));
                });
            });

            const doc = new Document({ sections: [{ children: sections }] });
            const blob = await Packer.toBlob(doc);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = '보안성검토_결과보고서.docx';
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('보고서 생성 중 오류가 발생했습니다.');
        }
    };

    // 화면 표시용 로직
    const criteriaBySystem: { [systemId: string]: { [subField: string]: string[] } } = {};
    if (Array.isArray(securityData)) {
        securityData.forEach((item: any) => {
            if (item.status !== '해당없음') {
                if (!criteriaBySystem[item.systemId]) criteriaBySystem[item.systemId] = {};
                if (!criteriaBySystem[item.systemId][item.subField]) {
                    criteriaBySystem[item.systemId][item.subField] = [];
                }
                criteriaBySystem[item.systemId][item.subField].push(item.no);
            }
        });
    }

    const systemOrder = Array.isArray(securitySystems) ? securitySystems.map((s: any) => s.id) : [];

    const riskItems = Array.isArray(securityData)
        ? securityData.filter((item: any) => item.status === '부분이행' || item.status === '미이행')
            .map((item: any) => {
                return {
                    systemId: item.systemId,
                    systemName: item.systemName,
                    code: item.no,
                    evidence: item.evidence || '',
                    riskFactor: item.riskFactors || ''
                };
            })
        : [];

    // 3번 섹션용 actionPlansBySystem 생성
    const actionPlansBySystem: { [systemId: string]: any[] } = {};

    if (Array.isArray(securityData)) {
        securityData.forEach((item: any) => {
            if (item.status === '부분이행' || item.status === '미이행') {
                if (!actionPlansBySystem[item.systemId]) {
                    actionPlansBySystem[item.systemId] = [];
                }

                const itemId = `${item.systemId}-${item.no}`;
                const savedPlan = actionPlansData[itemId];

                actionPlansBySystem[item.systemId].push({
                    systemName: item.systemName,
                    code: item.no,
                    question: item.item || '',
                    evidence: item.evidence || '',
                    improvementGuide: item.improvementGuides || '',
                    actionPlan: savedPlan?.actionPlan || '',
                    actionPeriod: savedPlan?.actionPeriod || '',
                    department: savedPlan?.department || '',
                    manager: savedPlan?.manager || '',
                    actionDate: savedPlan?.actionDate || ''
                });
            }
        });
    }

    const resultsBySystem: { [systemId: string]: { [field: string]: { 이행: number, 부분이행: number, 미이행: number, 해당없음: number } } } = {};
    if (Array.isArray(securityData)) {
        securityData.forEach((item: any) => {
            if (!resultsBySystem[item.systemId]) resultsBySystem[item.systemId] = {};
            if (!resultsBySystem[item.systemId][item.field]) {
                resultsBySystem[item.systemId][item.field] = { 이행: 0, 부분이행: 0, 미이행: 0, 해당없음: 0 };
            }
            if (item.status) resultsBySystem[item.systemId][item.field][item.status]++;
        });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary">보안성 검토 결과보고서</h1>
                    <p className="text-muted-foreground mt-2">보안성 검토 수행 과정의 전체 결과를 확인합니다</p>
                </div>
                <Button variant="secondary" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />다운로드
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>1. 영향평가 기준</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {(() => {
                        const sortedSystemIds = Object.keys(criteriaBySystem).sort((a, b) => {
                            const indexA = systemOrder.indexOf(a);
                            const indexB = systemOrder.indexOf(b);
                            return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
                        });

                        return sortedSystemIds.map((systemId) => {
                            const system = securitySystems.find(s => s.id === systemId);
                            const systemName = system?.name || systemId;

                            return (
                                <div key={systemId}>
                                    <p className="font-semibold">[{systemName}]</p>
                                    <ul className="list-disc pl-6">
                                        {Object.keys(criteriaBySystem[systemId]).map((sub) => (
                                            <li key={sub}>{sub} ({criteriaBySystem[systemId][sub].join(', ')})</li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        });
                    })()}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>2. 평가기준에 따른 개인정보 침해요인 분석·평가</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <UITableRow>
                                    <TableHead>검토대상명</TableHead>
                                    <TableHead>질의문 코드</TableHead>
                                    <TableHead>취약점</TableHead>
                                    <TableHead>침해요인</TableHead>
                                </UITableRow>
                            </TableHeader>
                            <TableBody>
                                {riskItems.map((r: any, i: number) => (
                                    <UITableRow key={i}>
                                        <UITableCell>{r.systemName}</UITableCell>
                                        <UITableCell>{r.code}</UITableCell>
                                        <UITableCell>{r.evidence}</UITableCell>
                                        <UITableCell>{r.riskFactor}</UITableCell>
                                    </UITableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>3. 주요 위험요소에 따른 개선 조치 계획</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(() => {
                        const sortedSystemIds = Object.keys(actionPlansBySystem).sort((a, b) => {
                            const indexA = systemOrder.indexOf(a);
                            const indexB = systemOrder.indexOf(b);
                            return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
                        });

                        return sortedSystemIds.map((systemId) => {
                            const system = securitySystems.find(s => s.id === systemId);
                            const systemName = system?.name || systemId;

                            return (
                                <div key={systemId} className="space-y-2">
                                    <p className="font-semibold">[{systemName}]</p>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <UITableRow>
                                                    <TableHead>질의문 코드</TableHead>
                                                    <TableHead>질의문</TableHead>
                                                    <TableHead>취약점</TableHead>
                                                    <TableHead>개선 가이드</TableHead>
                                                    <TableHead>조치 방안</TableHead>
                                                    <TableHead>조치 기간</TableHead>
                                                    <TableHead>부서</TableHead>
                                                    <TableHead>담당자</TableHead>
                                                    <TableHead>조치 일시</TableHead>
                                                </UITableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {actionPlansBySystem[systemId].map((plan, idx) => (
                                                    <UITableRow key={idx}>
                                                        <UITableCell>{plan.code}</UITableCell>
                                                        <UITableCell>{plan.question}</UITableCell>
                                                        <UITableCell>{plan.evidence}</UITableCell>
                                                        <UITableCell>{plan.improvementGuide}</UITableCell>
                                                        <UITableCell>{plan.actionPlan}</UITableCell>
                                                        <UITableCell>{plan.actionPeriod}</UITableCell>
                                                        <UITableCell>{plan.department}</UITableCell>
                                                        <UITableCell>{plan.manager}</UITableCell>
                                                        <UITableCell>{plan.actionDate}</UITableCell>
                                                    </UITableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>4. 평가결과</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {(() => {
                        const sortedResultSystemIds = Object.keys(resultsBySystem).sort((a, b) => {
                            const indexA = systemOrder.indexOf(a);
                            const indexB = systemOrder.indexOf(b);
                            return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
                        });

                        return sortedResultSystemIds.map((systemId) => {
                            const system = securitySystems.find(s => s.id === systemId);
                            const systemName = system?.name || systemId;

                            return (
                                <div key={systemId} className="space-y-1">
                                    <p className="font-semibold">[{systemName}]</p>
                                    {Object.keys(resultsBySystem[systemId]).map((field) => {
                                        const counts = resultsBySystem[systemId][field];
                                        const total = counts.이행 + counts.부분이행 + counts.미이행;
                                        const rate = total > 0 ? ((counts.이행 + counts.부분이행 * 0.5) / total * 100).toFixed(1) : '0.0';
                                        return (
                                            <p key={field} className="text-sm">
                                                {field}: 이행 {counts.이행}건, 부분이행 {counts.부분이행}건, 미이행 {counts.미이행}건, 해당없음 {counts.해당없음}건 (이행률: {rate}%)
                                            </p>
                                        );
                                    })}
                                </div>
                            );
                        });
                    })()}
                </CardContent>
            </Card>
        </div>
    );
}