
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Plus, Trash2, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';

// FAST API로 연결되는 부분(AI)
const FLOW_API_BASE = import.meta.env.VITE_FLOW_API_BASE_URL ?? "http://localhost:8000";

// DB에서 받아오는 원본 데이터 타입
interface DbCollectionItem {
    _id?: string;
    id?: string;
    collect_task?: string;
    collect_target?: string;
    collect_route?: string;
    collect_system?: string;
    collect_items?: string;
    collect_bundle?: string;
    collect_purpose?: string;
    collect_dept?: string;
    collect_online?: boolean;
    collect_encrypt?: boolean;
}

interface DbRetainItem {
    _id?: string;
    id?: string;
    retain_task?: string;
    retain_space?: string;
    retain_input_system?: string;
    retain_items?: string;
    retain_bundle?: string;
    retain_purpose?: string;
    retain_form?: string;
    retain_enc_items?: string;
    retain_online?: boolean;
    retain_encrypt?: boolean;
}

interface DbUseItem {
    _id?: string;
    id?: string;
    use_task?: string;
    use_space?: string;
    use_system?: string;
    use_items?: string;
    use_bundle?: string;
    use_purpose?: string;
    use_method?: string;
    use_dept?: string;
    use_online?: boolean;
    use_encrypt?: boolean;
}

interface DbProvideItem {
    _id?: string;
    id?: string;
    provide_task?: string;
    provide_space?: string;
    provide_system?: string;
    provide_dept?: string;
    receiver?: string;
    provide_items?: string;
    provide_bundle?: string;
    provide_purpose?: string;
    provide_method?: string;
    provide_sys_online?: boolean;
    provide_sys_encrypt?: boolean;
    receiver_online?: boolean;
    receiver_encrypt?: boolean;
}

interface DbDiscardItem {
    _id?: string;
    id?: string;
    discard_task?: string;
    discard_space?: string;
    discard_system?: string;
    discard_items?: string;
    discard_bundle?: string;
    discard_period?: string;
    discard_dept?: string;
    discard_proc?: string;
    discard_online?: boolean;
}

// 프론트엔드용 인터페이스 (기존 UI 유지)
interface CollectionData {
    id: string;
    detailTask: string;
    collectionTarget: string;
    collectionPath: string;
    collectionSystem: string;
    collectionItem: string;
    collectionItemName: string;
    collectionPurpose: string;
    collectionDepartment: string;
    isOnline: string;
    isEncrypted: string;
}

interface StorageData {
    id: string;
    detailTask: string;
    storageSpace: string;
    collectionSystem: string;
    storageItem: string;
    storageItemName: string;
    storagePurpose: string;
    storageFormat: string;
    encryptionItem: string;
    isOnline: string;
    isEncrypted: string;
}

interface UsageData {
    id: string;
    detailTask: string;
    storageSpace: string;
    usageSystem: string;
    usageItem: string;
    usageItemName: string;
    usagePurpose: string;
    usageMethod: string;
    usageDepartment: string;
    isOnline: string;
    isEncrypted: string;
}

interface ProvisionData {
    id: string;
    detailTask: string;
    storageSpace: string;
    linkageSystem: string;
    provisionDepartment: string;
    recipient: string;
    provisionItem: string;
    provisionItemName: string;
    provisionPurpose: string;
    provisionMethod: string;
    linkageSystemOnline: string;
    linkageSystemEncrypted: string;
    recipientOnline: string;
    recipientEncrypted: string;
}

interface DisposalData {
    id: string;
    detailTask: string;
    storageSpace: string;
    disposalSystem: string;
    disposalItem: string;
    disposalItemName: string;
    retentionPeriod: string;
    disposalDepartment: string;
    disposalProcedure: string;
    disposalOnline: string;
}

interface TaskFlowData {
    collection: CollectionData[];
    storage: StorageData[];
    usage: UsageData[];
    provision: ProvisionData[];
    disposal: DisposalData[];
}

interface TaskInfo {
    taskId: string;
    taskName: string;
}

interface ApiTask {
    id?: string;
    _id?: string;
    taskName?: string;
}

interface ApiFlowTableResponse {
    [taskId: string]: {
        sheets?: {
            collect?: DbCollectionItem[];
            retain?: DbRetainItem[];
            use?: DbUseItem[];
            provide?: DbProvideItem[];
            discard?: DbDiscardItem[];
        };
    };
}

interface AiGenerateSheetsResponse {
  company_id: string;
  task_id: string;
  sheets: {
    collect?: DbCollectionItem[];
    retain?: DbRetainItem[];
    use?: DbUseItem[];
    provide?: DbProvideItem[];
    discard?: DbDiscardItem[];
  };
}

