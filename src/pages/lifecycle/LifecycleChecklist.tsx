import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Trash2, RotateCcw, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface EvaluationItem {
    id: number;
    area: string;
    field: string;
    subField: string;
    no: string;
    item: string;
}

interface LifecycleItem {
    id: number;
    taskId: string;
    field: string;
    subField: string;
    no: string;
    item: string;
    status: "이행" | "부분이행" | "미이행" | "해당없음" | null;
    evidence: string;
    files: FileAttachment[];
}

interface FileAttachment {
    name: string;
    url: string;
    type: string;
}

interface ProcessingTask {
    id: string;
    taskName: string;
}

export default function LifecycleChecklist() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<ProcessingTask[]>([]);
    const [items, setItems] = useState<LifecycleItem[]>([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("");
    const [loading, setLoading] = useState(false);

    // 처리업무 목록 로딩
    useEffect(() => {
        if (!user?.companyId) return;

        const loadTasks = async () => {
            try {
                setLoading(true);
                const processingTasks = await api.lifecycle.tasks.getAll(user.companyId);
                const tasksArray = Array.isArray(processingTasks) ? processingTasks : [];
                if (tasksArray.length > 0) {
                    setTasks(tasksArray);
                    if (!activeTab) {
                        setActiveTab(tasksArray[0].id);
                    }
                } else {
                    setTasks([]);
                }
            } catch (error) {
                console.error('Failed to load tasks:', error);
                setTasks([]);
                toast({ title: "처리업무 목록 로딩 실패", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        loadTasks();
    }, [user?.companyId]);

    // 체크리스트 로딩
    useEffect(() => {
        const loadChecklist = async () => {
            if (!activeTab || !user?.companyId) return;

            try {
                setLoading(true);
                // 평가항목 전체 조회
                const evaluationItems = await api.evaluations.getAll(user.companyId);

                // 평가영역이 "1"로 시작하는 항목만 필터링
                const filtered = evaluationItems.filter((item: any) => item.area?.startsWith("1."));

                // 기존 체크리스트 조회 (
                const checklistResponse = await api.lifecycle.checklists.getAll({
                    companyId: user.companyId,
                    taskId: activeTab,
                    status: [],
                });

                // 평가항목과 저장된 체크리스트 병합
                const merged: LifecycleItem[] = filtered.map((evalItem: any) => {
                    const saved = checklistResponse.find((s: any) => s.no === evalItem.no);
                    return {
                        id: evalItem.id,
                        taskId: saved?.taskId || "",
                        field: evalItem.field,
                        subField: evalItem.subField,
                        no: evalItem.no,
                        item: evalItem.item,
                        status: saved?.status ?? null,
                        evidence: saved?.evidence ?? "",
                        files: saved?.files ?? [],
                    };
                });

                setItems(merged);
            } catch (error) {
                toast({ title: "체크리스트 로딩 실패", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        loadChecklist();
    }, [activeTab, user?.companyId]);

    const handleStatusChange = (id: number, status: "이행" | "부분이행" | "미이행" | "해당없음") => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
        setHasChanges(true);
    };

    const handleEvidenceChange = (id: number, evidence: string) => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, evidence } : item)));
        setHasChanges(true);
    };

    // 파일 업로드 (전용 API + 즉시 DB 저장)
    const handleFileUpload = async (id: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user?.companyId) return;

        // 해당 항목 찾기
        const currentItem = items.find(item => item.id === id);
        if (!currentItem) return;

        try {
            // 1. S3에 파일 업로드
            const uploadResult = await api.files.uploadLifecycle(
                file,
                user.companyId,
                activeTab,         // taskId (ObjectId)
                currentItem.no     // no (예: 1.1.1)
            );

            const fileData: FileAttachment = {
                name: file.name,
                url: uploadResult.fileUrl,
                type: file.type,
            };

            // 2. 로컬 상태 업데이트
            const updatedItems = items.map((item) =>
                item.id === id
                    ? { ...item, files: [...item.files, fileData] }
                    : item
            );
            setItems(updatedItems);

            // 3. 즉시 DB에 저장
            await api.lifecycle.checklists.save(user.companyId, activeTab, updatedItems);

            // hasChanges 상태는 변경하지 않음 (이미 저장되었으므로)
            toast({ title: "파일이 업로드되었습니다" });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "파일 업로드 중 오류가 발생했습니다";
            toast({ title: "파일 업로드 실패", description: errorMessage, variant: "destructive" });
        } finally {
            event.target.value = '';
        }
    };

    // 파일 삭제 (즉시 DB 저장)
    const handleFileDelete = async (itemId: number, fileUrl: string) => {
        try {
            // 1. S3에서 파일 삭제
            await api.files.delete(fileUrl);

            // 2. 로컬 상태 업데이트
            const updatedItems = items.map((item) =>
                item.id === itemId
                    ? { ...item, files: item.files.filter((f) => f.url !== fileUrl) }
                    : item
            );
            setItems(updatedItems);

            // 3. 즉시 DB에 저장
            await api.lifecycle.checklists.save(user.companyId!, activeTab, updatedItems);

            // hasChanges 상태는 변경하지 않음 (이미 저장되었으므로)
            toast({ title: "파일이 삭제되었습니다" });
        } catch (error) {
            toast({ title: "파일 삭제 실패", variant: "destructive" });
        }
    };

    // 파일 다운로드 (Pre-signed URL 사용)
    const handleFileDownload = async (file: FileAttachment) => {
        try {
            // 백엔드에서 Pre-signed URL 받기
            const response = await api.files.getDownloadUrl(file.url);

            // Pre-signed URL로 다운로드
            window.open(response.downloadUrl, "_blank");
        } catch (error) {
            console.error("다운로드 실패:", error);
            toast({
                title: "다운로드 실패",
                description: "파일 다운로드 중 오류가 발생했습니다",
                variant: "destructive"
            });
        }
    };

    // 저장
    const handleSave = async () => {
        if (!user?.companyId) return;

        try {
            setLoading(true);
            await api.lifecycle.checklists.save(user.companyId, activeTab, items);
            setHasChanges(false);
            toast({ title: "저장되었습니다" });
        } catch (error) {
            toast({ title: "저장 실패", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setItems((prev) => prev.map((item) => ({ ...item, status: null, evidence: "", files: [] })));
        setHasChanges(true);
    };

    // taskId 기준으로 항목 필터링
    const getItemsForTask = (taskId: string) => {
        return taskId === activeTab ? items : [];
    };

    if (!Array.isArray(tasks) || tasks.length === 0) {
        return (
            <div className="container mx-auto py-6">
                <Card>
                    <CardContent className="py-8">
                        <p className="text-center text-muted-foreground">처리업무표에서 평가업무를 추가해주세요.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Lifecycle Checklist</h1>
                <div className="space-x-2">
                    <Button variant="outline" onClick={handleReset}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        초기화
                    </Button>
                    <Button onClick={handleSave} disabled={!hasChanges}>
                        <Save className="mr-2 h-4 w-4" />
                        저장
                    </Button>
                </div>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={(newTab) => {
                    if (hasChanges && newTab !== activeTab) {
                        if (
                            confirm("저장하지 않은 변경사항이 있습니다. 탭을 전환하시겠습니까?\n(저장하지 않은 내용은 사라집니다)")
                        ) {
                            setActiveTab(newTab);
                            setHasChanges(false);
                        }
                    } else {
                        setActiveTab(newTab);
                    }
                }}
            >
                <TabsList>
                    {Array.isArray(tasks) && tasks.map((task) => (
                        <TabsTrigger key={task.id} value={task.id}>
                            {task.taskName}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {Array.isArray(tasks) && tasks.map((task) => (
                    <TabsContent key={task.id} value={task.id} className="mt-6">
                        <div className="space-y-6">
                            {getItemsForTask(task.id).map((item, index, array) => {
                                const prevItem = index > 0 ? array[index - 1] : null;
                                const showFieldHeader = !prevItem || prevItem.field !== item.field;

                                return (
                                    <div key={item.id}>
                                        {showFieldHeader && (
                                            <div className="mb-4 mt-6 first:mt-0">
                                                <h2 className="text-xl font-semibold text-primary border-b pb-2">{item.field}</h2>
                                            </div>
                                        )}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">
                                                    {item.no} - {item.subField}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div>
                                                    <Label className="font-semibold">평가항목</Label>
                                                    <p className="mt-1 text-sm">{item.item}</p>
                                                </div>

                                                <div>
                                                    <Label className="font-semibold mb-2 block">평가 결과</Label>
                                                    <RadioGroup
                                                        value={item.status || ""}
                                                        onValueChange={(value) =>
                                                            handleStatusChange(item.id, value as "이행" | "부분이행" | "미이행" | "해당없음")
                                                        }
                                                    >
                                                        <div className="flex gap-6">
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="이행" id={`${item.id}-이행`} />
                                                                <Label htmlFor={`${item.id}-이행`}>이행</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="부분이행" id={`${item.id}-부분이행`} />
                                                                <Label htmlFor={`${item.id}-부분이행`}>부분이행</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="미이행" id={`${item.id}-미이행`} />
                                                                <Label htmlFor={`${item.id}-미이행`}>미이행</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="해당없음" id={`${item.id}-해당없음`} />
                                                                <Label htmlFor={`${item.id}-해당없음`}>해당없음</Label>
                                                            </div>
                                                        </div>
                                                    </RadioGroup>
                                                </div>

                                                <div>
                                                    <Label htmlFor={`evidence-${item.id}`} className="font-semibold">
                                                        평가 근거 및 의견
                                                    </Label>
                                                    <Textarea
                                                        id={`evidence-${item.id}`}
                                                        value={item.evidence}
                                                        onChange={(e) => handleEvidenceChange(item.id, e.target.value)}
                                                        placeholder="평가 근거 및 의견을 입력하세요"
                                                        className="mt-1"
                                                        rows={3}
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="font-semibold">증적 자료</Label>
                                                    <div className="mt-2 space-y-2">
                                                        {item.files.map((file, idx) => (
                                                            <div key={idx} className="flex items-center justify-between p-2 border rounded">
                                                                <span className="text-sm truncate flex-1">{file.name}</span>
                                                                <div className="flex gap-2">
                                                                    <Button size="sm" variant="ghost" onClick={() => handleFileDownload(file)}>
                                                                        <Download className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button size="sm" variant="ghost" onClick={() => handleFileDelete(item.id, file.url)}>
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div>
                                                            <input
                                                                type="file"
                                                                id={`file-${item.id}`}
                                                                className="hidden"
                                                                onChange={(e) => handleFileUpload(item.id, e)}
                                                            />
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => document.getElementById(`file-${item.id}`)?.click()}
                                                            >
                                                                <Upload className="mr-2 h-4 w-4" />
                                                                파일 업로드
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                );
                            })}

                            {getItemsForTask(task.id).length === 0 && (
                                <Card>
                                    <CardContent className="py-8">
                                        <p className="text-center text-muted-foreground">
                                            영향평가 관리 페이지에서 평가항목을 추가해주세요.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}