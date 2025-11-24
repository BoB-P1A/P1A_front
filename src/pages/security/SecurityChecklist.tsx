
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Upload, Download, RotateCcw, Save } from "lucide-react";
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

interface SecurityItem {
    id: number;
    systemName: string;
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

interface SystemInfo {
    id: string;      // ObjectId
    name: string;    // 검토대상명
}

export default function SecurityChecklist() {
    const { user } = useAuth();
    const [securitySystems, setSecuritySystems] = useState<SystemInfo[]>([]);
    const [items, setItems] = useState<SecurityItem[]>([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSystem, setEditingSystem] = useState<SystemInfo | null>(null);
    const [systemName, setSystemName] = useState("");
    const [pendingTab, setPendingTab] = useState<string | null>(null);
    const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!user?.companyId) return;

            try {
                const systemsResponse = await api.security.targets.getAll(user.companyId);
                const systemsArray = Array.isArray(systemsResponse) ? systemsResponse : [];
                if (systemsArray.length > 0) {
                    setSecuritySystems(systemsArray);
                    if (!activeTab) {
                        setActiveTab(systemsArray[0].id);
                    }
                } else {
                    setSecuritySystems([]);
                }
            } catch (error) {
                console.error('Failed to load security systems:', error);
                setSecuritySystems([]); // 에러 시에도 빈 배열로 설정
                toast({ title: "오류", description: "검토대상 목록 로딩 실패", variant: "destructive" });
            }
        };