// DB 필드 <-> 프론트엔드 필드 매핑 함수
const mapDbToFrontend = {
    collection: (dbItem: DbCollectionItem): CollectionData => ({
        id: dbItem._id || dbItem.id || '',
        detailTask: dbItem.collect_task || '',
        collectionTarget: dbItem.collect_target || '',
        collectionPath: dbItem.collect_route || '',
        collectionSystem: dbItem.collect_system || '',
        collectionItem: dbItem.collect_items || '',
        collectionItemName: dbItem.collect_bundle || '',
        collectionPurpose: dbItem.collect_purpose || '',
        collectionDepartment: dbItem.collect_dept || '',
        isOnline: dbItem.collect_online === true ? 'True' : dbItem.collect_online === false ? 'False' : '',
        isEncrypted: dbItem.collect_encrypt === true ? 'True' : dbItem.collect_encrypt === false ? 'False' : dbItem.collect_encrypt === null ? 'Unknown' : '',
    }),
    storage: (dbItem: DbRetainItem): StorageData => ({
        id: dbItem._id || dbItem.id || '',
        detailTask: dbItem.retain_task || '',
        storageSpace: dbItem.retain_space || '',
        collectionSystem: dbItem.retain_input_system || '',
        storageItem: dbItem.retain_items || '',
        storageItemName: dbItem.retain_bundle || '',
        storagePurpose: dbItem.retain_purpose || '',
        storageFormat: dbItem.retain_form || '',
        encryptionItem: dbItem.retain_enc_items || '',
        isOnline: dbItem.retain_online === true ? 'True' : dbItem.retain_online === false ? 'False' : '',
        isEncrypted: dbItem.retain_encrypt === true ? 'True' : dbItem.retain_encrypt === false ? 'False' : dbItem.retain_encrypt === null ? 'Unknown' : '',
    }),
    usage: (dbItem: DbUseItem): UsageData => ({
        id: dbItem._id || dbItem.id || '',
        detailTask: dbItem.use_task || '',
        storageSpace: dbItem.use_space || '',
        usageSystem: dbItem.use_system || '',
        usageItem: dbItem.use_items || '',
        usageItemName: dbItem.use_bundle || '',
        usagePurpose: dbItem.use_purpose || '',
        usageMethod: dbItem.use_method || '',
        usageDepartment: dbItem.use_dept || '',
        isOnline: dbItem.use_online === true ? 'True' : dbItem.use_online === false ? 'False' : '',
        isEncrypted: dbItem.use_encrypt === true ? 'True' : dbItem.use_encrypt === false ? 'False' : dbItem.use_encrypt === null ? 'Unknown' : '',
    }),
    provision: (dbItem: DbProvideItem): ProvisionData => ({
        id: dbItem._id || dbItem.id || '',
        detailTask: dbItem.provide_task || '',
        storageSpace: dbItem.provide_space || '',
        linkageSystem: dbItem.provide_system || '',
        provisionDepartment: dbItem.provide_dept || '',
        recipient: dbItem.receiver || '',
        provisionItem: dbItem.provide_items || '',
        provisionItemName: dbItem.provide_bundle || '',
        provisionPurpose: dbItem.provide_purpose || '',
        provisionMethod: dbItem.provide_method || '',
        linkageSystemOnline: dbItem.provide_sys_online === true ? 'True' : dbItem.provide_sys_online === false ? 'False' : '',
        linkageSystemEncrypted: dbItem.provide_sys_encrypt === true ? 'True' : dbItem.provide_sys_encrypt === false ? 'False' : dbItem.provide_sys_encrypt === null ? 'Unknown' : '',
        recipientOnline: dbItem.receiver_online === true ? 'True' : dbItem.receiver_online === false ? 'False' : '',
        recipientEncrypted: dbItem.receiver_encrypt === true ? 'True' : dbItem.receiver_encrypt === false ? 'False' : dbItem.receiver_encrypt === null ? 'Unknown' : '',
    }),
    disposal: (dbItem: DbDiscardItem): DisposalData => ({
        id: dbItem._id || dbItem.id || '',
        detailTask: dbItem.discard_task || '',
        storageSpace: dbItem.discard_space || '',
        disposalSystem: dbItem.discard_system || '',
        disposalItem: dbItem.discard_items || '',
        disposalItemName: dbItem.discard_bundle || '',
        retentionPeriod: dbItem.discard_period || '',
        disposalDepartment: dbItem.discard_dept || '',
        disposalProcedure: dbItem.discard_proc || '',
        disposalOnline: dbItem.discard_online === true ? 'True' : dbItem.discard_online === false ? 'False' : '',
    }),
};

