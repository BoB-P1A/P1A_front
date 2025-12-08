import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Save, RefreshCw, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface EvaluationItem {
    id: number;
    area: string;
    field: string;
    subField: string;
    no: string;
    item: string;
}

export default function EvaluationManagement() {
    const { user } = useAuth();
    const [items, setItems] = useState<EvaluationItem[]>([]);
    const { loading, execute } = useApi();

    // 초기 데이터 로드
    useEffect(() => {
        const loadEvaluations = async () => {
            if (!user?.companyId) return;
            try {
                const data = await api.evaluations.getAll(user?.companyId);
                // No. 기준으로 정렬
                const sorted = data.sort((a: EvaluationItem, b: EvaluationItem) => {
                    return String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
                });
                setItems(sorted);
            } catch (error) {
                console.error("Failed to load evaluations:", error);
                // 에러 시 기본 데이터 로드
                const defaultItems = [
                    {
                        id: 1,
                        area: "1. 개인정보 처리단계별 보호조치",
                        field: "1.1. 수집",
                        subField: "개인정보 수집의 적합성",
                        no: "1.1.1",
                        item: "개인정보를 수집하는 경우 정보주체의 동의를 받거나, 법령 등에 따라 적법하게 수집하도록 계획하고 있습니까?",
                    },
                    {
                        id: 2,
                        area: "1. 개인정보 처리단계별 보호조치",
                        field: "1.1. 수집",
                        subField: "개인정보 수집의 적합성",
                        no: "1.1.2",
                        item: "개인정보를 수집하는 경우 목적에 필요한 최소한의 범위에서만 수집하도록 계획하고 있습니까?",
                    },
                    {
                        id: 3,
                        area: "1. 개인정보 처리단계별 보호조치",
                        field: "1.1. 수집",
                        subField: "동의받는 방법의 적절성",
                        no: "1.1.6",
                        item: "개인정보를 수집하는 경우 필수항목과 선택항목을 분리하고 선택적으로 동의할 수 있는 사항에 동의하지 아니하여도 서비스 이용이 가능하도록 계획하고 있습니까?",
                    },
                ];
                const sorted = defaultItems.sort((a, b) => {
                    return a.no.localeCompare(b.no, undefined, { numeric: true });
                });
                setItems(sorted);
            }
        };

        loadEvaluations();
    }, [user?.companyId]);

    const [editingItem, setEditingItem] = useState<EvaluationItem | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<EvaluationItem>>({});

    const handleOpenDialog = (item?: EvaluationItem) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData({});
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editingItem) {
                const updated = await execute(() => api.evaluations.update(editingItem.id, formData));
                setItems((prev) => {
                    const updatedItems = prev.map((item) => (item.id === editingItem.id ? { ...item, ...updated } : item));
                    return updatedItems.sort((a, b) => a.no.localeCompare(b.no, undefined, { numeric: true }));
                });
            } else {
                const created = await execute(() =>
                    api.evaluations.create({
                        ...formData,
                        companyId: user?.companyId,
                    }),
                );
                setItems((prev) => {
                    const updatedItems = [...prev, created];
                    return updatedItems.sort((a, b) => a.no.localeCompare(b.no, undefined, { numeric: true }));
                });
            }
        } catch (error) {
            console.error("Failed to save evaluation:", error);
        }

        setIsDialogOpen(false);
        setEditingItem(null);
        setFormData({});
    };

    const handleDelete = async (id: number) => {
        try {
            await execute(() => api.evaluations.delete(id));
            const updatedItems = items.filter((item) => item.id !== id);
            setItems(updatedItems);
        } catch (error) {
            console.error("Failed to delete evaluation:", error);
        }
    };

    const handleUpdate = async () => {
        if (!user?.companyId) {
            toast({
                title: "오류",
                description: "기업 정보를 찾을 수 없습니다.",
                variant: "destructive",
            });
            return;
        }

        try {
            await execute(() => api.evaluations.updateDefaultItems(user.companyId));

            toast({
                title: "업데이트 완료",
                description: "평가항목이 최신 데이터로 업데이트되었습니다.",
            });

            // 데이터 다시 로드
            const data = await api.evaluations.getAll(user.companyId);
            const sorted = data.sort((a: EvaluationItem, b: EvaluationItem) => {
                return String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
            });
            setItems(sorted);
        } catch (error) {
            console.error("Failed to update evaluations:", error);
            toast({
                title: "업데이트 실패",
                description: "평가항목 업데이트에 실패했습니다.",
                variant: "destructive",
            });
        }
    };

    const handleExcelDownload = () => {
        if (items.length === 0) {
            toast({
                title: "다운로드 실패",
                description: "다운로드할 데이터가 없습니다.",
                variant: "destructive",
            });
            return;
        }

        const excelData = items.map((item) => ({
            "평가영역": item.area,
            "평가분야": item.field,
            "세부분야": item.subField,
            "No.": item.no,
            "평가항목": item.item,
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);

        worksheet["!cols"] = [
            { wch: 30 },
            { wch: 20 },
            { wch: 25 },
            { wch: 10 },
            { wch: 80 },
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "평가항목");

        XLSX.writeFile(workbook, "평가항목.xlsx");

        toast({
            title: "다운로드 완료",
            description: "엑셀 파일이 다운로드되었습니다.",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary">평가항목 목록</h1>
                    <p className="text-muted-foreground mt-2">평가항목을 구성하고 관리합니다</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExcelDownload} disabled={loading || items.length === 0}>
                        <Download className="mr-2 h-4 w-4" />
                        엑셀 다운로드
                    </Button>
                    <Button onClick={handleUpdate} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        업데이트
                    </Button>
                </div>
                {/*<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>*/}
                {/*  <DialogTrigger asChild>*/}
                {/*    <Button onClick={() => handleOpenDialog()}>*/}
                {/*      <Plus className="mr-2 h-4 w-4" />*/}
                {/*      항목 추가*/}
                {/*    </Button>*/}
                {/*  </DialogTrigger>*/}
                {/*  <DialogContent className="max-w-2xl">*/}
                {/*    <DialogHeader>*/}
                {/*      <DialogTitle>{editingItem ? "항목 수정" : "새 항목 추가"}</DialogTitle>*/}
                {/*      <DialogDescription>평가항목의 정보를 입력해주세요</DialogDescription>*/}
                {/*    </DialogHeader>*/}
                {/*    <div className="space-y-4">*/}
                {/*      <div>*/}
                {/*        <Label htmlFor="area">평가영역</Label>*/}
                {/*        <Input*/}
                {/*          id="area"*/}
                {/*          placeholder="예: 1. 개인정보 처리단계별 보호조치"*/}
                {/*          value={formData.area || ""}*/}
                {/*          onChange={(e) => setFormData({ ...formData, area: e.target.value })}*/}
                {/*        />*/}
                {/*      </div>*/}
                {/*      <div>*/}
                {/*        <Label htmlFor="field">평가분야</Label>*/}
                {/*        <Input*/}
                {/*          id="field"*/}
                {/*          placeholder="예: 1.1 수집"*/}
                {/*          value={formData.field || ""}*/}
                {/*          onChange={(e) => setFormData({ ...formData, field: e.target.value })}*/}
                {/*        />*/}
                {/*      </div>*/}
                {/*      <div>*/}
                {/*        <Label htmlFor="subField">세부분야</Label>*/}
                {/*        <Input*/}
                {/*          id="subField"*/}
                {/*          placeholder="예: 개인정보 수집의 적합성"*/}
                {/*          value={formData.subField || ""}*/}
                {/*          onChange={(e) => setFormData({ ...formData, subField: e.target.value })}*/}
                {/*        />*/}
                {/*      </div>*/}
                {/*      <div>*/}
                {/*        <Label htmlFor="no">No.</Label>*/}
                {/*        <Input*/}
                {/*          id="no"*/}
                {/*        placeholder="예: 1.1.1"*/}
                {/*          value={formData.no || ""}*/}
                {/*          onChange={(e) => setFormData({ ...formData, no: e.target.value })}*/}
                {/*        />*/}
                {/*      </div>*/}
                {/*      <div>*/}
                {/*        <Label htmlFor="item">평가항목</Label>*/}
                {/*        <Textarea*/}
                {/*          id="item"*/}
                {/*          placeholder="예: 개인정보를 수집하는 경우 정보주체의 동의를 받거나, 법령 등에 따라 적법하게 수집하도록 계획하고 있습니까?"*/}
                {/*          className="min-h-[100px]"*/}
                {/*          value={formData.item || ""}*/}
                {/*          onChange={(e) => setFormData({ ...formData, item: e.target.value })}*/}
                {/*        />*/}
                {/*      </div>*/}
                {/*      <Button onClick={handleSave} className="w-full">*/}
                {/*        <Save className="mr-2 h-4 w-4" />*/}
                {/*        저장*/}
                {/*      </Button>*/}
                {/*    </div>*/}
                {/*  </DialogContent>*/}
                {/*</Dialog>*/}
            </div>

            <Card>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[120px]">평가영역</TableHead>
                                    <TableHead className="min-w-[120px]">평가분야</TableHead>
                                    <TableHead className="min-w-[150px]">세부분야</TableHead>
                                    <TableHead className="w-[80px]">No.</TableHead>
                                    <TableHead className="min-w-[300px]">평가항목</TableHead>
                                    {/*<TableHead className="w-[100px] text-right">작업</TableHead>*/}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.area}</TableCell>
                                        <TableCell>{item.field}</TableCell>
                                        <TableCell>{item.subField}</TableCell>
                                        <TableCell>{item.no}</TableCell>
                                        <TableCell className="max-w-md">{item.item}</TableCell>
                                        {/*<TableCell className="text-right">*/}
                                        {/*  <div className="flex justify-end gap-2">*/}
                                        {/*    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>*/}
                                        {/*      <Edit className="h-4 w-4" />*/}
                                        {/*    </Button>*/}
                                        {/*    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>*/}
                                        {/*      <Trash2 className="h-4 w-4" />*/}
                                        {/*    </Button>*/}
                                        {/*  </div>*/}
                                        {/*</TableCell>*/}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}