        loadData();
    }, [user?.companyId]);

    useEffect(() => {
        const loadChecklist = async () => {
            if (!activeTab || !user?.companyId) return;

            try {
                // 평가항목 전체 조회 후 area가 "3"으로 시작하는 항목만 필터링
                const evaluationItems = await api.evaluations.getAll(user.companyId);
                const filtered = evaluationItems.filter((item: any) => item.area?.startsWith("3."));

                const checklistResponse = await api.security.checklists.getAll({
                    companyId: user.companyId,
                    systemId: activeTab,
                    status: [],
                });

                // 평가항목과 저장된 체크리스트 병합
                const merged: SecurityItem[] = filtered.map((evalItem: any) => {
                    const saved = checklistResponse.find((s: any) => s.no === evalItem.no);
                    return {
                        id: evalItem.id,
                        systemName: saved?.systemName || "",
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
                toast({ title: "오류", description: "체크리스트 로딩 실패", variant: "destructive" });
            }
        };

        loadChecklist();
    }, [activeTab, user?.companyId]);

    const handleTabChange = (newTab: string) => {
        if (hasChanges && newTab !== activeTab) {
            setPendingTab(newTab);
            setShowUnsavedAlert(true);
        } else {
            setActiveTab(newTab);
        }
    };

    const handleConfirmTabChange = () => {
        if (pendingTab) {
            setActiveTab(pendingTab);
            setHasChanges(false);
            setPendingTab(null);
        }
        setShowUnsavedAlert(false);
    };

    const handleCancelTabChange = () => {
        setPendingTab(null);
        setShowUnsavedAlert(false);
    };

    // no를 기준으로 항목 구분
    const handleStatusChange = (no: string, status: "이행" | "부분이행" | "미이행" | "해당없음") => {
        setItems((prev) => prev.map((item) => (item.no === no ? { ...item, status } : item)));
        setHasChanges(true);
    };

    // no를 기준으로 항목 구분
    const handleEvidenceChange = (no: string, evidence: string) => {
        setItems((prev) => prev.map((item) => (item.no === no ? { ...item, evidence } : item)));
        setHasChanges(true);
    };

    // no를 기준으로 항목 구분 - 파일 업로드 로직 - 구조화된 S3 경로 사용 및 즉시 DB 저장
    const handleFileUpload = async (no: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user?.companyId) return;

        // 해당 항목 찾기
        const currentItem = items.find(item => item.no === no);
        if (!currentItem) return;

        try {
            // uploadSecurity 함수 사용 (구조화된 S3 경로)
            // 경로 형식: companyId/보안성검토/systemId/no/filename
            const uploadResult = await api.files.uploadSecurity(
                file,
                user.companyId,
                activeTab,           // systemId (ObjectId)
                currentItem.no       // no (예: 3.1.1)
            );

            const fileData: FileAttachment = {
                name: file.name,
                url: uploadResult.fileUrl,
                type: file.type,
            };

            // 로컬 상태 업데이트
            const updatedItems = items.map((item) =>
                item.no === no
                    ? { ...item, files: [...item.files, fileData] }
                    : item
            );
            setItems(updatedItems);

            // 즉시 DB에 저장 (systemId 파라미터 사용)
            await api.security.checklists.save(user.companyId, activeTab, updatedItems);

            // hasChanges 상태는 변경하지 않음 (이미 저장되었으므로)
            toast({ title: "파일이 업로드되었습니다" });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "파일 업로드 중 오류가 발생했습니다";
            toast({ title: "파일 업로드 실패", description: errorMessage, variant: "destructive" });
        } finally {
            event.target.value = '';
        }
    };

    // no를 기준으로 항목 구분 - 파일 삭제 로직 - 즉시 DB 저장
    const handleFileDelete = async (no: string, fileUrl: string) => {
        try {
            // 1. S3에서 파일 삭제
            await api.files.delete(fileUrl);

            // 2. 로컬 상태 업데이트
            const updatedItems = items.map((item) =>
                item.no === no
                    ? { ...item, files: item.files.filter((f) => f.url !== fileUrl) }
                    : item
            );
            setItems(updatedItems);

            // 즉시 DB에 저장 (systemId 파라미터 사용)
            await api.security.checklists.save(user.companyId!, activeTab, updatedItems);

            // hasChanges 상태는 변경하지 않음 (이미 저장되었으므로)
            toast({ title: "파일이 삭제되었습니다" });
        } catch (error) {
            toast({ title: "파일 삭제 실패", variant: "destructive" });
        }
    };

    // Pre-signed URL을 통한 다운로드
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

    const handleSave = async () => {
        if (!user?.companyId) return;

        try {
            await api.security.checklists.save(user.companyId, activeTab, items);
            setHasChanges(false);
            toast({ title: "저장되었습니다" });
        } catch (error) {
            toast({ title: "오류", description: "저장 실패", variant: "destructive" });
        }
    };

    const handleReset = () => {
        setItems((prev) => prev.map((item) => ({ ...item, status: null, evidence: "", files: [] })));
        setHasChanges(true);
    };

    const handleOpenDialog = (system?: SystemInfo) => {
        if (system) {
            setEditingSystem(system);
            setSystemName(system.name);
        } else {
            setEditingSystem(null);
            setSystemName("");
        }
        setIsDialogOpen(true);
    };

    const handleSaveSystem = async () => {
        if (!systemName.trim()) {
            alert("검토대상 이름을 입력해주세요.");
            return;
        }

        try {
            if (editingSystem) {
                await api.security.targets.update(editingSystem.id, systemName);
                setSecuritySystems((prev) => prev.map((s) => (s.id === editingSystem.id ? { ...s, name: systemName } : s)));
                toast({ title: "검토대상이 수정되었습니다" });
            } else {
                const newSystem = await api.security.targets.create(user?.companyId as string, systemName);
                setSecuritySystems((prev) => [...prev, newSystem]);
                if (securitySystems.length === 0) {
                    setActiveTab(newSystem.id);
                }
                toast({ title: "검토대상이 추가되었습니다" });
            }

            setIsDialogOpen(false);
            setEditingSystem(null);
            setSystemName("");
        } catch (error) {
            toast({ title: "저장 실패", variant: "destructive" });
        }
    };

    const handleDeleteSystem = async (id: string) => {
        const system = securitySystems.find((s) => s.id === id);
        if (!system || !confirm(`${system.name} 검토대상을 삭제하시겠습니까?`)) {
            return;
        }

        try {
            await api.security.targets.delete(id);
            const updatedSystems = securitySystems.filter((s) => s.id !== id);
            setSecuritySystems(updatedSystems);
            toast({ title: "검토대상이 삭제되었습니다" });

            if (activeTab === id && updatedSystems.length > 0) {
                setActiveTab(updatedSystems[0].id);
            }
        } catch (error) {
            toast({ title: "삭제 실패", variant: "destructive" });
        }
    };

    const getItemsForSystem = (systemId: string) => {
        return systemId === activeTab ? items : [];
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-primary">보안성 검토 Checklist</h1>
                <div className="space-x-2 flex items-center">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => handleOpenDialog()}>
                                <Plus className="mr-2 h-4 w-4" />
                                검토대상 추가
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingSystem ? "검토대상 수정" : "새 검토대상 추가"}</DialogTitle>
                                <DialogDescription>검토대상명을 입력해주세요</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="systemName">검토대상명</Label>
                                    <Input
                                        id="systemName"
                                        value={systemName}
                                        onChange={(e) => setSystemName(e.target.value)}
                                        placeholder="예: 회원관리시스템"
                                    />
                                </div>
                                <Button onClick={handleSaveSystem} className="w-full">
                                    저장
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
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

            {securitySystems.length === 0 ? (
                <Card>
                    <CardContent className="py-8">
                        <p className="text-center text-muted-foreground">검토대상을 추가해주세요.</p>
                    </CardContent>
                </Card>
            ) : (
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <div className="flex items-center justify-between mb-4">
                        <TabsList>
                            {Array.isArray(securitySystems) && securitySystems.map((system) => (
                                <TabsTrigger key={system.id} value={system.id}>
                                    {system.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        <div className="flex gap-2">
                            {Array.isArray(securitySystems) && securitySystems.map(
                                (system) =>
                                    activeTab === system.id && (
                                        <div key={system.id} className="flex gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(system)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSystem(system.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ),
                            )}
                        </div>
                    </div>

                    {Array.isArray(securitySystems) && securitySystems.map((system) => (
                        <TabsContent key={system.id} value={system.id}>
                            <div className="space-y-6">
                                {getItemsForSystem(system.id).map((item, index, array) => {
                                    const prevItem = index > 0 ? array[index - 1] : null;
                                    const showFieldHeader = !prevItem || prevItem.field !== item.field;

                                    return (
                                        <div key={`${system.id}-${item.no}`}>
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
                                                                handleStatusChange(item.no, value as "이행" | "부분이행" | "미이행" | "해당없음")
                                                            }
                                                        >
                                                            <div className="flex gap-6">
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="이행" id={`${system.id}-${item.no}-이행`} />
                                                                    <Label htmlFor={`${system.id}-${item.no}-이행`}>이행</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="부분이행" id={`${system.id}-${item.no}-부분이행`} />
                                                                    <Label htmlFor={`${system.id}-${item.no}-부분이행`}>부분이행</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="미이행" id={`${system.id}-${item.no}-미이행`} />
                                                                    <Label htmlFor={`${system.id}-${item.no}-미이행`}>미이행</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="해당없음" id={`${system.id}-${item.no}-해당없음`} />
                                                                    <Label htmlFor={`${system.id}-${item.no}-해당없음`}>해당없음</Label>
                                                                </div>
                                                            </div>
                                                        </RadioGroup>
                                                    </div>

                                                    <div>
                                                        <Label htmlFor={`evidence-${system.id}-${item.no}`} className="font-semibold">
                                                            평가 근거 및 의견
                                                        </Label>
                                                        <Textarea
                                                            id={`evidence-${system.id}-${item.no}`}
                                                            value={item.evidence}
                                                            onChange={(e) => handleEvidenceChange(item.no, e.target.value)}
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
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => handleFileDelete(item.no, file.url)}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <div>
                                                                <input
                                                                    type="file"
                                                                    id={`file-${system.id}-${item.no}`}
                                                                    className="hidden"
                                                                    onChange={(e) => handleFileUpload(item.no, e)}
                                                                />
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => document.getElementById(`file-${system.id}-${item.no}`)?.click()}
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

                                {getItemsForSystem(system.id).length === 0 && (
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
            )}

            <AlertDialog open={showUnsavedAlert} onOpenChange={setShowUnsavedAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>localhost:8080의 메시지</AlertDialogTitle>
                        <AlertDialogDescription>
                            저장하지 않은 변경사항이 있습니다. 탭을 전환하시겠습니까?
                            <br />
                            (저장하지 않은 내용은 사라집니다)
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelTabChange}>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmTabChange}>확인</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}