const mapFrontendToDb = {
    collection: (frontItem: CollectionData) => ({
        collect_task: frontItem.detailTask,
        collect_target: frontItem.collectionTarget,
        collect_route: frontItem.collectionPath,
        collect_system: frontItem.collectionSystem,
        collect_items: frontItem.collectionItem,
        collect_bundle: frontItem.collectionItemName,
        collect_purpose: frontItem.collectionPurpose,
        collect_dept: frontItem.collectionDepartment,
        collect_online: frontItem.isOnline === 'True',
        collect_encrypt: frontItem.isEncrypted === 'True' ? true : frontItem.isEncrypted === 'False' ? false : null,
    }),
    storage: (frontItem: StorageData) => ({
        retain_task: frontItem.detailTask,
        retain_space: frontItem.storageSpace,
        retain_input_system: frontItem.collectionSystem,
        retain_items: frontItem.storageItem,
        retain_bundle: frontItem.storageItemName,
        retain_purpose: frontItem.storagePurpose,
        retain_form: frontItem.storageFormat,
        retain_enc_items: frontItem.encryptionItem,
        retain_online: frontItem.isOnline === 'True',
        retain_encrypt: frontItem.isEncrypted === 'True' ? true : frontItem.isEncrypted === 'False' ? false : null,
    }),
    usage: (frontItem: UsageData) => ({
        use_task: frontItem.detailTask,
        use_space: frontItem.storageSpace,
        use_system: frontItem.usageSystem,
        use_items: frontItem.usageItem,
        use_bundle: frontItem.usageItemName,
        use_purpose: frontItem.usagePurpose,
        use_method: frontItem.usageMethod,
        use_dept: frontItem.usageDepartment,
        use_online: frontItem.isOnline === 'True',
        use_encrypt: frontItem.isEncrypted === 'True' ? true : frontItem.isEncrypted === 'False' ? false : null,
    }),
    provision: (frontItem: ProvisionData) => ({
        provide_task: frontItem.detailTask,
        provide_space: frontItem.storageSpace,
        provide_system: frontItem.linkageSystem,
        provide_dept: frontItem.provisionDepartment,
        receiver: frontItem.recipient,
        provide_items: frontItem.provisionItem,
        provide_bundle: frontItem.provisionItemName,
        provide_purpose: frontItem.provisionPurpose,
        provide_method: frontItem.provisionMethod,
        provide_sys_online: frontItem.linkageSystemOnline === 'True',
        provide_sys_encrypt: frontItem.linkageSystemEncrypted === 'True' ? true : frontItem.linkageSystemEncrypted === 'False' ? false : null,
        receiver_online: frontItem.recipientOnline === 'True',
        receiver_encrypt: frontItem.recipientEncrypted === 'True' ? true : frontItem.recipientEncrypted === 'False' ? false : null,
    }),
    disposal: (frontItem: DisposalData) => ({
        discard_task: frontItem.detailTask,
        discard_space: frontItem.storageSpace,
        discard_system: frontItem.disposalSystem,
        discard_items: frontItem.disposalItem,
        discard_bundle: frontItem.disposalItemName,
        discard_period: frontItem.retentionPeriod,
        discard_dept: frontItem.disposalDepartment,
        discard_proc: frontItem.disposalProcedure,
        discard_online: frontItem.disposalOnline === 'True',
    }),
};

