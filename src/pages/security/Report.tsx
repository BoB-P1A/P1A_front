import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Document, Packer, Paragraph, Table as DocxTable, TableCell, TableRow, TextRun, WidthType, AlignmentType, ImageRun, TableLayoutType, ShadingType } from 'docx';
import { Table, TableBody, TableCell as UITableCell, TableHead, TableHeader, TableRow as UITableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';

// 타입 정의 추가
interface StatusCounts {
    이행: number;
    부분이행: number;
    미이행: number;
    해당없음: number;
}

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
            // 제목 헬퍼 함수들
            const createTitle = (text: string) => new Paragraph({
                children: [
                    new TextRun({
                        text: text,
                        bold: true,
                        size: 32,  // 16pt
                        color: "000000"
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            });

            const createHeading2 = (text: string) => new Paragraph({
                children: [
                    new TextRun({
                        text: text,
                        bold: true,
                        size: 28,  // 14pt
                        color: "000000"
                    })
                ],
                spacing: { before: 400, after: 200 }
            });

            const createSystemHeader = (text: string) => new Paragraph({
                children: [
                    new TextRun({
                        text: text,
                        bold: true,
                        size: 22,  // 11pt
                        color: "000000"
                    })
                ],
                spacing: { before: 300, after: 100 }
            });

            const createText = (text: string) => new Paragraph({
                children: [
                    new TextRun({
                        text: text,
                        color: "000000"
                    })
                ]
            });

            // 헤더 셀 생성 함수 (왼쪽 라벨용 - 배경색 추가)
            const createHeaderCell = (text: string, widthDxa?: number) => new TableCell({
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: text || '',
                                bold: true,
                                color: "000000"
                            })
                        ],
                        alignment: AlignmentType.CENTER
                    })
                ],
                width: widthDxa ? { size: widthDxa, type: WidthType.DXA } : undefined,
                shading: { fill: "F2F2F2" },
                margins: { top: 40, bottom: 40, left: 60, right: 60 }
            });

            // 내용 셀 생성 함수 (오른쪽 값용)
            const createContentCell = (text: string, widthDxa?: number) => new TableCell({
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: text || '',
                                color: "000000"
                            })
                        ]
                    })
                ],
                width: widthDxa ? { size: widthDxa, type: WidthType.DXA } : undefined,
                margins: { top: 40, bottom: 40, left: 60, right: 60 }
            });

            // 병합된 헤더 셀 (No. 값 표시용)
            const createMergedHeaderCell = (text: string) => new TableCell({
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: text || '',
                                bold: true,
                                color: "000000"
                            })
                        ],
                        alignment: AlignmentType.CENTER
                    })
                ],
                columnSpan: 2,
                shading: { fill: "EAE3F9" },
                margins: { top: 40, bottom: 40, left: 60, right: 60 }
            });

            // 시스템명 셀 (최상단 타이틀용)
            const createSystemNameCellWhite = (text: string) => new TableCell({
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: text || '',
                                bold: true,
                                size: 24,
                                color: "FFFFFF"
                            })
                        ],
                        alignment: AlignmentType.CENTER
                    })
                ],
                columnSpan: 2,
                shading: { fill: "49176d" },
                margins: { top: 50, bottom: 50, left: 60, right: 60 }
            });

            const sections = [];

            // Title
            sections.push(createTitle('보안성 검토 결과보고서'));

            // 1. 영향평가 기준
            sections.push(createHeading2('1. 영향평가 기준'));

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

                sections.push(createSystemHeader(`[${systemName}]`));
                Object.keys(criteriaBySystem[systemId]).forEach(subField => {
                    const nos = criteriaBySystem[systemId][subField].join(', ');
                    sections.push(createText(`- ${subField} (${nos})`));
                });
            });

            // 2. 평가기준에 따른 개인정보 침해요인 분석･평가
            sections.push(createHeading2('2. 평가기준에 따른 개인정보 침해요인 분석･평가'));

            const riskItemsBySystemDocx: { [systemId: string]: any[] } = {};
            if (Array.isArray(securityData)) {
                securityData.forEach((item: any) => {
                    if (item.status === '부분이행' || item.status === '미이행') {
                        const systemId = item.systemId;
                        if (!riskItemsBySystemDocx[systemId]) {
                            riskItemsBySystemDocx[systemId] = [];
                        }
                        riskItemsBySystemDocx[systemId].push({
                            code: item.no,
                            evidence: item.evidence || '',
                            riskFactor: item.riskFactors || ''
                        });
                    }
                });
            }

            const sortedRiskSystemIdsDocx = Object.keys(riskItemsBySystemDocx).sort((a, b) => {
                const indexA = systemOrder.indexOf(a);
                const indexB = systemOrder.indexOf(b);
                return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
            });

            sortedRiskSystemIdsDocx.forEach(systemId => {
                const system = securitySystems.find(s => s.id === systemId);
                const systemName = system?.name || systemId;

                // 모든 행을 하나의 배열에 모음
                const allRiskRows: TableRow[] = [];

                // 최상단: 시스템명 행
                allRiskRows.push(new TableRow({
                    children: [
                        createSystemNameCellWhite(systemName)
                    ]
                }));

                // 각 항목의 행들을 연속으로 추가
                riskItemsBySystemDocx[systemId].forEach((item) => {
                    // No. 행 (병합된 헤더)
                    allRiskRows.push(new TableRow({
                        children: [
                            createMergedHeaderCell(`${item.code}`)
                        ]
                    }));

                    // 취약점 행
                    allRiskRows.push(new TableRow({
                        children: [
                            createHeaderCell('취약점'),
                            createContentCell(item.evidence)
                        ]
                    }));

                    // 침해요인 행
                    allRiskRows.push(new TableRow({
                        children: [
                            createHeaderCell('침해요인'),
                            createContentCell(item.riskFactor)
                        ]
                    }));
                });

                // 시스템별로 하나의 테이블 생성
                const riskTable = new DocxTable({
                    rows: allRiskRows,
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    layout: TableLayoutType.FIXED,
                    columnWidths: [2500, 15500]  // 2열: 라벨 10%, 내용 90%
                });

                sections.push(riskTable);

                // 시스템 테이블 간 간격
                sections.push(new Paragraph({ text: '', spacing: { after: 300 } }));
            });

            // 3. 주요 위험요소에 따른 개선 조치 계획
            sections.push(createHeading2('3. 주요 위험요소에 따른 개선 조치 계획'));

            // securityData 기반으로 생성
            const actionPlansBySystemDocx: { [systemId: string]: any[] } = {};

            if (Array.isArray(securityData)) {
                securityData.forEach((item: any) => {
                    if (item.status === '부분이행' || item.status === '미이행') {
                        const systemId = item.systemId;
                        if (!actionPlansBySystemDocx[systemId]) {
                            actionPlansBySystemDocx[systemId] = [];
                        }
                        actionPlansBySystemDocx[systemId].push({
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
                if (plan && plan.systemId && actionPlansBySystemDocx[plan.systemId]) {
                    const targetItem = actionPlansBySystemDocx[plan.systemId].find(
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
            const sortedActionSystemIds = Object.keys(actionPlansBySystemDocx).sort((a, b) => {
                const indexA = systemOrder.indexOf(a);
                const indexB = systemOrder.indexOf(b);
                return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
            });

            sortedActionSystemIds.forEach(systemId => {
                const system = securitySystems.find(s => s.id === systemId);
                const systemName = system?.name || systemId;

                const allRows: TableRow[] = [];

                // 4열 테이블용 셀 함수들
                const createSystemNameCell4 = (text: string) => new TableCell({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: text || '',
                                    bold: true,
                                    size: 24,
                                    color: "FFFFFF"
                                })
                            ],
                            alignment: AlignmentType.CENTER
                        })
                    ],
                    columnSpan: 4,
                    shading: { fill: "49176d" },
                    margins: { top: 50, bottom: 50, left: 60, right: 60 }
                });

                const createMergedHeaderCell4 = (text: string) => new TableCell({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: text || '',
                                    bold: true,
                                    color: "000000"
                                })
                            ],
                            alignment: AlignmentType.CENTER
                        })
                    ],
                    columnSpan: 4,
                    shading: { fill: "EAE3F9" },
                    margins: { top: 40, bottom: 40, left: 60, right: 60 }
                });

                const createHeaderCell1 = (text: string) => new TableCell({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: text || '',
                                    bold: true,
                                    color: "000000"
                                })
                            ],
                            alignment: AlignmentType.CENTER
                        })
                    ],
                    shading: { fill: "F2F2F2" },
                    margins: { top: 40, bottom: 40, left: 60, right: 60 }
                });

                const createContentCell3 = (text: string) => new TableCell({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: text || '',
                                    color: "000000"
                                })
                            ]
                        })
                    ],
                    columnSpan: 3,
                    margins: { top: 40, bottom: 40, left: 60, right: 60 }
                });

                const createHeaderCellSmall = (text: string) => new TableCell({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: text || '',
                                    bold: true,
                                    color: "000000"
                                })
                            ],
                            alignment: AlignmentType.CENTER
                        })
                    ],
                    shading: { fill: "F2F2F2" },
                    margins: { top: 40, bottom: 40, left: 60, right: 60 }
                });

                const createContentCellSmall = (text: string) => new TableCell({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: text || '',
                                    color: "000000"
                                })
                            ]
                        })
                    ],
                    margins: { top: 40, bottom: 40, left: 60, right: 60 }
                });

                // 최상단: 시스템명 행 (4열 병합)
                allRows.push(new TableRow({
                    children: [
                        createSystemNameCell4(systemName)
                    ]
                }));

                // 각 plan의 행들을 연속으로 추가
                actionPlansBySystemDocx[systemId].forEach((plan) => {
                    // No. 행 (4열 병합)
                    allRows.push(new TableRow({
                        children: [
                            createMergedHeaderCell4(`${plan.code}`)
                        ]
                    }));

                    // 질의문 행 (1열 라벨 + 3열 병합 값)
                    allRows.push(new TableRow({
                        children: [
                            createHeaderCell1('질의문'),
                            createContentCell3(plan.question)
                        ]
                    }));

                    // 취약점 행
                    allRows.push(new TableRow({
                        children: [
                            createHeaderCell1('취약점'),
                            createContentCell3(plan.evidence)
                        ]
                    }));

                    // 조치 방안 행
                    allRows.push(new TableRow({
                        children: [
                            createHeaderCell1('조치 방안'),
                            createContentCell3(plan.actionPlan)
                        ]
                    }));

                    // 조치 기간 + 부서 행 (4열)
                    allRows.push(new TableRow({
                        children: [
                            createHeaderCellSmall('조치 기간'),
                            createContentCellSmall(plan.actionPeriod),
                            createHeaderCellSmall('부서'),
                            createContentCellSmall(plan.department)
                        ]
                    }));

                    // 담당자 + 조치 일시 행 (4열)
                    allRows.push(new TableRow({
                        children: [
                            createHeaderCellSmall('담당자'),
                            createContentCellSmall(plan.manager),
                            createHeaderCellSmall('조치 일시'),
                            createContentCellSmall(plan.actionDate)
                        ]
                    }));
                });

                // 시스템별로 하나의 테이블 생성 (레이아웃 고정)
                const systemTable = new DocxTable({
                    rows: allRows,
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    layout: TableLayoutType.FIXED,
                    columnWidths: [2500, 6500, 2500, 6500]  // 4열 너비 (DXA 단위, 총 18000 ≈ A4)
                });

                sections.push(systemTable);

                // 시스템 테이블 간 간격
                sections.push(new Paragraph({ text: '', spacing: { after: 300 } }));
            });

            // 색상 정의
            const COLORS = { 이행: '#029DC3', 부분이행: '#EFCE1C', 미이행: '#E02E27' };

            // 스택드 바 차트를 이미지로 생성
            const createStackedBarImage = async (counts: StatusCounts, width = 500, height = 28): Promise<Uint8Array | null> => {
                const total = counts.이행 + counts.부분이행 + counts.미이행;
                if (total === 0) return null;

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d')!;

                // 둥근 모서리 배경
                ctx.fillStyle = '#E5E5E5';
                ctx.beginPath();
                ctx.roundRect(0, 0, width, height, 6);
                ctx.fill();

                let x = 0;
                const segments = [
                    { key: '이행' as const, color: COLORS.이행 },
                    { key: '부분이행' as const, color: COLORS.부분이행 },
                    { key: '미이행' as const, color: COLORS.미이행 }
                ];

                // 각 세그먼트 그리기
                segments.forEach((seg) => {
                    const segWidth = (counts[seg.key] / total) * width;
                    if (segWidth > 0) {
                        ctx.fillStyle = seg.color;
                        ctx.fillRect(x, 0, segWidth, height);

                        // 숫자 표시 (세그먼트가 충분히 넓을 때만)
                        if (segWidth > 25) {
                            ctx.fillStyle = seg.key === '부분이행' ? '#333333' : '#FFFFFF';
                            ctx.font = 'bold 14px Arial';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(String(counts[seg.key]), x + segWidth / 2, height / 2);
                        }
                        x += segWidth;
                    }
                });

                // Canvas → PNG Blob → Uint8Array
                const blob = await new Promise<Blob>((resolve) => canvas.toBlob(resolve!, 'image/png'));
                const buffer = await blob.arrayBuffer();
                return new Uint8Array(buffer);
            };

            // 이행률 계산 & 색상
            const calcRate = (c: StatusCounts) => {
                const total = c.이행 + c.부분이행 + c.미이행;
                return total > 0 ? (c.이행 + c.부분이행 * 0.5) / total * 100 : 0;
            };
            const getRateColor = (rate: number) => rate >= 80 ? '029DC3' : rate >= 50 ? 'B8A000' : 'E02E27';

            // 4. 평가결과
            sections.push(createHeading2('4. 평가결과'));

            // 범례
            sections.push(new Paragraph({
                children: [
                    new TextRun({ text: '범례: ', bold: true, size: 20 }),
                    new TextRun({ text: '■', color: '029DC3', size: 24 }), new TextRun({ text: ' 이행   ', size: 20 }),
                    new TextRun({ text: '■', color: 'EFCE1C', size: 24 }), new TextRun({ text: ' 부분이행   ', size: 20 }),
                    new TextRun({ text: '■', color: 'E02E27', size: 24 }), new TextRun({ text: ' 미이행', size: 20 })
                ],
                spacing: { after: 300 }
            }));

            // 데이터 집계
            const resultsBySystem: { [systemId: string]: { [field: string]: StatusCounts } } = {};
            if (Array.isArray(securityData)) {
                securityData.forEach((item: any) => {
                    const systemId = item.systemId;
                    if (!resultsBySystem[systemId]) resultsBySystem[systemId] = {};
                    if (!resultsBySystem[systemId][item.field]) {
                        resultsBySystem[systemId][item.field] = { 이행: 0, 부분이행: 0, 미이행: 0, 해당없음: 0 };
                    }
                    if (item.status) resultsBySystem[systemId][item.field][item.status as keyof StatusCounts]++;
                });
            }

            const sortedResultSystemIds = Object.keys(resultsBySystem).sort((a, b) => {
                const indexA = systemOrder.indexOf(a);
                const indexB = systemOrder.indexOf(b);
                return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
            });

            // 각 시스템별 차트 생성
            for (const systemId of sortedResultSystemIds) {
                const system = securitySystems.find(s => s.id === systemId);
                const systemName = system?.name || systemId;

                // 전체 합계 계산
                const allCounts = Object.values(resultsBySystem[systemId]).reduce(
                    (acc, c) => ({ 이행: acc.이행 + c.이행, 부분이행: acc.부분이행 + c.부분이행, 미이행: acc.미이행 + c.미이행, 해당없음: 0 }),
                    { 이행: 0, 부분이행: 0, 미이행: 0, 해당없음: 0 }
                );

                // 테이블 행 생성
                const tableRows: TableRow[] = [];

                // 헤더 행
                tableRows.push(new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: systemName, bold: true, color: 'FFFFFF', size: 24 })], alignment: AlignmentType.CENTER })],
                            columnSpan: 4,
                            shading: { fill: '49176d', type: ShadingType.CLEAR },
                            margins: { top: 80, bottom: 80, left: 100, right: 100 }
                        })
                    ]
                }));

                // 컬럼 헤더
                tableRows.push(new TableRow({
                    children: ['분야', '이행 현황', '건수', '이행률'].map(text =>
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20 })], alignment: AlignmentType.CENTER })],
                            shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
                            margins: { top: 60, bottom: 60, left: 60, right: 60 }
                        })
                    )
                }));

                // 각 분야별 데이터 행
                for (const [field, counts] of Object.entries(resultsBySystem[systemId])) {
                    const rate = calcRate(counts);
                    const total = counts.이행 + counts.부분이행 + counts.미이행;
                    const chartImage = await createStackedBarImage(counts);

                    const chartCell = chartImage
                        ? new TableCell({
                            children: [new Paragraph({
                                children: [new ImageRun({ data: chartImage, transformation: { width: 250, height: 22 }, type: 'png' })],
                                alignment: AlignmentType.CENTER
                            })],
                            verticalAlign: 'center',
                            margins: { top: 30, bottom: 30, left: 40, right: 40 }
                        })
                        : new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: '-', color: '999999', size: 20 })], alignment: AlignmentType.CENTER })],
                            verticalAlign: 'center'
                        });

                    tableRows.push(new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: field, size: 20 })], alignment: AlignmentType.CENTER })], verticalAlign: 'center', margins: { top: 40, bottom: 40 } }),
                            chartCell,
                            new TableCell({
                                children: [new Paragraph({
                                    children: [
                                        new TextRun({ text: `${counts.이행}`, color: '029DC3', size: 18 }), new TextRun({ text: ' / ', size: 18 }),
                                        new TextRun({ text: `${counts.부분이행}`, color: 'B8A000', size: 18 }), new TextRun({ text: ' / ', size: 18 }),
                                        new TextRun({ text: `${counts.미이행}`, color: 'E02E27', size: 18 })
                                    ],
                                    alignment: AlignmentType.CENTER
                                })],
                                verticalAlign: 'center'
                            }),
                            new TableCell({
                                children: [new Paragraph({
                                    children: [new TextRun({ text: total > 0 ? `${rate.toFixed(1)}%` : '-', bold: true, color: total > 0 ? getRateColor(rate) : '999999', size: 20 })],
                                    alignment: AlignmentType.CENTER
                                })],
                                verticalAlign: 'center'
                            })
                        ]
                    }));
                }

                // 전체 합계 행
                const totalChartImage = await createStackedBarImage(allCounts);
                const totalRate = calcRate(allCounts);

                tableRows.push(new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: '전체', bold: true, size: 20 })], alignment: AlignmentType.CENTER })],
                            shading: { fill: 'E8E8E8', type: ShadingType.CLEAR },
                            verticalAlign: 'center',
                            margins: { top: 50, bottom: 50 }
                        }),
                        totalChartImage
                            ? new TableCell({
                                children: [new Paragraph({
                                    children: [new ImageRun({ data: totalChartImage, transformation: { width: 250, height: 22 }, type: 'png' })],
                                    alignment: AlignmentType.CENTER
                                })],
                                shading: { fill: 'E8E8E8', type: ShadingType.CLEAR },
                                verticalAlign: 'center',
                                margins: { top: 30, bottom: 30, left: 40, right: 40 }
                            })
                            : new TableCell({
                                children: [new Paragraph({ children: [new TextRun({ text: '-', color: '999999' })], alignment: AlignmentType.CENTER })],
                                shading: { fill: 'E8E8E8', type: ShadingType.CLEAR }
                            }),
                        new TableCell({
                            children: [new Paragraph({
                                children: [
                                    new TextRun({ text: `${allCounts.이행}`, color: '029DC3', size: 18, bold: true }), new TextRun({ text: ' / ', size: 18 }),
                                    new TextRun({ text: `${allCounts.부분이행}`, color: 'B8A000', size: 18, bold: true }), new TextRun({ text: ' / ', size: 18 }),
                                    new TextRun({ text: `${allCounts.미이행}`, color: 'E02E27', size: 18, bold: true })
                                ],
                                alignment: AlignmentType.CENTER
                            })],
                            shading: { fill: 'E8E8E8', type: ShadingType.CLEAR },
                            verticalAlign: 'center'
                        }),
                        new TableCell({
                            children: [new Paragraph({
                                children: [new TextRun({ text: `${totalRate.toFixed(1)}%`, bold: true, color: getRateColor(totalRate), size: 22 })],
                                alignment: AlignmentType.CENTER
                            })],
                            shading: { fill: 'E8E8E8', type: ShadingType.CLEAR },
                            verticalAlign: 'center'
                        })
                    ]
                }));

                // 테이블 추가
                sections.push(new DocxTable({
                    rows: tableRows,
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    layout: TableLayoutType.FIXED,
                    columnWidths: [3900, 6400, 2700, 2000]
                }));
                sections.push(new Paragraph({ text: '', spacing: { after: 400 } }));
            }

            // Create document
            const doc = new Document({
                sections: [{
                    children: sections
                }]
            });

            // Generate and download
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

    // ===== 화면 표시 로직 =====

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

    const riskItemsBySystem: { [systemId: string]: any[] } = {};
    if (Array.isArray(securityData)) {
        securityData.forEach((item: any) => {
            if (item.status === '부분이행' || item.status === '미이행') {
                const systemId = item.systemId;
                if (!riskItemsBySystem[systemId]) {
                    riskItemsBySystem[systemId] = [];
                }
                riskItemsBySystem[systemId].push({
                    code: item.no,
                    systemName: item.systemName,
                    evidence: item.evidence || '',
                    riskFactor: item.riskFactors || ''
                });
            }
        });
    }

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

    const resultsBySystem: { [systemId: string]: { [field: string]: StatusCounts } } = {};
    if (Array.isArray(securityData)) {
        securityData.forEach((item: any) => {
            if (!resultsBySystem[item.systemId]) resultsBySystem[item.systemId] = {};
            if (!resultsBySystem[item.systemId][item.field]) {
                resultsBySystem[item.systemId][item.field] = { 이행: 0, 부분이행: 0, 미이행: 0, 해당없음: 0 };
            }
            if (item.status) resultsBySystem[item.systemId][item.field][item.status as keyof StatusCounts]++;
        });
    }

    const sortedSystemIds = Object.keys(actionPlansBySystem).sort((a, b) => {
        const indexA = systemOrder.indexOf(a);
        const indexB = systemOrder.indexOf(b);
        return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
    });

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

            {/* 1. 영향평가 기준 */}
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

            {/* 2. 침해요인 분석 표 */}
            <Card>
                <CardHeader>
                    <CardTitle>2. 평가기준에 따른 개인정보 침해요인 분석·평가</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(() => {
                        const sortedRiskSystemIds = Object.keys(riskItemsBySystem).sort((a, b) => {
                            const indexA = systemOrder.indexOf(a);
                            const indexB = systemOrder.indexOf(b);
                            return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
                        });

                        return sortedRiskSystemIds.map((systemId) => {
                            const system = securitySystems.find(s => s.id === systemId);
                            const systemName = system?.name || systemId;

                            return (
                                <div key={systemId} className="space-y-2">
                                    <p className="font-semibold">[{systemName}]</p>
                                    <div className="overflow-x-auto">
                                        <Table className="w-full">
                                            <TableHeader>
                                                <UITableRow>
                                                    <TableHead className="whitespace-nowrap">No.</TableHead>
                                                    <TableHead>취약점</TableHead>
                                                    <TableHead>침해요인</TableHead>
                                                </UITableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {riskItemsBySystem[systemId].map((r: any, i: number) => (
                                                    <UITableRow key={i}>
                                                        <UITableCell className="whitespace-nowrap align-top">{r.code}</UITableCell>
                                                        <UITableCell className="break-words align-top max-w-[400px]">{r.evidence}</UITableCell>
                                                        <UITableCell className="break-words align-top max-w-[400px]">{r.riskFactor}</UITableCell>
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

            {/* 3. 개선 조치 계획 */}
            <Card>
                <CardHeader>
                    <CardTitle>3. 주요 위험요소에 따른 개선 조치 계획</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {sortedSystemIds.map((systemId) => {
                        const system = securitySystems.find(s => s.id === systemId);
                        const systemName = system?.name || systemId;

                        return (
                            <div key={systemId} className="space-y-2">
                                <p className="font-semibold">[{systemName}]</p>
                                <div className="overflow-x-auto">
                                    <Table className="w-full">
                                        <TableHeader>
                                            <UITableRow>
                                                <TableHead className="whitespace-nowrap">No.</TableHead>
                                                <TableHead>질의문</TableHead>
                                                <TableHead>취약점</TableHead>
                                                <TableHead>조치 방안</TableHead>
                                                <TableHead className="whitespace-nowrap">조치 기간</TableHead>
                                                <TableHead className="whitespace-nowrap">부서</TableHead>
                                                <TableHead className="whitespace-nowrap">담당자</TableHead>
                                                <TableHead className="whitespace-nowrap">조치 일시</TableHead>
                                            </UITableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {actionPlansBySystem[systemId]?.map((plan, idx) => (
                                                <UITableRow key={idx}>
                                                    <UITableCell className="whitespace-nowrap align-top">{plan.code}</UITableCell>
                                                    <UITableCell className="break-words align-top max-w-[300px]">{plan.question}</UITableCell>
                                                    <UITableCell className="break-words align-top max-w-[300px]">{plan.evidence}</UITableCell>
                                                    <UITableCell className="break-words align-top max-w-[300px]">{plan.actionPlan}</UITableCell>
                                                    <UITableCell className="whitespace-nowrap align-top">{plan.actionPeriod}</UITableCell>
                                                    <UITableCell className="whitespace-nowrap align-top">{plan.department}</UITableCell>
                                                    <UITableCell className="whitespace-nowrap align-top">{plan.manager}</UITableCell>
                                                    <UITableCell className="whitespace-nowrap align-top">{plan.actionDate}</UITableCell>
                                                </UITableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {/* 4. 평가결과 */}
            <Card>
                <CardHeader>
                    <CardTitle>4. 평가결과</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
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
                                <div key={systemId} className="bg-white rounded-lg shadow p-4">
                                    {/* 시스템명 */}
                                    <h4 className="font-semibold text-blue-700 mb-3">[{systemName}]</h4>

                                    {/* 각 분야별 바 */}
                                    <div className="space-y-3">
                                        {Object.entries(resultsBySystem[systemId]).map(([field, counts]) => {
                                            const total = counts.이행 + counts.부분이행 + counts.미이행;
                                            const rate = total > 0 ? ((counts.이행 + counts.부분이행 * 0.5) / total * 100) : 0;

                                            if (total === 0) {
                                                return (
                                                    <div key={field} className="flex items-center gap-3">
                                                        <span className="w-48 text-sm text-gray-600">{field}</span>
                                                        <span className="text-sm text-gray-400">-</span>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div key={field} className="flex items-center gap-3">
                                                    <span className="w-48 text-sm font-medium text-gray-700">{field}</span>
                                                    <div className="flex-1 h-8 flex rounded-lg overflow-hidden shadow-inner">
                                                        {counts.이행 > 0 && (
                                                            <div
                                                                className="flex items-center justify-center text-sm text-white font-medium"
                                                                style={{
                                                                    width: `${(counts.이행 / total) * 100}%`,
                                                                    backgroundColor: '#029DC3'
                                                                }}
                                                            >
                                                                {counts.이행}
                                                            </div>
                                                        )}
                                                        {counts.부분이행 > 0 && (
                                                            <div
                                                                className="flex items-center justify-center text-sm text-gray-800 font-medium"
                                                                style={{
                                                                    width: `${(counts.부분이행 / total) * 100}%`,
                                                                    backgroundColor: '#EFCE1C'
                                                                }}
                                                            >
                                                                {counts.부분이행}
                                                            </div>
                                                        )}
                                                        {counts.미이행 > 0 && (
                                                            <div
                                                                className="flex items-center justify-center text-sm text-white font-medium"
                                                                style={{
                                                                    width: `${(counts.미이행 / total) * 100}%`,
                                                                    backgroundColor: '#E02E27'
                                                                }}
                                                            >
                                                                {counts.미이행}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span
                                                        className="w-16 text-right text-sm font-bold"
                                                        style={{
                                                            color: rate >= 80 ? '#029DC3' : rate >= 50 ? '#B8A000' : '#E02E27'
                                                        }}
                                                    >
                                                        {rate.toFixed(1)}%
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* 범례 */}
                                    <div className="flex gap-4 mt-4 pt-3 border-t text-xs">
                                        <span className="flex items-center gap-1">
                                            <span className="w-3 h-3 rounded" style={{ backgroundColor: '#029DC3' }}></span> 이행
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-3 h-3 rounded" style={{ backgroundColor: '#EFCE1C' }}></span> 부분이행
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-3 h-3 rounded" style={{ backgroundColor: '#E02E27' }}></span> 미이행
                                        </span>
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </CardContent>
            </Card>
        </div>
    );
}