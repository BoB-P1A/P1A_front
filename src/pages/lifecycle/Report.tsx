import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { Document, Packer, Paragraph, Table as DocxTable, TableCell, TableRow, TextRun, WidthType, AlignmentType, HeadingLevel, ImageRun, TableLayoutType, ShadingType } from 'docx';
import { Table as UITable, TableBody as UITableBody, TableCell as UITableCell, TableHead as UITableHead, TableHeader as UITableHeader, TableRow as UITableRow } from '@/components/ui/table';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

// 타입 정의 추가
interface StatusCounts {
    이행: number;
    부분이행: number;
    미이행: number;
    해당없음: number;
}

export default function LifecycleReport() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<{ id: string; name: string }[]>([]);
    const [taskTableData, setTaskTableData] = useState<any[]>([]);
    const [flowTableData, setFlowTableData] = useState<any>({});
    const [lifecycleData, setLifecycleData] = useState<any[]>([]);
    const [improvements, setImprovements] = useState<any>({});
    const [flowChartImages, setFlowChartImages] = useState<Record<string, string>>({});

    // Hook을 컴포넌트 최상위로 이동
    const [actionPlansData, setActionPlansData] = useState<any>({});

    // 데이터 로딩 (taskId 기반)
    useEffect(() => {
        const loadData = async () => {
            if (!user?.companyId) return;

            try {
                const [tasksResponse, flowTables, lifecycle, improvementsData] = await Promise.all([
                    // 기존: api.lifecycle.tasks.getAll(user.companyId)
                    // 수정: 처리업무표 전용 API 사용
                    api.tasks.getAll(user.companyId),  // TaskTable.tsx와 동일한 API 사용
                    api.lifecycle.flowTables.getAll(user.companyId).catch(err => {
                        console.warn('flowTables API failed:', err);
                        return {};
                    }),
                    api.lifecycle.checklists.getAll({ companyId: user.companyId }).catch(err => {
                        console.warn('checklists API failed:', err);
                        return [];
                    }),
                    api.lifecycle.improvements.getAll(user.companyId).catch(err => {
                        console.warn('improvements API failed:', err);
                        return {};
                    }),
                ]);

                // tasks 매핑 (ObjectId 기반)
                const mappedTasks = Array.isArray(tasksResponse)
                    ? tasksResponse.map((t: any) => ({
                        id: t.id || t._id,        // ObjectId (_id도 지원)
                        name: t.taskName // 표시용
                    }))
                    : [];

                setTasks(mappedTasks);

                // taskTableData 정규화: DB 필드명을 올바르게 매핑
                const normalizedTaskTable = Array.isArray(tasksResponse)
                    ? tasksResponse.map((task: any) => ({
                        id: task.id || task._id,
                        taskName: task.taskName || '',
                        purpose: task.purpose || '',
                        infomation: task.infomation || '',  // DB 필드명 그대로
                        department: task.department || '',
                        companyId: task.companyId || user.companyId
                    }))
                    : [];

                setTaskTableData(normalizedTaskTable);

                // flowTableData 구조 확인 및 정규화
                console.log('flowTables response:', flowTables);

                // flowTableData를 프론트엔드 필드명으로 변환
                const normalizedFlowTables: any = {};
                Object.keys(flowTables).forEach(taskId => {
                    const taskData = flowTables[taskId];
                    const sheets = taskData?.sheets || taskData;

                    if (sheets) {
                        normalizedFlowTables[taskId] = {
                            sheets: {
                                // DB 필드명 -> 프론트엔드 필드명 변환
                                collection: (sheets.collect || []).map((item: any) => ({
                                    detailTask: item.collect_task || '',
                                    collectionTarget: item.collect_target || '',
                                    collectionPath: item.collect_route || '',
                                    collectionSystem: item.collect_system || '',
                                    collectionItem: item.collect_items || '',
                                    collectionItemName: item.collect_bundle || '',
                                    collectionPurpose: item.collect_purpose || '',
                                    collectionDepartment: item.collect_dept || '',
                                    isOnline: item.collect_online === true ? 'True' : item.collect_online === false ? 'False' : '',
                                    isEncrypted: item.collect_encrypt === true ? 'True' : item.collect_encrypt === false ? 'False' : item.collect_encrypt === null ? 'Unknown' : ''
                                })),
                                storage: (sheets.retain || []).map((item: any) => ({
                                    detailTask: item.retain_task || '',
                                    storageSpace: item.retain_space || '',
                                    collectionSystem: item.retain_input_system || '',
                                    storageItem: item.retain_items || '',
                                    storageItemName: item.retain_bundle || '',
                                    storagePurpose: item.retain_purpose || '',
                                    storageFormat: item.retain_form || '',
                                    encryptionItem: item.retain_enc_items || '',
                                    isOnline: item.retain_online === true ? 'True' : item.retain_online === false ? 'False' : '',
                                    isEncrypted: item.retain_encrypt === true ? 'True' : item.retain_encrypt === false ? 'False' : item.retain_encrypt === null ? 'Unknown' : ''
                                })),
                                usage: (sheets.use || []).map((item: any) => ({
                                    detailTask: item.use_task || '',
                                    storageSpace: item.use_space || '',
                                    usageSystem: item.use_system || '',
                                    usageItem: item.use_items || '',
                                    usageItemName: item.use_bundle || '',
                                    usagePurpose: item.use_purpose || '',
                                    usageMethod: item.use_method || '',
                                    usageDepartment: item.use_dept || '',
                                    isOnline: item.use_online === true ? 'True' : item.use_online === false ? 'False' : '',
                                    isEncrypted: item.use_encrypt === true ? 'True' : item.use_encrypt === false ? 'False' : item.use_encrypt === null ? 'Unknown' : ''
                                })),
                                provision: (sheets.provide || []).map((item: any) => ({
                                    detailTask: item.provide_task || '',
                                    storageSpace: item.provide_space || '',
                                    linkageSystem: item.provide_system || '',
                                    provisionDepartment: item.provide_dept || '',
                                    recipient: item.receiver || '',
                                    provisionItem: item.provide_items || '',
                                    provisionItemName: item.provide_bundle || '',
                                    provisionPurpose: item.provide_purpose || '',
                                    provisionMethod: item.provide_method || '',
                                    linkageSystemOnline: item.provide_sys_online === true ? 'True' : item.provide_sys_online === false ? 'False' : '',
                                    linkageSystemEncrypted: item.provide_sys_encrypt === true ? 'True' : item.provide_sys_encrypt === false ? 'False' : item.provide_sys_encrypt === null ? 'Unknown' : '',
                                    recipientOnline: item.receiver_online === true ? 'True' : item.receiver_online === false ? 'False' : '',
                                    recipientEncrypted: item.receiver_encrypt === true ? 'True' : item.receiver_encrypt === false ? 'False' : item.receiver_encrypt === null ? 'Unknown' : ''
                                })),
                                disposal: (sheets.discard || []).map((item: any) => ({
                                    detailTask: item.discard_task || '',
                                    storageSpace: item.discard_space || '',
                                    disposalSystem: item.discard_system || '',
                                    disposalItem: item.discard_items || '',
                                    disposalItemName: item.discard_bundle || '',
                                    retentionPeriod: item.discard_period || '',
                                    disposalDepartment: item.discard_dept || '',
                                    disposalProcedure: item.discard_proc || '',
                                    disposalOnline: item.discard_online === true ? 'True' : item.discard_online === false ? 'False' : ''
                                }))
                            }
                        };
                    }
                });

                setFlowTableData(normalizedFlowTables);

                setLifecycleData(Array.isArray(lifecycle) ? lifecycle : []);
                setImprovements(improvementsData || {});

                // S3에서 각 task의 흐름도 이미지 로드
                await loadFlowChartImages(user.companyId, mappedTasks);
            } catch (error) {
                console.error('Failed to load data:', error);
                setTasks([]);
                setTaskTableData([]);
                setFlowTableData({});
                setLifecycleData([]);
                setImprovements({});
                setFlowChartImages({});
            }
        };

        loadData();
    }, [user?.companyId]);

    // S3에서 흐름도 이미지 로드
    const loadFlowChartImages = async (companyId: string, tasksList: { id: string; name: string }[]) => {
        try {
            console.log('🔍 Loading flowchart images for company:', companyId);

            // API 호출로 S3 이미지 목록 가져오기
            const flowChartData = await api.lifecycle.flowCharts.getAll(companyId);
            console.log('📦 FlowChart data received:', flowChartData);

            // flowChartData 구조: { taskId: { fileName: string, imageUrl: string } }
            const imageMap: Record<string, string> = {};

            for (const task of tasksList) {
                const taskFlowData = flowChartData[task.id];

                if (taskFlowData?.imageUrl) {
                    // ✅ S3에서 가져온 Pre-signed URL 사용
                    imageMap[task.id] = taskFlowData.imageUrl;
                    console.log(`✅ Image found for ${task.name}: ${taskFlowData.fileName}`);
                } else {
                    console.warn(`⚠️ No image found for task ${task.name} (${task.id})`);
                }
            }

            setFlowChartImages(imageMap);
            console.log('✅ Total loaded images:', Object.keys(imageMap).length);
        } catch (error) {
            console.error('❌ Failed to load flowchart images:', error);
            setFlowChartImages({});
        }
    };

    // actionPlans 로딩을 별도 useEffect로 분리
    useEffect(() => {
        const loadActionPlans = async () => {
            if (!user?.companyId) return;
            try {
                const data = await api.lifecycle.actionPlans.getAll(user.companyId);
                setActionPlansData(data);
            } catch (error) {
                console.error('Failed to load action plans:', error);
            }
        };
        loadActionPlans();
    }, [user?.companyId]);

    const handleDownload = async () => {
        try {
            // 단어 끊김 방지 + 검은색 + 기울임 없음
            const createCell = (text: string) => new TableCell({
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: text || '',
                                italics: false,
                                color: "000000"
                            })
                        ],
                        wordWrap: true
                    })
                ]
            });

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

            const createHeading3 = (text: string) => new Paragraph({
                children: [
                    new TextRun({
                        text: text,
                        bold: true,
                        size: 24,  // 12pt
                        color: "000000"
                    })
                ],
                spacing: { before: 200, after: 100 }
            });

            const createHeading4 = (text: string) => new Paragraph({
                children: [
                    new TextRun({
                        text: text,
                        bold: true,
                        size: 22,  // 11pt
                        color: "000000"
                    })
                ],
                spacing: { before: 200, after: 100 }
            });

            const createTaskHeader = (text: string) => new Paragraph({
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

            const createPhaseHeader = (text: string) => new Paragraph({
                children: [
                    new TextRun({
                        text: text,
                        bold: true,
                        size: 20,  // 10pt
                        color: "000000"
                    })
                ],
                spacing: { before: 200, after: 100 }
            });

            const createText = (text: string) => new Paragraph({
                children: [
                    new TextRun({
                        text: text,
                        color: "000000"
                    })
                ]
            });

            const sections = [];

            // Title
            sections.push(createTitle('개인정보 처리단계별 보호조치 결과보고서'));

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

            // 테이블 헤더 셀 (배경색 있음)
            const createTableHeaderCell = (text: string) => new TableCell({
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
                margins: {
                    top: 40,
                    bottom: 40,
                    left: 60,
                    right: 60
                }
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
                margins: {
                    top: 40,
                    bottom: 40,
                    left: 60,
                    right: 60
                }
            });

            // 처리업무명 셀 (최상단 타이틀용)
            const createTaskNameCellWhite = (text: string) => new TableCell({
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
                margins: {
                    top: 50,
                    bottom: 50,
                    left: 60,
                    right: 60
                }
            });

            // 1. 개인정보 처리 흐름분석
            sections.push(createHeading2('1. 개인정보 처리 흐름분석'));

            // 1.1 처리업무표
            sections.push(createHeading3('1.1 개인정보 처리 업무표'));

            if (taskTableData.length > 0) {
                const taskTableRows = [
                    new TableRow({
                        children: [
                            createTableHeaderCell('평가업무명'),
                            createTableHeaderCell('처리 목적'),
                            createTableHeaderCell('처리 개인정보'),
                            createTableHeaderCell('주관부서'),
                        ]
                    }),
                    ...taskTableData.map((task: any) => new TableRow({
                        children: [
                            createCell(task.taskName),
                            createCell(task.purpose),
                            createCell(task.infomation || task.personalInfo),
                            createCell(task.department),
                        ]
                    }))
                ];
                sections.push(new DocxTable({
                    rows: taskTableRows,
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    layout: TableLayoutType.FIXED,
                    columnWidths: [3000, 4500, 7500, 3000]  // 4열: 평가업무명, 처리목적, 처리개인정보, 주관부서
                }));
            }

            // 1.2 개인정보 흐름표
            sections.push(createHeading3('1.2 개인정보 흐름표'));

            const phases = ['수집', '보유', '이용', '제공', '파기'];
            const phaseKeyMap: Record<string, string> = {
                수집: 'collection',
                보유: 'storage',
                이용: 'usage',
                제공: 'provision',
                파기: 'disposal'
            };

            // 단계명 셀 (하늘색 배경, 5열 병합)
            const createPhaseCell5Col = (text: string) => new TableCell({
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
                columnSpan: 5,
                shading: { fill: "EAE3F9" },
                margins: {
                    top: 40,
                    bottom: 40,
                    left: 60,
                    right: 60
                }
            });

            // 세부업무명 값 셀 (좌측 세로 열, rowSpan 지원)
            const createDetailTaskCell = (text: string, rowSpan: number) => new TableCell({
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
                rowSpan: rowSpan,
                width: { size: 15, type: WidthType.PERCENTAGE },
                shading: { fill: "F2F2F2" },
                verticalAlign: 'center',
                margins: {
                    top: 40,
                    bottom: 40,
                    left: 60,
                    right: 60
                }
            });

            // 흐름표 라벨 셀 (회색 배경)
            const createFlowLabelCell = (text: string) => new TableCell({
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
                width: { size: 12, type: WidthType.PERCENTAGE },
                shading: { fill: "F2F2F2" },
                margins: {
                    top: 40,
                    bottom: 40,
                    left: 60,
                    right: 60
                }
            });

            // 흐름표 값 셀 (3열 병합 - 단일 필드용)
            const createFlowValueCell3Span = (text: string) => new TableCell({
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: text || '',
                                color: "000000"
                            })
                        ],
                        wordWrap: true
                    })
                ],
                columnSpan: 3,
                width: { size: 73, type: WidthType.PERCENTAGE },
                margins: {
                    top: 40,
                    bottom: 40,
                    left: 60,
                    right: 60
                }
            });

            // 흐름표 값 셀 (병합 필드용 - 1열)
            const createFlowValueCellSmall = (text: string) => new TableCell({
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: text || '',
                                color: "000000"
                            })
                        ],
                        wordWrap: true
                    })
                ],
                width: { size: 24, type: WidthType.PERCENTAGE },
                margins: {
                    top: 40,
                    bottom: 40,
                    left: 60,
                    right: 60
                }
            });

            // 평가업무명 셀 (5열 병합)
            const createTaskNameCell5Col = (text: string) => new TableCell({
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
                columnSpan: 5,
                shading: { fill: "49176d" },
                margins: {
                    top: 50,
                    bottom: 50,
                    left: 60,
                    right: 60
                }
            });

            // 단계별 필드 정의 - 배열이면 한 행에 2개 필드
            type FieldDef = { label: string; key: string };
            type PhaseField = FieldDef | [FieldDef, FieldDef];
            const phaseFields: Record<string, PhaseField[]> = {
                수집: [
                    { label: '수집대상', key: 'collectionTarget' },
                    { label: '수집경로', key: 'collectionPath' },
                    { label: '수집시스템', key: 'collectionSystem' },
                    { label: '수집항목', key: 'collectionItem' },
                    { label: '수집항목명칭', key: 'collectionItemName' },
                    { label: '수집목적', key: 'collectionPurpose' },
                    { label: '수집부서', key: 'collectionDepartment' },
                    [{ label: '온라인', key: 'isOnline' }, { label: '암호화', key: 'isEncrypted' }],
                ],
                보유: [
                    { label: '보유공간', key: 'storageSpace' },
                    { label: '수집시스템', key: 'collectionSystem' },
                    { label: '보유항목', key: 'storageItem' },
                    { label: '보유항목명칭', key: 'storageItemName' },
                    { label: '보유목적', key: 'storagePurpose' },
                    { label: '보유형태', key: 'storageFormat' },
                    { label: '암호화항목', key: 'encryptionItem' },
                    [{ label: '온라인', key: 'isOnline' }, { label: '암호화', key: 'isEncrypted' }],
                ],
                이용: [
                    { label: '보유공간', key: 'storageSpace' },
                    { label: '이용시스템', key: 'usageSystem' },
                    { label: '이용항목', key: 'usageItem' },
                    { label: '이용항목명칭', key: 'usageItemName' },
                    { label: '이용목적', key: 'usagePurpose' },
                    { label: '이용방법', key: 'usageMethod' },
                    { label: '이용부서', key: 'usageDepartment' },
                    [{ label: '온라인', key: 'isOnline' }, { label: '암호화', key: 'isEncrypted' }],
                ],
                제공: [
                    { label: '보유공간', key: 'storageSpace' },
                    { label: '연계시스템', key: 'linkageSystem' },
                    { label: '제공부서', key: 'provisionDepartment' },
                    { label: '수신자', key: 'recipient' },
                    { label: '제공항목', key: 'provisionItem' },
                    { label: '제공항목명칭', key: 'provisionItemName' },
                    { label: '제공목적', key: 'provisionPurpose' },
                    { label: '제공방법', key: 'provisionMethod' },
                    [{ label: '연계시스템 온라인', key: 'linkageSystemOnline' }, { label: '연계시스템 암호화', key: 'linkageSystemEncrypted' }],
                    [{ label: '수신자 온라인', key: 'recipientOnline' }, { label: '수신자 암호화', key: 'recipientEncrypted' }],
                ],
                파기: [
                    { label: '보유공간', key: 'storageSpace' },
                    { label: '파기시스템', key: 'disposalSystem' },
                    { label: '파기항목', key: 'disposalItem' },
                    { label: '파기항목명칭', key: 'disposalItemName' },
                    { label: '보관기간', key: 'retentionPeriod' },
                    { label: '파기부서', key: 'disposalDepartment' },
                    { label: '파기절차', key: 'disposalProcedure' },
                    { label: '온라인', key: 'disposalOnline' },
                ],
            };

            tasks.forEach(task => {
                const taskId = task.id;
                const taskName = task.name;
                const taskData = flowTableData[taskId];
                const sheets = taskData?.sheets || taskData;

                if (!sheets) {
                    // 흐름표가 없는 경우 메시지 표시
                    sections.push(createTaskHeader(`[${taskName}]`));
                    sections.push(new Paragraph({
                        children: [
                            new TextRun({
                                text: '흐름표가 없습니다.',
                                color: "666666"
                            })
                        ],
                        spacing: { after: 300 }
                    }));
                    return;
                }

                // 모든 단계에 데이터가 있는지 확인
                const hasAnyData = phases.some(phase => {
                    const key = phaseKeyMap[phase];
                    const rows = sheets[key] || [];
                    return rows.length > 0;
                });

                if (!hasAnyData) {
                    sections.push(createTaskHeader(`[${taskName}]`));
                    sections.push(new Paragraph({
                        children: [
                            new TextRun({
                                text: '흐름표가 없습니다.',
                                color: "666666"
                            })
                        ],
                        spacing: { after: 300 }
                    }));
                    return;
                }


                // 모든 행을 하나의 배열에 모음
                const allFlowRows: TableRow[] = [];

                // 최상단: 평가업무명 행 (5열 병합)
                allFlowRows.push(new TableRow({
                    children: [
                        createTaskNameCell5Col(taskName)
                    ]
                }));

                // 각 단계별 데이터 추가
                phases.forEach(phase => {
                    const key = phaseKeyMap[phase];
                    const rows = sheets[key] || [];
                    const fields = phaseFields[phase];

                    if (rows.length === 0) return;

                    // 단계명 행 (하늘색 배경, 5열 병합) - 한 번만 표시
                    allFlowRows.push(new TableRow({
                        children: [
                            createPhaseCell5Col(phase)
                        ]
                    }));

                    // 각 데이터별로 세부업무명을 좌측 세로 열로
                    rows.forEach((row: any) => {
                        const detailTaskName = row.detailTask || '';
                        const fieldCount = fields.length; // rowSpan 크기

                        // 각 필드별 행 생성
                        fields.forEach((field, i) => {
                            if (Array.isArray(field)) {
                                // 병합 필드: 한 행에 2개의 라벨-값 쌍 (5열)
                                if (i === 0) {
                                    allFlowRows.push(new TableRow({
                                        children: [
                                            createDetailTaskCell(detailTaskName, fieldCount),
                                            createFlowLabelCell(field[0].label),
                                            createFlowValueCellSmall(row[field[0].key] || ''),
                                            createFlowLabelCell(field[1].label),
                                            createFlowValueCellSmall(row[field[1].key] || '')
                                        ]
                                    }));
                                } else {
                                    allFlowRows.push(new TableRow({
                                        children: [
                                            createFlowLabelCell(field[0].label),
                                            createFlowValueCellSmall(row[field[0].key] || ''),
                                            createFlowLabelCell(field[1].label),
                                            createFlowValueCellSmall(row[field[1].key] || '')
                                        ]
                                    }));
                                }
                            } else {
                                // 단일 필드: 값 셀이 3열 병합 (총 5열)
                                if (i === 0) {
                                    allFlowRows.push(new TableRow({
                                        children: [
                                            createDetailTaskCell(detailTaskName, fieldCount),
                                            createFlowLabelCell(field.label),
                                            createFlowValueCell3Span(row[field.key] || '')
                                        ]
                                    }));
                                } else {
                                    allFlowRows.push(new TableRow({
                                        children: [
                                            createFlowLabelCell(field.label),
                                            createFlowValueCell3Span(row[field.key] || '')
                                        ]
                                    }));
                                }
                            }
                        });
                    });
                });

                // 평가업무별로 하나의 테이블 생성
                const flowTable = new DocxTable({
                    rows: allFlowRows,
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    layout: TableLayoutType.FIXED,
                    columnWidths: [2700, 2160, 4320, 2160, 6660]  // 5열: 세부업무명, 라벨, 값, 라벨, 값
                });

                sections.push(flowTable);

                // 평가업무 테이블 간 간격
                sections.push(new Paragraph({ text: '', spacing: { after: 300 } }));
            });

            // 1.3 개인정보 흐름도
            sections.push(createHeading3('1.3 개인정보 흐름도'));

            // tasks 순서대로 이미지 삽입
            for (const task of tasks) {
                const imageUrl = flowChartImages[task.id];

                sections.push(createHeading4(`${task.name} 흐름도`));

                if (imageUrl) {
                    try {
                        console.log(`📥 Downloading image for task: ${task.name} (${task.id})`);
                        console.log(`📎 Image URL: ${imageUrl}`);

                        // imageUrl에서 fileName 추출
                        const urlParts = imageUrl.split('/');
                        const fileNameWithQuery = urlParts[urlParts.length - 1];
                        const encodedFileName = fileNameWithQuery.split('?')[0]; // 쿼리 파라미터 제거

                        // URL 디코딩 추가
                        const fileName = decodeURIComponent(encodedFileName);

                        console.log(`Encoded fileName: ${encodedFileName}`);
                        console.log(`Decoded fileName: ${fileName}`);

                        // 백엔드 API로 이미지 바이너리 다운로드
                        const arrayBuffer = await api.lifecycle.flowCharts.getImageBytes(
                            user!.companyId,
                            task.id,
                            fileName  // 디코딩된 파일명: "민원처리.png"
                        );

                        const imageBuffer = new Uint8Array(arrayBuffer);
                        console.log(`Image downloaded: ${imageBuffer.length} bytes`);

                        // 이미지 실제 크기 확인을 위해 Image 객체 생성
                        const blob = new Blob([imageBuffer]);
                        const imageObjectUrl = URL.createObjectURL(blob);

                        // Promise로 이미지 로드 완료 대기
                        const imgDimensions = await new Promise<{ width: number; height: number }>((resolve) => {
                            const img = new Image();
                            img.onload = () => {
                                resolve({ width: img.width, height: img.height });
                                URL.revokeObjectURL(imageObjectUrl);
                            };
                            img.onerror = () => {
                                resolve({ width: 800, height: 600 }); // 기본값
                                URL.revokeObjectURL(imageObjectUrl);
                            };
                            img.src = imageObjectUrl;
                        });

                        console.log(`Original image size: ${imgDimensions.width}x${imgDimensions.height}`);

                        // Word 문서 페이지 크기 제약 (A4 기준, 단위: 픽셀)
                        // A4 크기: 210mm x 297mm
                        // 여백을 고려한 실제 사용 가능 영역
                        const MAX_WIDTH = 600;   // 가로 최대 너비
                        const MAX_HEIGHT = 900;  // 세로 최대 높이 (약 1페이지)

                        // 원본 비율 유지하면서 최대 크기 계산
                        const widthRatio = MAX_WIDTH / imgDimensions.width;
                        const heightRatio = MAX_HEIGHT / imgDimensions.height;

                        // 두 비율 중 작은 값을 선택 (페이지를 벗어나지 않도록)
                        const scale = Math.min(widthRatio, heightRatio, 1); // 1보다 크지 않도록 제한

                        const finalWidth = Math.round(imgDimensions.width * scale);
                        const finalHeight = Math.round(imgDimensions.height * scale);

                        console.log(`Scaled image size: ${finalWidth}x${finalHeight} (scale: ${scale.toFixed(2)})`);

                        // 파일 확장자 확인
                        const fileExtension = fileName.toLowerCase().split('.').pop() || 'png';
                        const imageType = fileExtension === 'jpg' || fileExtension === 'jpeg' ? 'jpg' : 'png';

                        sections.push(
                            new Paragraph({
                                children: [
                                    new ImageRun({
                                        data: imageBuffer,
                                        transformation: {
                                            width: finalWidth,
                                            height: finalHeight,
                                        },
                                        type: imageType,
                                    } as any)
                                ],
                                spacing: { after: 200 }
                            })
                        );
                    } catch (error) {
                        console.error(`Error adding image for task ${task.name}:`, error);

                        if (error instanceof Error) {
                            console.error(`Error details: ${error.message}`);
                        }

                        sections.push(
                            new Paragraph({
                                text: `흐름도 이미지를 불러올 수 없습니다.`,
                                spacing: { after: 200 }
                            })
                        );
                    }
                } else {
                    console.warn(`No image URL for task ${task.name}`);
                    sections.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: '흐름도 이미지가 없습니다.',
                                    color: "000000"
                                })
                            ],
                            spacing: { after: 200 }
                        })
                    );
                }
            }

            // 2. 영향평가 기준
            sections.push(createHeading2('2. 영향평가 기준'));

            // taskId 기반으로 그룹화
            const criteriaByTask: { [taskId: string]: { [subField: string]: string[] } } = {};
            if (Array.isArray(lifecycleData)) {
                lifecycleData.forEach((item: any) => {
                    if (item.status !== '해당없음') {
                        const taskId = item.taskId;
                        if (!criteriaByTask[taskId]) criteriaByTask[taskId] = {};
                        if (!criteriaByTask[taskId][item.subField]) {
                            criteriaByTask[taskId][item.subField] = [];
                        }
                        criteriaByTask[taskId][item.subField].push(item.no);
                    }
                });
            }

            // tasks 순서로 정렬
            const taskOrder = tasks.map(t => t.id);
            const sortedTaskIds = Object.keys(criteriaByTask).sort((a, b) => {
                const indexA = taskOrder.indexOf(a);
                const indexB = taskOrder.indexOf(b);
                return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
            });

            sortedTaskIds.forEach(taskId => {
                const task = tasks.find(t => t.id === taskId);
                const taskName = task?.name || taskId;

                sections.push(createTaskHeader(`[${taskName}]`));
                Object.keys(criteriaByTask[taskId]).forEach(subField => {
                    const nos = criteriaByTask[taskId][subField].join(', ');
                    sections.push(createText(`- ${subField} (${nos})`));
                });
            });

            // 3. 평가기준에 따른 개인정보 침해요인 분석･평가
            sections.push(createHeading2('3. 평가기준에 따른 개인정보 침해요인 분석･평가'));

            const riskItemsByTaskDocx: { [taskId: string]: any[] } = {};
            if (Array.isArray(lifecycleData)) {
                lifecycleData.forEach((item: any) => {
                    if (item.status === '부분이행' || item.status === '미이행') {
                        const taskId = item.taskId;
                        if (!riskItemsByTaskDocx[taskId]) {
                            riskItemsByTaskDocx[taskId] = [];
                        }
                        riskItemsByTaskDocx[taskId].push({
                            code: item.no,
                            evidence: item.evidence || '',
                            riskFactor: item.riskFactors || ''
                        });
                    }
                });
            }

            const sortedRiskTaskIdsDocx = Object.keys(riskItemsByTaskDocx).sort((a, b) => {
                const indexA = taskOrder.indexOf(a);
                const indexB = taskOrder.indexOf(b);
                return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
            });

            sortedRiskTaskIdsDocx.forEach(taskId => {
                const task = tasks.find(t => t.id === taskId);
                const taskName = task?.name || taskId;

                // 모든 행을 하나의 배열에 모음
                const allRiskRows: TableRow[] = [];

                // 최상단: 처리업무명 행
                allRiskRows.push(new TableRow({
                    children: [
                        createTaskNameCellWhite(taskName)
                    ]
                }));

                // 각 항목의 행들을 연속으로 추가
                riskItemsByTaskDocx[taskId].forEach((item) => {
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

                // 처리업무별로 하나의 테이블 생성
                const riskTable = new DocxTable({
                    rows: allRiskRows,
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    layout: TableLayoutType.FIXED,
                    columnWidths: [2500, 15500]  // 2열: 라벨 10%, 내용 90%
                });

                sections.push(riskTable);

                // 처리업무 테이블 간 간격
                sections.push(new Paragraph({ text: '', spacing: { after: 300 } }));
            });

            // 4. 주요 위험요소에 따른 개선 조치 계획
            sections.push(createHeading2('4. 주요 위험요소에 따른 개선 조치 계획'));

            // lifecycleData 기반으로 생성
            const actionPlansByTaskDocx2: { [taskId: string]: any[] } = {};

            if (Array.isArray(lifecycleData)) {
                lifecycleData.forEach((item: any) => {
                    if (item.status === '부분이행' || item.status === '미이행') {
                        const taskId = item.taskId;
                        if (!actionPlansByTaskDocx2[taskId]) {
                            actionPlansByTaskDocx2[taskId] = [];
                        }
                        actionPlansByTaskDocx2[taskId].push({
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
                if (plan && plan.taskId && actionPlansByTaskDocx2[plan.taskId]) {
                    const targetItem = actionPlansByTaskDocx2[plan.taskId].find(
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

            // Sort by tasks order
            const sortedActionTaskIds = Object.keys(actionPlansByTaskDocx2).sort((a, b) => {
                const indexA = taskOrder.indexOf(a);
                const indexB = taskOrder.indexOf(b);
                return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
            });

            sortedActionTaskIds.forEach(taskId => {
                const task = tasks.find(t => t.id === taskId);
                const taskName = task?.name || taskId;

                const allRows: TableRow[] = [];

                // 4열 테이블용 셀 함수들 (DXA 단위로 너비 고정)
                const COL_WIDTH_LABEL = 2500;
                const COL_WIDTH_CONTENT = 6500;

                const createTaskNameCell4 = (text: string) => new TableCell({
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

                // 최상단: 처리업무명 행 (4열 병합)
                allRows.push(new TableRow({
                    children: [
                        createTaskNameCell4(taskName)
                    ]
                }));

                // 각 plan의 행들을 연속으로 추가
                actionPlansByTaskDocx2[taskId].forEach((plan, index) => {
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

                // 처리업무별로 하나의 테이블 생성 (레이아웃 고정)
                const taskTable = new DocxTable({
                    rows: allRows,
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    layout: TableLayoutType.FIXED,  // 열 너비 고정
                    columnWidths: [2500, 6500, 2500, 6500]  // 4열 너비 (DXA 단위, 총 18000 ≈ A4)
                });

                sections.push(taskTable);

                // 처리업무 테이블 간 간격
                sections.push(new Paragraph({ text: '', spacing: { after: 300 } }));
            });

            // 색상 정의
            const COLORS = { 이행: '#029DC3', 부분이행: '#EFCE1C', 미이행: '#E02E27' };

            // 스택드 바 차트를 이미지로 생성
            const createStackedBarImage = async (counts: StatusCounts, width = 400, height = 28): Promise<Uint8Array | null> => {
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
                segments.forEach((seg, i) => {
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

            // 5. 평가결과
            sections.push(createHeading2('5. 평가결과'));

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
            const resultsByTask: { [taskId: string]: { [field: string]: StatusCounts } } = {};
            if (Array.isArray(lifecycleData)) {
                lifecycleData.forEach((item: any) => {
                    const taskId = item.taskId;
                    if (!resultsByTask[taskId]) resultsByTask[taskId] = {};
                    if (!resultsByTask[taskId][item.field]) {
                        resultsByTask[taskId][item.field] = { 이행: 0, 부분이행: 0, 미이행: 0, 해당없음: 0 };
                    }
                    if (item.status) resultsByTask[taskId][item.field][item.status as keyof StatusCounts]++;
                });
            }

            const sortedResultTaskIds = Object.keys(resultsByTask).sort((a, b) => {
                const indexA = taskOrder.indexOf(a);
                const indexB = taskOrder.indexOf(b);
                return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
            });

            // 각 업무별 차트 생성
            for (const taskId of sortedResultTaskIds) {
                const task = tasks.find(t => t.id === taskId);
                const taskName = task?.name || taskId;

                // 전체 합계 계산
                const allCounts = Object.values(resultsByTask[taskId]).reduce(
                    (acc, c) => ({ 이행: acc.이행 + c.이행, 부분이행: acc.부분이행 + c.부분이행, 미이행: acc.미이행 + c.미이행, 해당없음: 0 }),
                    { 이행: 0, 부분이행: 0, 미이행: 0, 해당없음: 0 }
                );

                // 테이블 행 생성
                const tableRows: TableRow[] = [];

                // 헤더 행
                tableRows.push(new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: taskName, bold: true, color: 'FFFFFF', size: 24 })], alignment: AlignmentType.CENTER })],
                            columnSpan: 4,
                            shading: { fill: '49176d', type: ShadingType.CLEAR },
                            margins: { top: 80, bottom: 80, left: 100, right: 100 }
                        })
                    ]
                }));

                // 컬럼 헤더
                tableRows.push(new TableRow({
                    children: ['단계', '이행 현황', '건수', '이행률'].map(text =>
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20 })], alignment: AlignmentType.CENTER })],
                            shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
                            margins: { top: 60, bottom: 60, left: 60, right: 60 }
                        })
                    )
                }));

                // 각 단계별 데이터 행
                for (const [field, counts] of Object.entries(resultsByTask[taskId])) {
                    const rate = calcRate(counts);
                    const total = counts.이행 + counts.부분이행 + counts.미이행;
                    const chartImage = await createStackedBarImage(counts);

                    const chartCell = chartImage
                        ? new TableCell({
                            children: [new Paragraph({
                                children: [new ImageRun({ data: chartImage, transformation: { width: 330, height: 22 }, type: 'png' })],
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
                                    children: [new ImageRun({ data: totalChartImage, transformation: { width: 330, height: 22 }, type: 'png' })],
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
                    columnWidths: [1800, 8500, 2700, 2000]
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
            link.download = '개인정보_처리단계_평가_결과보고서.docx';
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('보고서 생성 중 오류가 발생했습니다.');
        }
    };

    // ===== 화면 표시 로직 =====

    const processingTasks = Array.isArray(taskTableData) ? taskTableData : [];
    const PHASES = ['수집', '보유', '이용', '제공', '파기'] as const;

    // taskId 기반으로 그룹화
    const criteriaByTask: { [taskId: string]: { [subField: string]: string[] } } = {};
    if (Array.isArray(lifecycleData)) {
        lifecycleData.forEach((item: any) => {
            if (item.status !== '해당없음') {
                const taskId = item.taskId;
                if (!criteriaByTask[taskId]) criteriaByTask[taskId] = {};
                if (!criteriaByTask[taskId][item.subField]) criteriaByTask[taskId][item.subField] = [];
                criteriaByTask[taskId][item.subField].push(item.no);
            }
        });
    }

    const riskItemsByTask: { [taskId: string]: any[] } = {};
    if (Array.isArray(lifecycleData)) {
        lifecycleData.forEach((item: any) => {
            if (item.status === '부분이행' || item.status === '미이행') {
                const taskId = item.taskId;
                if (!riskItemsByTask[taskId]) {
                    riskItemsByTask[taskId] = [];
                }
                riskItemsByTask[taskId].push({
                    code: item.no,
                    evidence: item.evidence || '',
                    riskFactor: item.riskFactors || '',
                });
            }
        });
    }

    const resultsByTask: { [taskId: string]: { [field: string]: StatusCounts } } = {};
    if (Array.isArray(lifecycleData)) {
        lifecycleData.forEach((item: any) => {
            const taskId = item.taskId;
            if (!resultsByTask[taskId]) resultsByTask[taskId] = {};
            if (!resultsByTask[taskId][item.field]) {
                resultsByTask[taskId][item.field] = { 이행: 0, 부분이행: 0, 미이행: 0, 해당없음: 0 };
            }
            if (item.status) resultsByTask[taskId][item.field][item.status as keyof StatusCounts]++;
        });
    }

    // actionPlansByTask를 컴포넌트 최상위에서 계산
    const actionPlansByTask: { [taskId: string]: any[] } = {};

    if (Array.isArray(lifecycleData)) {
        lifecycleData.forEach((item: any) => {
            if (item.status === '부분이행' || item.status === '미이행') {
                const taskId = item.taskId;
                if (!actionPlansByTask[taskId]) {
                    actionPlansByTask[taskId] = [];
                }

                const itemId = `${item.taskId}-${item.no}`;
                const savedPlan = actionPlansData[itemId];

                actionPlansByTask[taskId].push({
                    taskName: tasks.find(t => t.id === taskId)?.name || '',
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

    const taskOrder = tasks.map(t => t.id);
    const sortedTaskIds = Object.keys(actionPlansByTask).sort((a, b) => {
        const indexA = taskOrder.indexOf(a);
        const indexB = taskOrder.indexOf(b);
        return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary">개인정보 처리단계(Lifecycle) 평가 결과보고서</h1>
                    <p className="text-muted-foreground mt-2">
                        개인정보 처리단계별 보호조치 수행 과정의 전체 결과를 확인합니다
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        다운로드
                    </Button>
                </div>
            </div>

            {/* 1. 개인정보 처리 흐름분석 */}
            <Card>
                <CardHeader>
                    <CardTitle>1. 개인정보 처리 흐름분석</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* 1.1 처리업무표 */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">1.1 개인정보 처리 업무표</h3>
                        <div className="overflow-x-auto">
                            <UITable className="w-full [&_td]:break-words [&_td]:whitespace-pre-wrap [&_td]:max-w-[400px]">
                                <UITableHeader>
                                    <UITableRow>
                                        <UITableHead>평가업무명</UITableHead>
                                        <UITableHead>처리 목적</UITableHead>
                                        <UITableHead>처리 개인정보</UITableHead>
                                        <UITableHead>주관부서</UITableHead>
                                    </UITableRow>
                                </UITableHeader>
                                <UITableBody>
                                    {processingTasks.map((t: any, idx: number) => (
                                        <UITableRow key={idx}>
                                            <UITableCell>{t.taskName}</UITableCell>
                                            <UITableCell>{t.purpose}</UITableCell>
                                            <UITableCell>{t.infomation || t.personalInfo || ''}</UITableCell>
                                            <UITableCell>{t.department}</UITableCell>
                                        </UITableRow>
                                    ))}
                                </UITableBody>
                            </UITable>
                        </div>
                    </div>

                    {/* 1.2 흐름표 */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">1.2 개인정보 흐름표</h3>
                        {tasks.length > 0 ? (
                            tasks.map((task) => {
                                const taskId = task.id;
                                const taskData = flowTableData[taskId];
                                const sheets = taskData?.sheets || taskData;

                                // 모든 단계의 데이터가 있는지 확인
                                const phaseKeyMapLocal: Record<string, string> = {
                                    수집: 'collection',
                                    보유: 'storage',
                                    이용: 'usage',
                                    제공: 'provision',
                                    파기: 'disposal'
                                };

                                const hasAnyData = sheets && PHASES.some(phase => {
                                    const rows = sheets[phaseKeyMapLocal[phase]] || [];
                                    return rows.length > 0;
                                });

                                return (
                                    <div key={taskId} className="space-y-4">
                                        <p className="font-semibold text-lg">[{task.name}]</p>

                                        {hasAnyData ? (
                                            PHASES.map((phase) => {
                                                const phaseKeyMap: Record<string, string> = {
                                                    수집: 'collection',
                                                    보유: 'storage',
                                                    이용: 'usage',
                                                    제공: 'provision',
                                                    파기: 'disposal'
                                                };

                                                const rows = sheets[phaseKeyMap[phase]] || [];
                                                if (rows.length === 0) return null;

                                                const headers =
                                                    phase === '수집'
                                                        ? ['세부업무명', '수집대상', '수집경로', '수집시스템', '수집항목', '수집항목 명칭', '수집목적', '수집부서', '온라인', '암호화']
                                                        : phase === '보유'
                                                            ? ['세부업무명', '보유공간', '수집시스템', '보유항목', '보유항목 명칭', '보유목적', '보유형태', '암호화 항목', '온라인', '암호화']
                                                            : phase === '이용'
                                                                ? ['세부업무명', '보유공간', '이용시스템', '이용항목', '이용항목 명칭', '이용목적', '이용방법', '이용부서', '온라인', '암호화']
                                                                : phase === '제공'
                                                                    ? ['세부업무명', '보유공간', '연계시스템', '제공부서', '수신자', '제공항목', '제공항목명칭', '제공목적', '제공방법', '연계시스템 온라인', '연계시스템 암호화', '수신자 온라인', '수신자 암호화']
                                                                    : ['세부업무명', '보유공간', '파기시스템', '파기항목', '파기항목 명칭', '보관기간', '파기부서', '파기절차', '온라인'];

                                                return (
                                                    <div key={phase} className="space-y-2">
                                                        <h4 className="font-medium">{phase} 단계</h4>
                                                        <div className="overflow-x-auto">
                                                            <UITable className="w-full [&_td]:break-words [&_td]:whitespace-pre-wrap [&_td]:max-w-[400px]">
                                                                <UITableHeader>
                                                                    <UITableRow>
                                                                        {headers.map((h) => (
                                                                            <UITableHead key={h} className="text-center min-w-[60px]">{h}</UITableHead>
                                                                        ))}
                                                                    </UITableRow>
                                                                </UITableHeader>
                                                                <UITableBody>
                                                                    {rows.map((row: any, i: number) => (
                                                                        <UITableRow key={i}>
                                                                            <UITableCell>{row.detailTask}</UITableCell>
                                                                            {phase === '수집' && (
                                                                                <>
                                                                                    <UITableCell>{row.collectionTarget}</UITableCell>
                                                                                    <UITableCell>{row.collectionPath}</UITableCell>
                                                                                    <UITableCell>{row.collectionSystem}</UITableCell>
                                                                                    <UITableCell>{row.collectionItem}</UITableCell>
                                                                                    <UITableCell>{row.collectionItemName}</UITableCell>
                                                                                    <UITableCell>{row.collectionPurpose}</UITableCell>
                                                                                    <UITableCell>{row.collectionDepartment}</UITableCell>
                                                                                    <UITableCell>{row.isOnline}</UITableCell>
                                                                                    <UITableCell>{row.isEncrypted}</UITableCell>
                                                                                </>
                                                                            )}
                                                                            {phase === '보유' && (
                                                                                <>
                                                                                    <UITableCell>{row.storageSpace}</UITableCell>
                                                                                    <UITableCell>{row.collectionSystem}</UITableCell>
                                                                                    <UITableCell>{row.storageItem}</UITableCell>
                                                                                    <UITableCell>{row.storageItemName}</UITableCell>
                                                                                    <UITableCell>{row.storagePurpose}</UITableCell>
                                                                                    <UITableCell>{row.storageFormat}</UITableCell>
                                                                                    <UITableCell>{row.encryptionItem}</UITableCell>
                                                                                    <UITableCell>{row.isOnline}</UITableCell>
                                                                                    <UITableCell>{row.isEncrypted}</UITableCell>
                                                                                </>
                                                                            )}
                                                                            {phase === '이용' && (
                                                                                <>
                                                                                    <UITableCell>{row.storageSpace}</UITableCell>
                                                                                    <UITableCell>{row.usageSystem}</UITableCell>
                                                                                    <UITableCell>{row.usageItem}</UITableCell>
                                                                                    <UITableCell>{row.usageItemName}</UITableCell>
                                                                                    <UITableCell>{row.usagePurpose}</UITableCell>
                                                                                    <UITableCell>{row.usageMethod}</UITableCell>
                                                                                    <UITableCell>{row.usageDepartment}</UITableCell>
                                                                                    <UITableCell>{row.isOnline}</UITableCell>
                                                                                    <UITableCell>{row.isEncrypted}</UITableCell>
                                                                                </>
                                                                            )}
                                                                            {phase === '제공' && (
                                                                                <>
                                                                                    <UITableCell>{row.storageSpace}</UITableCell>
                                                                                    <UITableCell>{row.linkageSystem}</UITableCell>
                                                                                    <UITableCell>{row.provisionDepartment}</UITableCell>
                                                                                    <UITableCell>{row.recipient}</UITableCell>
                                                                                    <UITableCell>{row.provisionItem}</UITableCell>
                                                                                    <UITableCell>{row.provisionItemName}</UITableCell>
                                                                                    <UITableCell>{row.provisionPurpose}</UITableCell>
                                                                                    <UITableCell>{row.provisionMethod}</UITableCell>
                                                                                    <UITableCell>{row.linkageSystemOnline}</UITableCell>
                                                                                    <UITableCell>{row.linkageSystemEncrypted}</UITableCell>
                                                                                    <UITableCell>{row.recipientOnline}</UITableCell>
                                                                                    <UITableCell>{row.recipientEncrypted}</UITableCell>
                                                                                </>
                                                                            )}
                                                                            {phase === '파기' && (
                                                                                <>
                                                                                    <UITableCell>{row.storageSpace}</UITableCell>
                                                                                    <UITableCell>{row.disposalSystem}</UITableCell>
                                                                                    <UITableCell>{row.disposalItem}</UITableCell>
                                                                                    <UITableCell>{row.disposalItemName}</UITableCell>
                                                                                    <UITableCell>{row.retentionPeriod}</UITableCell>
                                                                                    <UITableCell>{row.disposalDepartment}</UITableCell>
                                                                                    <UITableCell>{row.disposalProcedure}</UITableCell>
                                                                                    <UITableCell>{row.disposalOnline}</UITableCell>
                                                                                </>
                                                                            )}
                                                                        </UITableRow>
                                                                    ))}
                                                                </UITableBody>
                                                            </UITable>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-muted-foreground">흐름표가 없습니다.</p>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-muted-foreground">평가업무가 없습니다.</p>
                        )}
                    </div>

                    {/* 1.3 흐름도 */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">1.3 개인정보 흐름도</h3>
                        {tasks.length > 0 ? (
                            tasks.map((task) => {
                                const imageUrl = flowChartImages[task.id];

                                return (
                                    <div key={task.id} className="space-y-2">
                                        <h4 className="font-medium">{task.name} 흐름도</h4>
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={`${task.name} 흐름도`}
                                                className="w-full border rounded"
                                                onError={(e) => {
                                                    console.error(`Failed to load image for ${task.name}`);
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <p className="text-muted-foreground">흐름도 이미지가 없습니다.</p>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-muted-foreground">평가업무가 없습니다.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 2. 영향평가 기준 */}
            <Card>
                <CardHeader>
                    <CardTitle>2. 영향평가 기준</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {(() => {
                        const taskOrder = tasks.map(t => t.id);
                        const sortedTaskIds = Object.keys(criteriaByTask).sort((a, b) => {
                            const indexA = taskOrder.indexOf(a);
                            const indexB = taskOrder.indexOf(b);
                            return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
                        });

                        return sortedTaskIds.map((taskId) => {
                            const task = tasks.find(t => t.id === taskId);
                            const taskName = task?.name || taskId;

                            return (
                                <div key={taskId}>
                                    <p className="font-semibold">[{taskName}]</p>
                                    <ul className="list-disc pl-6">
                                        {Object.keys(criteriaByTask[taskId]).map((sub) => (
                                            <li key={sub}>
                                                {sub} ({criteriaByTask[taskId][sub].join(', ')})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        });
                    })()}
                </CardContent>
            </Card>

            {/* 3. 침해요인 분석 표 */}
            <Card>
                <CardHeader>
                    <CardTitle>3. 평가기준에 따른 개인정보 침해요인 분석·평가</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(() => {
                        const taskOrder = tasks.map(t => t.id);
                        const sortedRiskTaskIds = Object.keys(riskItemsByTask).sort((a, b) => {
                            const indexA = taskOrder.indexOf(a);
                            const indexB = taskOrder.indexOf(b);
                            return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
                        });

                        return sortedRiskTaskIds.map((taskId) => {
                            const task = tasks.find(t => t.id === taskId);
                            const taskName = task?.name || taskId;

                            return (
                                <div key={taskId} className="space-y-2">
                                    <p className="font-semibold">[{taskName}]</p>
                                    <div className="overflow-x-auto">
                                        <UITable className="w-full">
                                            <UITableHeader>
                                                <UITableRow>
                                                    <UITableHead className="whitespace-nowrap">No.</UITableHead>
                                                    <UITableHead>취약점</UITableHead>
                                                    <UITableHead>침해요인</UITableHead>
                                                </UITableRow>
                                            </UITableHeader>
                                            <UITableBody>
                                                {riskItemsByTask[taskId].map((r: any, i: number) => (
                                                    <UITableRow key={i}>
                                                        <UITableCell className="whitespace-nowrap align-top">{r.code}</UITableCell>
                                                        <UITableCell className="break-words align-top max-w-[400px]">{r.evidence}</UITableCell>
                                                        <UITableCell className="break-words align-top max-w-[400px]">{r.riskFactor}</UITableCell>
                                                    </UITableRow>
                                                ))}
                                            </UITableBody>
                                        </UITable>
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </CardContent>
            </Card>

            {/* 4. 개선 조치 계획 */}
            <Card>
                <CardHeader>
                    <CardTitle>4. 주요 위험요소에 따른 개선 조치 계획</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {sortedTaskIds.map((taskId) => {
                        const task = tasks.find(t => t.id === taskId);
                        const taskName = task?.name || taskId;

                        return (
                            <div key={taskId} className="space-y-2">
                                <p className="font-semibold">[{taskName}]</p>
                                <div className="overflow-x-auto">
                                    <UITable className="w-full">
                                        <UITableHeader>
                                            <UITableRow>
                                                <UITableHead className="whitespace-nowrap">No.</UITableHead>
                                                <UITableHead>질의문</UITableHead>
                                                <UITableHead>취약점</UITableHead>
                                                <UITableHead>조치 방안</UITableHead>
                                                <UITableHead className="whitespace-nowrap">조치 기간</UITableHead>
                                                <UITableHead className="whitespace-nowrap">부서</UITableHead>
                                                <UITableHead className="whitespace-nowrap">담당자</UITableHead>
                                                <UITableHead className="whitespace-nowrap">조치 일시</UITableHead>
                                            </UITableRow>
                                        </UITableHeader>
                                        <UITableBody>
                                            {actionPlansByTask[taskId]?.map((plan, idx) => (
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
                                        </UITableBody>
                                    </UITable>
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {/* 5. 평가결과 */}
            <Card>
                <CardHeader>
                    <CardTitle>5. 평가결과</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {(() => {
                        const taskOrder = tasks.map(t => t.id);
                        const sortedResultTaskIds = Object.keys(resultsByTask).sort((a, b) => {
                            const indexA = taskOrder.indexOf(a);
                            const indexB = taskOrder.indexOf(b);
                            return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
                        });

                        return sortedResultTaskIds.map((taskId) => {
                            const task = tasks.find(t => t.id === taskId);
                            const taskName = task?.name || taskId;

                            return (
                                <div key={taskId} className="bg-white rounded-lg shadow p-4">
                                    {/* 업무명 */}
                                    <h4 className="font-semibold text-blue-700 mb-3">[{taskName}]</h4>

                                    {/* 각 단계별 바 */}
                                    <div className="space-y-3">
                                        {Object.entries(resultsByTask[taskId]).map(([field, counts]) => {
                                            const total = counts.이행 + counts.부분이행 + counts.미이행;
                                            const rate = total > 0 ? ((counts.이행 + counts.부분이행 * 0.5) / total * 100) : 0;

                                            if (total === 0) {
                                                return (
                                                    <div key={field} className="flex items-center gap-3">
                                                        <span className="w-20 text-sm text-gray-600">{field}</span>
                                                        <span className="text-sm text-gray-400">-</span>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div key={field} className="flex items-center gap-3">
                                                    <span className="w-20 text-sm font-medium text-gray-700">{field}</span>
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