export default function ProtectionFlowTable() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<TaskInfo[]>([]);
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [flowDataByTaskId, setFlowDataByTaskId] = useState<Record<string, TaskFlowData>>({});
    const [loading, setLoading] = useState(false);
    const [aiSourceTextByTaskId, setAiSourceTextByTaskId] = useState<Record<string, string>>({});
    const [aiLoadingTaskId, setAiLoadingTaskId] = useState<string | null>(null);
    const [aiSourceFileByTaskId, setAiSourceFileByTaskId] = useState<Record<string, File | null>>({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    // 페이지 이탈 경고
    const { WarningDialog } = useUnsavedChangesWarning({
        hasUnsavedChanges,
        onSave: handleSave
    });

    useEffect(() => {
        const loadData = async () => {
            if (!user?.companyId) return;

            try {
                setLoading(true);

                const tasksResponse: ApiTask[] = await api.lifecycle.tasks.getAll(user.companyId);
                const tasksList: TaskInfo[] = tasksResponse
                    .filter((task) => task.taskName?.trim() !== '')
                    .map((task) => ({
                        taskId: task.id || task._id || '',
                        taskName: task.taskName || '',
                    }));

                if (tasksList.length === 0) {
                    toast({ title: '알림', description: '평가업무가 없습니다.' });
                    setLoading(false);
                    return;
                }

                setTasks(tasksList);

                const flowTableResponse: ApiFlowTableResponse = await api.lifecycle.flowTables.getAll(user.companyId);

                const newFlowData: Record<string, TaskFlowData> = {};
                tasksList.forEach((task) => {
                    const taskData = flowTableResponse[task.taskId];
                    const sheets = taskData?.sheets || {};

                    newFlowData[task.taskId] = {
                        collection: (sheets.collect || []).map(mapDbToFrontend.collection),
                        storage: (sheets.retain || []).map(mapDbToFrontend.storage),
                        usage: (sheets.use || []).map(mapDbToFrontend.usage),
                        provision: (sheets.provide || []).map(mapDbToFrontend.provision),
                        disposal: (sheets.discard || []).map(mapDbToFrontend.disposal),
                    };
                });

                setFlowDataByTaskId(newFlowData);

                if (!selectedTaskId || !tasksList.find(t => t.taskId === selectedTaskId)) {
                    setSelectedTaskId(tasksList[0].taskId);
                }
            } catch (error) {
                console.error('데이터 로딩 실패:', error);
                toast({ title: '오류', description: '데이터 로딩 실패', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user?.companyId, selectedTaskId]);

    const handleAddRow = (stage: 'collection' | 'storage' | 'usage' | 'provision' | 'disposal') => {
        let newRow: CollectionData | StorageData | UsageData | ProvisionData | DisposalData;

        switch (stage) {
            case 'collection':
                newRow = {
                    id: generateId(),
                    detailTask: '',
                    collectionTarget: '',
                    collectionPath: '',
                    collectionSystem: '',
                    collectionItem: '',
                    collectionItemName: '',
                    collectionPurpose: '',
                    collectionDepartment: '',
                    isOnline: '',
                    isEncrypted: ''
                };
                break;
            case 'storage':
                newRow = {
                    id: generateId(),
                    detailTask: '',
                    storageSpace: '',
                    collectionSystem: '',
                    storageItem: '',
                    storageItemName: '',
                    storagePurpose: '',
                    storageFormat: '',
                    encryptionItem: '',
                    isOnline: '',
                    isEncrypted: ''
                };
                break;
            case 'usage':
                newRow = {
                    id: generateId(),
                    detailTask: '',
                    storageSpace: '',
                    usageSystem: '',
                    usageItem: '',
                    usageItemName: '',
                    usagePurpose: '',
                    usageMethod: '',
                    usageDepartment: '',
                    isOnline: '',
                    isEncrypted: ''
                };
                break;
            case 'provision':
                newRow = {
                    id: generateId(),
                    detailTask: '',
                    storageSpace: '',
                    linkageSystem: '',
                    provisionDepartment: '',
                    recipient: '',
                    provisionItem: '',
                    provisionItemName: '',
                    provisionPurpose: '',
                    provisionMethod: '',
                    linkageSystemOnline: '',
                    linkageSystemEncrypted: '',
                    recipientOnline: '',
                    recipientEncrypted: ''
                };
                break;
            case 'disposal':
                newRow = {
                    id: generateId(),
                    detailTask: '',
                    storageSpace: '',
                    disposalSystem: '',
                    disposalItem: '',
                    disposalItemName: '',
                    retentionPeriod: '',
                    disposalDepartment: '',
                    disposalProcedure: '',
                    disposalOnline: ''
                };
                break;
        }

        setFlowDataByTaskId(prev => {
            const currentTask = prev[selectedTaskId] || {
                collection: [],
                storage: [],
                usage: [],
                provision: [],
                disposal: [],
            };
            const currentStageData = currentTask[stage] || [];

            return {
                ...prev,
                [selectedTaskId]: {
                    ...currentTask,
                    [stage]: [...currentStageData, newRow],
                },
            };
        });
        setHasUnsavedChanges(true);
    };

    const handleDeleteRow = (stage: 'collection' | 'storage' | 'usage' | 'provision' | 'disposal', id: string) => {
        setFlowDataByTaskId(prev => {
            const currentTask = prev[selectedTaskId] || {
                collection: [],
                storage: [],
                usage: [],
                provision: [],
                disposal: [],
            };
            const currentStageData = currentTask[stage] || [];

            return {
                ...prev,
                [selectedTaskId]: {
                    ...currentTask,
                    [stage]: currentStageData.filter((item) => item.id !== id),
                },
            };
        });
        setHasUnsavedChanges(true);
    };

    const handleEdit = (stage: 'collection' | 'storage' | 'usage' | 'provision' | 'disposal', id: string, field: string, value: string) => {
        setFlowDataByTaskId(prev => {
            const currentTask = prev[selectedTaskId] || {
                collection: [],
                storage: [],
                usage: [],
                provision: [],
                disposal: [],
            };
            const currentStageData = currentTask[stage] || [];

            return {
                ...prev,
                [selectedTaskId]: {
                    ...currentTask,
                    [stage]: currentStageData.map((item) =>
                        item.id === id ? { ...item, [field]: value } : item
                    ),
                },
            };
        });
    setHasUnsavedChanges(true);
    };

    async function handleSave() {
        if (!user?.companyId || !selectedTaskId) return;

        try {
            setLoading(true);

            const sheets = flowDataByTaskId[selectedTaskId];
            if (!sheets) {
            toast({ title: '오류', description: '선택된 평가업무의 흐름표 데이터가 없습니다.', variant: 'destructive' });
            return;
            }

            const sheetsToSave = {
                collect: sheets.collection.map(mapFrontendToDb.collection),
                retain: sheets.storage.map(mapFrontendToDb.storage),
                use: sheets.usage.map(mapFrontendToDb.usage),
                provide: sheets.provision.map(mapFrontendToDb.provision),
                discard: sheets.disposal.map(mapFrontendToDb.disposal),
            };

            await api.lifecycle.flowTables.save(user.companyId, selectedTaskId, sheetsToSave);
            setHasUnsavedChanges(false);
            toast({ title: '저장되었습니다' });
        } catch (error) {
            console.error('저장 실패:', error);
            toast({ title: '오류', description: '저장 실패', variant: 'destructive' });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleExcelDownload = () => {
        const workbook = XLSX.utils.book_new();

        const phaseLabels: Record<string, string> = {
            collection: '수집',
            storage: '보유',
            usage: '이용',
            provision: '제공',
            disposal: '파기',
        };

        ['collection', 'storage', 'usage', 'provision', 'disposal'].forEach(phase => {
            let headers: string[] = [];
            const allRows: (string | number)[][] = [];

            if (phase === 'collection') {
                headers = ['평가업무명', '세부업무명', '수집대상', '수집경로', '수집시스템', '수집항목', '수집항목명칭', '수집목적', '수집부서', '온라인', '암호화'];
            } else if (phase === 'storage') {
                headers = ['평가업무명', '세부업무명', '보유공간', '수집시스템', '보유항목', '보유항목명칭', '보유목적', '보유형태', '암호화항목', '온라인', '암호화'];
            } else if (phase === 'usage') {
                headers = ['평가업무명', '세부업무명', '보유공간', '이용시스템', '이용항목', '이용항목명칭', '이용목적', '이용방법', '이용자', '온라인', '암호화'];
            } else if (phase === 'provision') {
                headers = ['평가업무명', '세부업무명', '보유공간', '연계시스템', '제공부서', '수신자', '제공항목', '제공항목명칭', '제공목적', '제공방법', '연계시스템온라인', '연계시스템암호화', '수신자온라인', '수신자암호화'];
            } else {
                headers = ['평가업무명', '세부업무명', '보유공간', '파기시스템', '파기항목', '파기항목명칭', '보관기간', '파기부서', '파기절차', '온라인'];
            }

            tasks.forEach(task => {
                const taskData = flowDataByTaskId[task.taskId];
                if (!taskData) return;

                const rows = taskData[phase as keyof TaskFlowData];
                rows.forEach((row) => {
                    const { id, ...rest } = row;
                    allRows.push([task.taskName, ...Object.values(rest) as (string | number)[]]);
                });
            });

            const data = [headers, ...allRows];
            const worksheet = XLSX.utils.aoa_to_sheet(data);
            XLSX.utils.book_append_sheet(workbook, worksheet, phaseLabels[phase]);
        });

        XLSX.writeFile(workbook, '개인정보_흐름표.xlsx');
    };

    // 파일 업로드 → 텍스트 또는 파일 저장
    const handleAiFileChange = (taskId: string, file: File | null) => {
        if (!file) return;

        const lower = file.name.toLowerCase();
        const isTextLike =
            lower.endsWith(".txt") || file.type.startsWith("text/");

        if (isTextLike) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = (e.target?.result || "") as string;
                if (!text.trim()) {
                    toast({
                        title: "알림",
                        description: "파일에서 텍스트를 읽지 못했습니다.",
                        variant: "destructive",
                    });
                    return;
                }
                setAiSourceTextByTaskId((prev) => ({
                    ...prev,
                    [taskId]: text,
                }));
                // 텍스트를 쓸 거니까, 파일 레퍼런스는 굳이 안 들고 있어도 됨
                setAiSourceFileByTaskId((prev) => ({
                    ...prev,
                    [taskId]: null,
                }));
                toast({
                    title: "업로드 완료",
                    description: "AI 분석에 사용할 텍스트가 준비되었습니다.",
                });
            };
            reader.onerror = () => {
                toast({
                    title: "오류",
                    description: "파일을 읽는 중 오류가 발생했습니다.",
                    variant: "destructive",
                });
            };
            reader.readAsText(file, "utf-8");
        } else {
            // txt가 아니면, 서버에서 텍스트 추출
            setAiSourceFileByTaskId((prev) => ({
                ...prev,
                [taskId]: file,
            }));
            setAiSourceTextByTaskId((prev) => ({
                ...prev,
                [taskId]: "",
            }));
            toast({
                title: "업로드 완료",
                description: "서버에서 텍스트를 추출해서 AI 분석에 사용합니다.",
            });
        }
    };

    // Azure OpenAI 호출 → 제안된 흐름표 행들을 프론트에 "추가"만 하기
    const handleRunAiForTask = async (taskId: string) => {
        const plainText = aiSourceTextByTaskId[taskId];
        const file = aiSourceFileByTaskId[taskId];

        if ((!plainText || !plainText.trim()) && !file) {
            toast({ title: '알림', description: '먼저 문서 파일을 업로드 해주세요.', variant: 'destructive' });
            return;
        }
        if (!user?.companyId) {
            toast({ title: '오류', description: '회사 정보가 없습니다.', variant: 'destructive' });
            return;
        }

        try {
            setAiLoadingTaskId(taskId);

            let res: AiGenerateSheetsResponse;

            if (plainText && plainText.trim()) {
                // 1) 기존 txt 기반 호출 그대로
                res = await api.ai.generateSheets({
                    company_id: user.companyId,
                    task_id: taskId,
                    plain_text: plainText,
                });
            } else if (file) {
                // 2) pdf / word / xlsx 등은 파일 업로드 엔드포인트로
                const formData = new FormData();
                formData.append("company_id", user.companyId);
                formData.append("task_id", taskId);
                formData.append("file", file);

                // api 래퍼에 맞게 조정 가능. 일단 fetch 예시:
                const response = await fetch(`${FLOW_API_BASE}/api/ai/generate-sheets-from-file`, {
                    method: "POST",
                    body: formData,
                });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                res = (await response.json()) as AiGenerateSheetsResponse;
            } else {
                throw new Error("AI 분석에 사용할 데이터가 없습니다.");
            }

            const sheets = res.sheets || {};

            // DB → 프론트 매핑 재사용 + 새 id 부여
            const newCollection = (sheets.collect || []).map(mapDbToFrontend.collection).map((row) => ({
                ...row,
                id: generateId(),
            }));
            const newStorage = (sheets.retain || []).map(mapDbToFrontend.storage).map((row) => ({
                ...row,
                id: generateId(),
            }));
            const newUsage = (sheets.use || []).map(mapDbToFrontend.usage).map((row) => ({
                ...row,
                id: generateId(),
            }));
            const newProvision = (sheets.provide || []).map(mapDbToFrontend.provision).map((row) => ({
                ...row,
                id: generateId(),
            }));
            const newDisposal = (sheets.discard || []).map(mapDbToFrontend.disposal).map((row) => ({
                ...row,
                id: generateId(),
            }));

            // 기존 사용자가 입력해둔 행은 그대로 두고, 뒤에 "추가"만 함
            setFlowDataByTaskId((prev) => {
                const currentTask = prev[taskId] || {
                    collection: [],
                    storage: [],
                    usage: [],
                    provision: [],
                    disposal: [],
                };

                return {
                    ...prev,
                    [taskId]: {
                        collection: [...currentTask.collection, ...newCollection],
                        storage: [...currentTask.storage, ...newStorage],
                        usage: [...currentTask.usage, ...newUsage],
                        provision: [...currentTask.provision, ...newProvision],
                        disposal: [...currentTask.disposal, ...newDisposal],
                    },
                };
            });

            toast({
                title: 'AI 제안 완료',
                description: '문서 내용을 기반으로 세부업무 행이 추가되었습니다. 내용을 확인하고 필요시 수정 후 저장하세요.',
            });
        } catch (error) {
            console.error('AI 생성 실패:', error);
            toast({ title: '오류', description: 'AI 분석 중 오류가 발생했습니다.', variant: 'destructive' });
        } finally {
            setAiLoadingTaskId(null);
        }
    };    

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">개인정보 흐름표</h1>
                <div className="flex gap-2">
                    <Button onClick={handleExcelDownload} variant="outline" disabled={loading}>
                        <Download className="mr-2 h-4 w-4" />
                        엑셀 다운로드
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        <Save className="mr-2 h-4 w-4" />
                        저장
                    </Button>
                </div>
            </div>

            <Tabs value={selectedTaskId} onValueChange={setSelectedTaskId}>
                <TabsList>
                    {tasks.map(t => <TabsTrigger key={t.taskId} value={t.taskId}>{t.taskName}</TabsTrigger>)}
                </TabsList>

                {tasks.map(task => (
                    <TabsContent key={task.taskId} value={task.taskId} className="space-y-6">
                        {/* 이 평가업무에 대한 AI 보조 입력 영역 */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>AI 보조 입력</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
                                    <div className="flex-1">
                                        <Input
                                            type="file"
                                            accept="
                                                .txt,
                                                text/plain,
                                                application/pdf,
                                                application/vnd.openxmlformats-officedocument.wordprocessingml.document,
                                                application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
                                                application/vnd.ms-excel
                                            "
                                            onChange={(e) =>
                                                handleAiFileChange(
                                                    task.taskId,
                                                    e.target.files?.[0] || null,
                                                )
                                            }
                                        />
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            txt, pdf, word, excel 문서를 지원합니다. 업로드 후 &ldquo;AI로 행 제안&rdquo; 버튼을 눌러주세요.
                                        </p>
                                    </div>
                                    <div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => handleRunAiForTask(task.taskId)}
                                            disabled={aiLoadingTaskId === task.taskId || loading}
                                        >
                                            {aiLoadingTaskId === task.taskId ? '생성 중...' : 'AI로 행 제안'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 수집 단계 */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>수집</CardTitle>
                                <Button onClick={() => handleAddRow('collection')} size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    행 추가
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="min-w-[120px]">평가업무명</TableHead>
                                                <TableHead className="min-w-[120px]">세부업무명 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[120px]">수집대상 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[120px]">수집경로</TableHead>
                                                <TableHead className="min-w-[120px]">수집시스템 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[200px]">수집항목 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[120px]">수집항목명칭 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[150px]">수집목적</TableHead>
                                                <TableHead className="min-w-[120px]">수집부서</TableHead>
                                                <TableHead className="min-w-[100px]">온라인 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[100px]">암호화 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="w-[80px]">작업</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {flowDataByTaskId[task.taskId]?.collection.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell className="font-medium">{task.taskName}</TableCell>
                                                    <TableCell><Input value={row.detailTask} onChange={(e) => handleEdit('collection', row.id, 'detailTask', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.collectionTarget} onChange={(e) => handleEdit('collection', row.id, 'collectionTarget', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.collectionPath} onChange={(e) => handleEdit('collection', row.id, 'collectionPath', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.collectionSystem} onChange={(e) => handleEdit('collection', row.id, 'collectionSystem', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.collectionItem} onChange={(e) => handleEdit('collection', row.id, 'collectionItem', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.collectionItemName} onChange={(e) => handleEdit('collection', row.id, 'collectionItemName', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.collectionPurpose} onChange={(e) => handleEdit('collection', row.id, 'collectionPurpose', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.collectionDepartment} onChange={(e) => handleEdit('collection', row.id, 'collectionDepartment', e.target.value)} /></TableCell>
                                                    <TableCell>
                                                        <Select value={row.isOnline} onValueChange={(value) => handleEdit('collection', row.id, 'isOnline', value)}>
                                                            <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="True">True</SelectItem>
                                                                <SelectItem value="False">False</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select value={row.isEncrypted} onValueChange={(value) => handleEdit('collection', row.id, 'isEncrypted', value)}>
                                                            <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="True">True</SelectItem>
                                                                <SelectItem value="False">False</SelectItem>
                                                                <SelectItem value="Unknown">Unknown</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteRow('collection', row.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 보유 단계 */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>보유</CardTitle>
                                <Button onClick={() => handleAddRow('storage')} size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    행 추가
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="min-w-[120px]">평가업무명</TableHead>
                                                <TableHead className="min-w-[120px]">세부업무명 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[120px]">보유공간 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[120px]">수집시스템 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[200px]">보유항목 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[120px]">보유항목명칭 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[150px]">보유목적</TableHead>
                                                <TableHead className="min-w-[120px]">보유형태</TableHead>
                                                <TableHead className="min-w-[200px]">암호화항목</TableHead>
                                                <TableHead className="min-w-[100px]">온라인 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[100px]">암호화 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="w-[80px]">작업</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {flowDataByTaskId[task.taskId]?.storage.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell className="font-medium">{task.taskName}</TableCell>
                                                    <TableCell><Input value={row.detailTask} onChange={(e) => handleEdit('storage', row.id, 'detailTask', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.storageSpace} onChange={(e) => handleEdit('storage', row.id, 'storageSpace', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.collectionSystem} onChange={(e) => handleEdit('storage', row.id, 'collectionSystem', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.storageItem} onChange={(e) => handleEdit('storage', row.id, 'storageItem', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.storageItemName} onChange={(e) => handleEdit('storage', row.id, 'storageItemName', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.storagePurpose} onChange={(e) => handleEdit('storage', row.id, 'storagePurpose', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.storageFormat} onChange={(e) => handleEdit('storage', row.id, 'storageFormat', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.encryptionItem} onChange={(e) => handleEdit('storage', row.id, 'encryptionItem', e.target.value)} /></TableCell>
                                                    <TableCell>
                                                        <Select value={row.isOnline} onValueChange={(value) => handleEdit('storage', row.id, 'isOnline', value)}>
                                                            <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="True">True</SelectItem>
                                                                <SelectItem value="False">False</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select value={row.isEncrypted} onValueChange={(value) => handleEdit('storage', row.id, 'isEncrypted', value)}>
                                                            <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="True">True</SelectItem>
                                                                <SelectItem value="False">False</SelectItem>
                                                                <SelectItem value="Unknown">Unknown</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteRow('storage', row.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 이용 단계 */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>이용</CardTitle>
                                <Button onClick={() => handleAddRow('usage')} size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    행 추가
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="min-w-[120px]">평가업무명</TableHead>
                                                <TableHead className="min-w-[120px]">세부업무명 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[120px]">보유공간 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[120px]">이용시스템 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[200px]">이용항목 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[120px]">이용항목명칭 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[150px]">이용목적</TableHead>
                                                <TableHead className="min-w-[200px]">이용방법</TableHead>
                                                <TableHead className="min-w-[120px]">이용자</TableHead>
                                                <TableHead className="min-w-[100px]">온라인 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[100px]">암호화 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="w-[80px]">작업</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {flowDataByTaskId[task.taskId]?.usage?.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell className="font-medium">{task.taskName}</TableCell>
                                                    <TableCell><Input value={row.detailTask} onChange={(e) => handleEdit('usage', row.id, 'detailTask', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.storageSpace} onChange={(e) => handleEdit('usage', row.id, 'storageSpace', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.usageSystem} onChange={(e) => handleEdit('usage', row.id, 'usageSystem', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.usageItem} onChange={(e) => handleEdit('usage', row.id, 'usageItem', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.usageItemName} onChange={(e) => handleEdit('usage', row.id, 'usageItemName', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.usagePurpose} onChange={(e) => handleEdit('usage', row.id, 'usagePurpose', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.usageMethod} onChange={(e) => handleEdit('usage', row.id, 'usageMethod', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.usageDepartment} onChange={(e) => handleEdit('usage', row.id, 'usageDepartment', e.target.value)} /></TableCell>
                                                    <TableCell>
                                                        <Select value={row.isOnline} onValueChange={(value) => handleEdit('usage', row.id, 'isOnline', value)}>
                                                            <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="True">True</SelectItem>
                                                                <SelectItem value="False">False</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select value={row.isEncrypted} onValueChange={(value) => handleEdit('usage', row.id, 'isEncrypted', value)}>
                                                            <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="True">True</SelectItem>
                                                                <SelectItem value="False">False</SelectItem>
                                                                <SelectItem value="Unknown">Unknown</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteRow('usage', row.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 제공 단계 */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>제공</CardTitle>
                                <Button onClick={() => handleAddRow('provision')} size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    행 추가
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="min-w-[120px]">평가업무명</TableHead>
                                                <TableHead className="min-w-[120px]">세부업무명 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[120px]">보유공간 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[120px]">연계시스템 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[100px]">제공부서</TableHead>
                                                <TableHead className="min-w-[100px]">수신자 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[200px]">제공항목 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[150px]">제공항목명칭 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[150px]">제공목적</TableHead>
                                                <TableHead className="min-w-[200px]">제공방법</TableHead>
                                                <TableHead className="min-w-[130px]">연계시스템온라인 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[130px]">연계시스템암호화 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[130px]">수신자온라인 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[130px]">수신자암호화 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="w-[80px]">작업</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {flowDataByTaskId[task.taskId]?.provision.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell className="font-medium">{task.taskName}</TableCell>
                                                    <TableCell><Input value={row.detailTask} onChange={(e) => handleEdit('provision', row.id, 'detailTask', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.storageSpace} onChange={(e) => handleEdit('provision', row.id, 'storageSpace', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.linkageSystem} onChange={(e) => handleEdit('provision', row.id, 'linkageSystem', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.provisionDepartment} onChange={(e) => handleEdit('provision', row.id, 'provisionDepartment', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.recipient} onChange={(e) => handleEdit('provision', row.id, 'recipient', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.provisionItem} onChange={(e) => handleEdit('provision', row.id, 'provisionItem', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.provisionItemName} onChange={(e) => handleEdit('provision', row.id, 'provisionItemName', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.provisionPurpose} onChange={(e) => handleEdit('provision', row.id, 'provisionPurpose', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.provisionMethod} onChange={(e) => handleEdit('provision', row.id, 'provisionMethod', e.target.value)} /></TableCell>
                                                    <TableCell>
                                                        <Select value={row.linkageSystemOnline} onValueChange={(value) => handleEdit('provision', row.id, 'linkageSystemOnline', value)}>
                                                            <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="True">True</SelectItem>
                                                                <SelectItem value="False">False</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select value={row.linkageSystemEncrypted} onValueChange={(value) => handleEdit('provision', row.id, 'linkageSystemEncrypted', value)}>
                                                            <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="True">True</SelectItem>
                                                                <SelectItem value="False">False</SelectItem>
                                                                <SelectItem value="Unknown">Unknown</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select value={row.recipientOnline} onValueChange={(value) => handleEdit('provision', row.id, 'recipientOnline', value)}>
                                                            <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="True">True</SelectItem>
                                                                <SelectItem value="False">False</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select value={row.recipientEncrypted} onValueChange={(value) => handleEdit('provision', row.id, 'recipientEncrypted', value)}>
                                                            <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="True">True</SelectItem>
                                                                <SelectItem value="False">False</SelectItem>
                                                                <SelectItem value="Unknown">Unknown</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteRow('provision', row.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 파기 단계 */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>파기</CardTitle>
                                <Button onClick={() => handleAddRow('disposal')} size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    행 추가
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="min-w-[120px]">평가업무명</TableHead>
                                                <TableHead className="min-w-[120px]">세부업무명 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[120px]">보유공간 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[120px]">파기시스템 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[200px]">파기항목 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[120px]">파기항목명칭 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="min-w-[100px]">보관기간</TableHead>
                                                <TableHead className="min-w-[120px]">파기부서</TableHead>
                                                <TableHead className="min-w-[200px]">파기절차</TableHead>
                                                <TableHead className="min-w-[100px]">온라인 <span className="text-red-500">*</span></TableHead>
                                                <TableHead className="w-[80px]">작업</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {flowDataByTaskId[task.taskId]?.disposal.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell className="font-medium">{task.taskName}</TableCell>
                                                    <TableCell><Input value={row.detailTask} onChange={(e) => handleEdit('disposal', row.id, 'detailTask', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.storageSpace} onChange={(e) => handleEdit('disposal', row.id, 'storageSpace', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.disposalSystem} onChange={(e) => handleEdit('disposal', row.id, 'disposalSystem', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.disposalItem} onChange={(e) => handleEdit('disposal', row.id, 'disposalItem', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.disposalItemName} onChange={(e) => handleEdit('disposal', row.id, 'disposalItemName', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.retentionPeriod} onChange={(e) => handleEdit('disposal', row.id, 'retentionPeriod', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.disposalDepartment} onChange={(e) => handleEdit('disposal', row.id, 'disposalDepartment', e.target.value)} /></TableCell>
                                                    <TableCell><Input value={row.disposalProcedure} onChange={(e) => handleEdit('disposal', row.id, 'disposalProcedure', e.target.value)} /></TableCell>
                                                    <TableCell>
                                                        <Select value={row.disposalOnline} onValueChange={(value) => handleEdit('disposal', row.id, 'disposalOnline', value)}>
                                                            <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="True">True</SelectItem>
                                                                <SelectItem value="False">False</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteRow('disposal', row.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
            <WarningDialog />
        </div>
    );
}