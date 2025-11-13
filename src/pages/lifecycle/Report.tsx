import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { Document, Packer, Paragraph, Table as DocxTable, TableCell, TableRow, TextRun, WidthType, AlignmentType, HeadingLevel, ImageRun } from 'docx';
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
            const sections = [];

            // Title
            sections.push(
                new Paragraph({
                    text: '개인정보 처리단계별 보호조치 결과보고서',
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                })
            );

            // 1. 개인정보 처리 흐름분석
            sections.push(
                new Paragraph({
                    text: '1. 개인정보 처리 흐름분석',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 }
                })
            );

            // 1.1 처리업무표
            sections.push(
                new Paragraph({
                    text: '1.1 개인정보 처리업무표',
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 }
                })
            );

            if (taskTableData.length > 0) {
                const taskTableRows = [
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph('평가업무명')] }),
                            new TableCell({ children: [new Paragraph('처리 목적')] }),
                            new TableCell({ children: [new Paragraph('처리 개인정보')] }),
                            new TableCell({ children: [new Paragraph('주관부서')] }),
                        ]
                    }),
                    ...taskTableData.map((task: any) => new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph(task.taskName || '')] }),
                            new TableCell({ children: [new Paragraph(task.purpose || '')] }),
                            new TableCell({ children: [new Paragraph(task.infomation || task.personalInfo || '')] }),
                            new TableCell({ children: [new Paragraph(task.department || '')] }),
                        ]
                    }))
                ];
                sections.push(new DocxTable({ rows: taskTableRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
            }

            // 1.2 개인정보 흐름표
            sections.push(
                new Paragraph({
                    text: '1.2 개인정보 흐름표',
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 400, after: 100 }
                })
            );

            const phases = ['수집', '보유', '이용', '제공', '파기'];
            const phaseKeyMap: Record<string, string> = {
                수집: 'collection',
                보유: 'storage',
                이용: 'usage',
                제공: 'provision',
                파기: 'disposal'
            };

            phases.forEach(phase => {
                sections.push(
                    new Paragraph({
                        text: `${phase} 단계`,
                        heading: HeadingLevel.HEADING_4,
                        spacing: { before: 200, after: 100 }
                    })
                );

                const phaseData: any[] = [];

                // tasks 순서대로 데이터 수집 (좌측 탭 순서 유지)
                tasks.forEach(task => {
                    const taskId = task.id;
                    const taskName = task.name;
                    const taskData = flowTableData[taskId];

                    // sheets 구조 확인 (정규화된 데이터 사용)
                    const sheets = taskData?.sheets || taskData;
                    if (!sheets) return;

                    const key = phaseKeyMap[phase];
                    const rows = sheets[key] || [];
                    rows.forEach((row: any) => phaseData.push({ taskName, ...row }));
                });

                if (phaseData.length > 0) {
                    const headers =
                        phase === '수집'
                            ? ['평가업무명', '세부업무명', '수집대상', '수집경로', '수집시스템', '수집항목', '수집항목명칭', '수집목적', '수집부서', '온라인', '암호화']
                            : phase === '보유'
                                ? ['평가업무명', '세부업무명', '보유공간', '수집시스템', '보유항목', '보유항목명칭', '보유목적', '보유형태', '암호화항목', '온라인', '암호화']
                                : phase === '이용'
                                    ? ['평가업무명', '세부업무명', '보유공간', '이용시스템', '이용항목', '이용항목명칭', '이용목적', '이용방법', '이용부서', '온라인', '암호화']
                                    : phase === '제공'
                                        ? ['평가업무명', '세부업무명', '보유공간', '연계시스템', '제공부서', '수신자', '제공항목', '제공항목명칭', '제공목적', '제공방법', '연계시스템온라인', '연계시스템암호화', '수신자온라인', '수신자암호화']
                                        : ['평가업무명', '세부업무명', '보유공간', '파기시스템', '파기항목', '파기항목명칭', '보관기간', '파기부서', '파기절차', '온라인'];

                    const flowRows = [
                        new TableRow({
                            children: headers.map(h => new TableCell({ children: [new Paragraph(h)] }))
                        }),
                        ...phaseData.map(row => new TableRow({
                            children:
                                phase === '수집'
                                    ? [
                                        new TableCell({ children: [new Paragraph(row.taskName || '')] }),
                                        new TableCell({ children: [new Paragraph(row.detailTask || '')] }),
                                        new TableCell({ children: [new Paragraph(row.collectionTarget || '')] }),
                                        new TableCell({ children: [new Paragraph(row.collectionPath || '')] }),
                                        new TableCell({ children: [new Paragraph(row.collectionSystem || '')] }),
                                        new TableCell({ children: [new Paragraph(row.collectionItem || '')] }),
                                        new TableCell({ children: [new Paragraph(row.collectionItemName || '')] }),
                                        new TableCell({ children: [new Paragraph(row.collectionPurpose || '')] }),
                                        new TableCell({ children: [new Paragraph(row.collectionDepartment || '')] }),
                                        new TableCell({ children: [new Paragraph(row.isOnline || '')] }),
                                        new TableCell({ children: [new Paragraph(row.isEncrypted || '')] }),
                                    ]
                                    : phase === '보유'
                                        ? [
                                            new TableCell({ children: [new Paragraph(row.taskName || '')] }),
                                            new TableCell({ children: [new Paragraph(row.detailTask || '')] }),
                                            new TableCell({ children: [new Paragraph(row.storageSpace || '')] }),
                                            new TableCell({ children: [new Paragraph(row.collectionSystem || '')] }),
                                            new TableCell({ children: [new Paragraph(row.storageItem || '')] }),
                                            new TableCell({ children: [new Paragraph(row.storageItemName || '')] }),
                                            new TableCell({ children: [new Paragraph(row.storagePurpose || '')] }),
                                            new TableCell({ children: [new Paragraph(row.storageFormat || '')] }),
                                            new TableCell({ children: [new Paragraph(row.encryptionItem || '')] }),
                                            new TableCell({ children: [new Paragraph(row.isOnline || '')] }),
                                            new TableCell({ children: [new Paragraph(row.isEncrypted || '')] }),
                                        ]
                                        : phase === '이용'
                                            ? [
                                                new TableCell({ children: [new Paragraph(row.taskName || '')] }),
                                                new TableCell({ children: [new Paragraph(row.detailTask || '')] }),
                                                new TableCell({ children: [new Paragraph(row.storageSpace || '')] }),
                                                new TableCell({ children: [new Paragraph(row.usageSystem || '')] }),
                                                new TableCell({ children: [new Paragraph(row.usageItem || '')] }),
                                                new TableCell({ children: [new Paragraph(row.usageItemName || '')] }),
                                                new TableCell({ children: [new Paragraph(row.usagePurpose || '')] }),
                                                new TableCell({ children: [new Paragraph(row.usageMethod || '')] }),
                                                new TableCell({ children: [new Paragraph(row.usageDepartment || '')] }),
                                                new TableCell({ children: [new Paragraph(row.isOnline || '')] }),
                                                new TableCell({ children: [new Paragraph(row.isEncrypted || '')] }),
                                            ]
                                            : phase === '제공'
                                                ? [
                                                    new TableCell({ children: [new Paragraph(row.taskName || '')] }),
                                                    new TableCell({ children: [new Paragraph(row.detailTask || '')] }),
                                                    new TableCell({ children: [new Paragraph(row.storageSpace || '')] }),
                                                    new TableCell({ children: [new Paragraph(row.linkageSystem || '')] }),
                                                    new TableCell({ children: [new Paragraph(row.provisionDepartment || '')] }),
                                                    new TableCell({ children: [new Paragraph(row.recipient || '')] }),
                                                    new TableCell({ children: [new Paragraph(row.provisionItem || '')] }),
                                                    new TableCell({ children: [new Paragraph(row.provisionItemName || '')] }),
                                                    new TableCell({ children: [new Paragraph(row.provisionPurpose || '')] }),
                                                    new TableCell({ children: [new Paragraph(row.provisionMethod || '')] }),
                                                    new TableCell({ children: [new Paragraph(row.linkageSystemOnline || '')] }),
                                                    new TableCell({ children: [new Paragraph(row.linkageSystemEncrypted || '')] }),
                                                    new TableCell({ children: [new Paragraph(row.recipientOnline || '')] }),
                                                    new TableCell({ children: [new Paragraph(row.recipientEncrypted || '')] }),
                                                ]
                                                : [
                                                    new TableCell({ children: [new Paragraph(row.taskName || '')] }),
                                                    new TableCell({ children: [new Paragraph(row.detailTask || '')] }),
                                                    new TableCell({ children: [new Paragraph(row.storageSpace || '')] }),
                                                    new TableCell({ children: [new Paragraph(row.disposalSystem || '')] }),
                                                    new TableCell({ children: [new Paragraph(row.disposalItem || '')] }),
                                                    new TableCell({ children: [new Paragraph(row.disposalItemName || '')] }),
                                                    new TableCell({ children: [new Paragraph(row.retentionPeriod || '')] }),
                                                    new TableCell({ children: [new Paragraph(row.disposalDepartment || '')] }),
                                                    new TableCell({ children: [new Paragraph(row.disposalProcedure || '')] }),
                                                    new TableCell({ children: [new Paragraph(row.disposalOnline || '')] }),
                                                ],
                        }))
                    ];
                    sections.push(new DocxTable({ rows: flowRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
                }
            });

            // 1.3 개인정보 흐름도
            sections.push(
                new Paragraph({
                    text: '1.3 개인정보 흐름도',
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 400, after: 100 }
                })
            );

            // tasks 순서대로 이미지 삽입
            for (const task of tasks) {
                const imageUrl = flowChartImages[task.id];

                sections.push(
                    new Paragraph({
                        text: `${task.name} 흐름도`,
                        heading: HeadingLevel.HEADING_4,
                        spacing: { before: 200, after: 100 }
                    })
                );

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
                    sections.push(new Paragraph({
                        text: '흐름도 이미지가 없습니다.',
                        spacing: { after: 200 }
                    }));
                }
            }

            // 2. 영향평가 기준
            sections.push(
                new Paragraph({
                    text: '2. 영향평가 기준',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 }
                })
            );

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

                sections.push(new Paragraph({
                    spacing: { before: 200, after: 100 },
                    children: [new TextRun({ text: `[${taskName}]`, bold: true })]
                }));
                Object.keys(criteriaByTask[taskId]).forEach(subField => {
                    const nos = criteriaByTask[taskId][subField].join(', ');
                    sections.push(new Paragraph({ text: `- ${subField} (${nos})` }));
                });
            });

            // 3. 평가기준에 따른 개인정보 침해요인 분석･평가
            sections.push(
                new Paragraph({
                    text: '3. 평가기준에 따른 개인정보 침해요인 분석･평가',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 }
                })
            );

            const riskItems: any[] = [];
            if (Array.isArray(lifecycleData)) {
                lifecycleData.forEach((item: any) => {
                    if (item.status === '부분이행' || item.status === '미이행') {
                        const itemId = `${item.taskId}-${item.no}`;
                        const saved = improvements[itemId];
                        const task = tasks.find(t => t.id === item.taskId);
                        riskItems.push({
                            taskName: task?.name || '',
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
                            new TableCell({ children: [new Paragraph('처리업무명')] }),
                            new TableCell({ children: [new Paragraph('질의문 코드')] }),
                            new TableCell({ children: [new Paragraph('취약점')] }),
                            new TableCell({ children: [new Paragraph('침해요인')] }),
                        ]
                    }),
                    ...riskItems.map(item => new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph(item.taskName)] }),
                            new TableCell({ children: [new Paragraph(item.code)] }),
                            new TableCell({ children: [new Paragraph(item.evidence)] }),
                            new TableCell({ children: [new Paragraph(item.riskFactor)] }),
                        ]
                    }))
                ];
                sections.push(new DocxTable({ rows: riskRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
            }

            // 4. 주요 위험요소에 따른 개선 조치 계획
            sections.push(
                new Paragraph({
                    text: '4. 주요 위험요소에 따른 개선 조치 계획',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 }
                })
            );

            // lifecycleData 기반으로 생성
            const actionPlansByTask: { [taskId: string]: any[] } = {};

            if (Array.isArray(lifecycleData)) {
                lifecycleData.forEach((item: any) => {
                    if (item.status === '부분이행' || item.status === '미이행') {
                        const taskId = item.taskId;
                        if (!actionPlansByTask[taskId]) {
                            actionPlansByTask[taskId] = [];
                        }
                        actionPlansByTask[taskId].push({
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
                if (plan && plan.taskId && actionPlansByTask[plan.taskId]) {
                    const targetItem = actionPlansByTask[plan.taskId].find(
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
            const sortedActionTaskIds = Object.keys(actionPlansByTask).sort((a, b) => {
                const indexA = taskOrder.indexOf(a);
                const indexB = taskOrder.indexOf(b);
                return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
            });

            sortedActionTaskIds.forEach(taskId => {
                const task = tasks.find(t => t.id === taskId);
                const taskName = task?.name || taskId;

                sections.push(new Paragraph({
                    spacing: { before: 200, after: 100 },
                    children: [new TextRun({ text: `[${taskName}]`, bold: true })]
                }));

                const planRows = [
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
                            new TableCell({ children: [new Paragraph('조치 일시')] }),
                        ]
                    }),
                    ...actionPlansByTask[taskId].map(plan => new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph(plan.code || '')] }),
                            new TableCell({ children: [new Paragraph(plan.question || '')] }),
                            new TableCell({ children: [new Paragraph(plan.evidence || '')] }),
                            new TableCell({ children: [new Paragraph(plan.improvementGuide || '')] }),
                            new TableCell({ children: [new Paragraph(plan.actionPlan || '')] }),
                            new TableCell({ children: [new Paragraph(plan.actionPeriod || '')] }),
                            new TableCell({ children: [new Paragraph(plan.department || '')] }),
                            new TableCell({ children: [new Paragraph(plan.manager || '')] }),
                            new TableCell({ children: [new Paragraph(plan.actionDate || '')] }),
                        ]
                    }))
                ];
                sections.push(new DocxTable({ rows: planRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
            });

            // 5. 평가결과
            sections.push(
                new Paragraph({
                    text: '5. 평가결과',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 }
                })
            );

            const resultsByTask: { [taskId: string]: { [field: string]: StatusCounts } } = {};
            if (Array.isArray(lifecycleData)) {
                lifecycleData.forEach((item: any) => {
                    const taskId = item.taskId;
                    if (!resultsByTask[taskId]) resultsByTask[taskId] = {};
                    if (!resultsByTask[taskId][item.field]) {
                        resultsByTask[taskId][item.field] = { 이행: 0, 부분이행: 0, 미이행: 0, 해당없음: 0 };
                    }
                    if (item.status) {
                        resultsByTask[taskId][item.field][item.status as keyof StatusCounts]++;
                    }
                });
            }

            const sortedResultTaskIds = Object.keys(resultsByTask).sort((a, b) => {
                const indexA = taskOrder.indexOf(a);
                const indexB = taskOrder.indexOf(b);
                return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
            });

            sortedResultTaskIds.forEach(taskId => {
                const task = tasks.find(t => t.id === taskId);
                const taskName = task?.name || taskId;

                sections.push(new Paragraph({
                    spacing: { before: 200, after: 100 },
                    children: [new TextRun({ text: `[${taskName}]`, bold: true })]
                }));

                Object.keys(resultsByTask[taskId]).forEach(field => {
                    const counts = resultsByTask[taskId][field];
                    const total = counts.이행 + counts.부분이행 + counts.미이행;
                    const rate = total > 0 ? ((counts.이행 + counts.부분이행 * 0.5) / total * 100).toFixed(1) : '0.0';

                    sections.push(new Paragraph({
                        text: `${field}: 이행 ${counts.이행}건, 부분이행 ${counts.부분이행}건, 미이행 ${counts.미이행}건, 해당없음 ${counts.해당없음}건 (이행률: ${rate}%)`
                    }));
                });
            });

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

    const riskItems = Array.isArray(lifecycleData)
        ? lifecycleData
            .filter((item: any) => item.status === '부분이행' || item.status === '미이행')
            .map((item: any) => {
                const itemId = `${item.taskId}-${item.no}`;
                const task = tasks.find(t => t.id === item.taskId);
                return {
                    taskName: task?.name || '',
                    code: item.no,
                    evidence: item.evidence || '',
                    riskFactor: item.riskFactors || '',
                };
            })
        : [];

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

    const flowByPhase: Record<string, any[]> = { 수집: [], 보유: [], 이용: [], 제공: [], 파기: [] };

    // tasks 순서대로 데이터 수집 (좌측 탭 순서 유지)
    tasks.forEach((task) => {
        const taskId = task.id;
        const taskName = task.name;

        const taskData = flowTableData[taskId];
        if (!taskData) return;

        // sheets 구조 확인 (정규화된 데이터 사용)
        const sheets = taskData.sheets || taskData;
        if (!sheets) return;

        // 각 단계별로 데이터 추가 (프론트엔드 필드명 사용)
        (sheets.collection || []).forEach((row: any) => flowByPhase['수집'].push({ taskName, ...row }));
        (sheets.storage || []).forEach((row: any) => flowByPhase['보유'].push({ taskName, ...row }));
        (sheets.usage || []).forEach((row: any) => flowByPhase['이용'].push({ taskName, ...row }));
        (sheets.provision || []).forEach((row: any) => flowByPhase['제공'].push({ taskName, ...row }));
        (sheets.disposal || []).forEach((row: any) => flowByPhase['파기'].push({ taskName, ...row }));
    });

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
                        <h3 className="text-lg font-semibold">1.1 개인정보 처리업무표</h3>
                        <div className="overflow-x-auto">
                            <UITable>
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
                        {PHASES.map((phase) => {
                            const rows = flowByPhase[phase];
                            if (!rows || rows.length === 0) return null;

                            const renderHeader = (text: string) => {
                                if (phase === '보유' || phase === '이용') return text;

                                const breaks: Record<string, string[]> = {
                                    '세부업무명': ['세부', '업무명'],
                                    '수집대상': ['수집', '대상'],
                                    '수집시스템': ['수집', '시스템'],
                                    '수집목적': ['수집', '목적'],
                                    '수집부서': ['수집', '부서'],
                                    '온라인': ['온라인'],
                                    '암호화': ['암호화'],
                                    '보유공간': ['보유', '공간'],
                                    '보유목적': ['보유', '목적'],
                                    '보유형태': ['보유', '형태'],
                                    '이용부서': ['이용', '부서'],
                                    '연계시스템': ['연계', '시스템'],
                                    '제공부서': ['제공', '부서'],
                                    '연계시스템온라인': ['연계시스템', '온라인'],
                                    '연계시스템암호화': ['연계시스템', '암호화'],
                                    '수신자온라인': ['수신자', '온라인'],
                                    '수신자암호화': ['수신자', '암호화'],
                                    '파기시스템': ['파기', '시스템'],
                                    '파기항목': ['파기', '항목'],
                                    '파기부서': ['파기', '부서'],
                                };

                                const parts = breaks[text];
                                if (parts) {
                                    return parts.map((part, i) => (
                                        <span key={i}>
                                            {i > 0 && <br />}
                                            {part}
                                        </span>
                                    ));
                                }
                                return text;
                            };

                            const headers =
                                phase === '수집'
                                    ? ['평가업무명', '세부업무명', '수집대상', '수집경로', '수집시스템', '수집항목', '수집항목명칭', '수집목적', '수집부서', '온라인', '암호화']
                                    : phase === '보유'
                                        ? ['평가업무명', '세부업무명', '보유공간', '수집시스템', '보유항목', '보유항목명칭', '보유목적', '보유형태', '암호화항목', '온라인', '암호화']
                                        : phase === '이용'
                                            ? ['평가업무명', '세부업무명', '보유공간', '이용시스템', '이용항목', '이용항목명칭', '이용목적', '이용방법', '이용부서', '온라인', '암호화']
                                            : phase === '제공'
                                                ? ['평가업무명', '세부업무명', '보유공간', '연계시스템', '제공부서', '수신자', '제공항목', '제공항목명칭', '제공목적', '제공방법', '연계시스템온라인', '연계시스템암호화', '수신자온라인', '수신자암호화']
                                                : ['평가업무명', '세부업무명', '보유공간', '파기시스템', '파기항목', '파기항목명칭', '보관기간', '파기부서', '파기절차', '온라인'];

                            return (
                                <div key={phase} className="space-y-2">
                                    <h4 className="font-medium">{phase} 단계</h4>
                                    <div className="overflow-x-auto">
                                        <UITable>
                                            <UITableHeader>
                                                <UITableRow>
                                                    {headers.map((h) => <UITableHead key={h} className="text-center min-w-[80px]">{renderHeader(h)}</UITableHead>)}
                                                </UITableRow>
                                            </UITableHeader>
                                            <UITableBody>
                                                {rows.map((row: any, i: number) => (
                                                    <UITableRow key={i}>
                                                        <UITableCell>{row.taskName}</UITableCell>
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
                        })}
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
                <CardContent>
                    <div className="overflow-x-auto">
                        <UITable>
                            <UITableHeader>
                                <UITableRow>
                                    <UITableHead>처리업무명</UITableHead>
                                    <UITableHead>질의문 코드</UITableHead>
                                    <UITableHead>취약점</UITableHead>
                                    <UITableHead>침해요인</UITableHead>
                                </UITableRow>
                            </UITableHeader>
                            <UITableBody>
                                {riskItems.map((r: any, i: number) => (
                                    <UITableRow key={i}>
                                        <UITableCell>{r.taskName}</UITableCell>
                                        <UITableCell>{r.code}</UITableCell>
                                        <UITableCell>{r.evidence}</UITableCell>
                                        <UITableCell>{r.riskFactor}</UITableCell>
                                    </UITableRow>
                                ))}
                            </UITableBody>
                        </UITable>
                    </div>
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
                                    <UITable>
                                        <UITableHeader>
                                            <UITableRow>
                                                <UITableHead>질의문 코드</UITableHead>
                                                <UITableHead>질의문</UITableHead>
                                                <UITableHead>취약점</UITableHead>
                                                <UITableHead>개선 가이드</UITableHead>
                                                <UITableHead>조치 방안</UITableHead>
                                                <UITableHead>조치 기간</UITableHead>
                                                <UITableHead>부서</UITableHead>
                                                <UITableHead>담당자</UITableHead>
                                                <UITableHead>조치 일시</UITableHead>
                                            </UITableRow>
                                        </UITableHeader>
                                        <UITableBody>
                                            {actionPlansByTask[taskId]?.map((plan, idx) => (
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
                <CardContent className="space-y-2">
                    {Object.keys(resultsByTask).map((taskId) => {
                        const task = tasks.find(t => t.id === taskId);
                        const taskName = task?.name || taskId;

                        return (
                            <div key={taskId} className="space-y-1">
                                <p className="font-semibold">[{taskName}]</p>
                                <ul className="list-disc pl-6">
                                    {Object.keys(resultsByTask[taskId]).map((field) => {
                                        const c = resultsByTask[taskId][field];
                                        const total = c.이행 + c.부분이행 + c.미이행;
                                        const rate = total > 0 ? (((c.이행 + c.부분이행 * 0.5) / total) * 100).toFixed(1) : '0.0';
                                        return (
                                            <li key={field}>{field}: 이행 {c.이행}건, 부분이행 {c.부분이행}건, 미이행 {c.미이행}건, 해당없음 {c.해당없음}건 (이행률: {rate}%)</li>
                                        );
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );
}