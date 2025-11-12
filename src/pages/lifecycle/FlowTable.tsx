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

    const generateId = () => Math.random().toString(36).substr(2, 9);

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
    };

    const handleSave = async () => {
        if (!user?.companyId || !selectedTaskId) return;

        try {
            setLoading(true);

            const sheets = flowDataByTaskId[selectedTaskId];

            const sheetsToSave = {
                collect: sheets.collection.map(mapFrontendToDb.collection),
                retain: sheets.storage.map(mapFrontendToDb.storage),
                use: sheets.usage.map(mapFrontendToDb.usage),
                provide: sheets.provision.map(mapFrontendToDb.provision),
                discard: sheets.disposal.map(mapFrontendToDb.disposal),
            };

            await api.lifecycle.flowTables.save(user.companyId, selectedTaskId, sheetsToSave);
            toast({ title: '저장되었습니다' });
        } catch (error) {
            console.error('저장 실패:', error);
            toast({ title: '오류', description: '저장 실패', variant: 'destructive' });
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
                                                <TableHead className="min-w-[120px]">세부업무명</TableHead>
                                                <TableHead className="min-w-[120px]">수집대상</TableHead>
                                                <TableHead className="min-w-[120px]">수집경로</TableHead>
                                                <TableHead className="min-w-[120px]">수집시스템</TableHead>
                                                <TableHead className="min-w-[200px]">수집항목</TableHead>
                                                <TableHead className="min-w-[120px]">수집항목명칭</TableHead>
                                                <TableHead className="min-w-[150px]">수집목적</TableHead>
                                                <TableHead className="min-w-[120px]">수집부서</TableHead>
                                                <TableHead className="min-w-[100px]">온라인</TableHead>
                                                <TableHead className="min-w-[100px]">암호화</TableHead>
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
                                                <TableHead className="min-w-[120px]">세부업무명</TableHead>
                                                <TableHead className="min-w-[120px]">보유공간</TableHead>
                                                <TableHead className="min-w-[120px]">수집시스템</TableHead>
                                                <TableHead className="min-w-[200px]">보유항목</TableHead>
                                                <TableHead className="min-w-[120px]">보유항목명칭</TableHead>
                                                <TableHead className="min-w-[150px]">보유목적</TableHead>
                                                <TableHead className="min-w-[120px]">보유형태</TableHead>
                                                <TableHead className="min-w-[200px]">암호화항목</TableHead>
                                                <TableHead className="min-w-[100px]">온라인</TableHead>
                                                <TableHead className="min-w-[100px]">암호화</TableHead>
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
                                                <TableHead className="min-w-[120px]">세부업무명</TableHead>
                                                <TableHead className="min-w-[120px]">보유공간</TableHead>
                                                <TableHead className="min-w-[120px]">이용시스템</TableHead>
                                                <TableHead className="min-w-[200px]">이용항목</TableHead>
                                                <TableHead className="min-w-[120px]">이용항목명칭</TableHead>
                                                <TableHead className="min-w-[150px]">이용목적</TableHead>
                                                <TableHead className="min-w-[200px]">이용방법</TableHead>
                                                <TableHead className="min-w-[120px]">이용자</TableHead>
                                                <TableHead className="min-w-[100px]">온라인</TableHead>
                                                <TableHead className="min-w-[100px]">암호화</TableHead>
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
                                                <TableHead className="min-w-[120px]">세부업무명</TableHead>
                                                <TableHead className="min-w-[120px]">보유공간</TableHead>
                                                <TableHead className="min-w-[120px]">연계시스템</TableHead>
                                                <TableHead className="min-w-[100px]">제공부서</TableHead>
                                                <TableHead className="min-w-[100px]">수신자</TableHead>
                                                <TableHead className="min-w-[200px]">제공항목</TableHead>
                                                <TableHead className="min-w-[150px]">제공항목명칭</TableHead>
                                                <TableHead className="min-w-[150px]">제공목적</TableHead>
                                                <TableHead className="min-w-[200px]">제공방법</TableHead>
                                                <TableHead className="min-w-[130px]">연계시스템온라인</TableHead>
                                                <TableHead className="min-w-[130px]">연계시스템암호화</TableHead>
                                                <TableHead className="min-w-[130px]">수신자온라인</TableHead>
                                                <TableHead className="min-w-[130px]">수신자암호화</TableHead>
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
                                                <TableHead className="min-w-[120px]">세부업무명</TableHead>
                                                <TableHead className="min-w-[120px]">보유공간</TableHead>
                                                <TableHead className="min-w-[120px]">파기시스템</TableHead>
                                                <TableHead className="min-w-[200px]">파기항목</TableHead>
                                                <TableHead className="min-w-[120px]">파기항목명칭</TableHead>
                                                <TableHead className="min-w-[100px]">보관기간</TableHead>
                                                <TableHead className="min-w-[120px]">파기부서</TableHead>
                                                <TableHead className="min-w-[200px]">파기절차</TableHead>
                                                <TableHead className="min-w-[100px]">온라인</TableHead>
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
        </div>
    );
}