import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Edit, Trash2, Building2, Users } from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { toast } from "@/hooks/use-toast";

interface Company {
    id: string;
    name: string;
    contactName: string;
    contactPhone: string;
    createdAt: string;
    accounts?: any[];
}

export default function CompanyManagement() {
    const [companies, setCompanies] = useState<Company[]>([]);
    // const [accounts, setAccounts] = useState<any[]>([]);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        contactName: "",
        contactPhone: "",
    });
    const { execute } = useApi();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // const [companiesData, accountsData] = await Promise.all([
            //     api.companies.getAll(),
            //     api.accounts.getAll()
            // ]);

            const companiesData = await api.companies.getAll();
            setCompanies(Array.isArray(companiesData) ? companiesData : []);


            // setAccounts(Array.isArray(accountsData) ? accountsData : []);
        } catch (error) {
            console.error("Failed to load data:", error);
            setCompanies([]);
            // setAccounts([]);
            toast({
                title: "데이터 로딩 실패",
                description: "기업 정보를 불러오는데 실패했습니다.",
                variant: "destructive",
            });
        }
    };

    // const getAccountCount = (companyName: string) => {
    //     return accounts.filter((account) => account.company === companyName).length;
    // };
    //
    // const getTotalAccountCount = () => {
    //     return accounts.length;
    // };

    // Company 내부의 accounts 배열 길이를 반환
    const getAccountCount = (companyName: string) => {
        const company = companies.find((c) => c.name === companyName);
        return company?.accounts?.length || 0;
    };

    // 전체 계정 수 계산
    const getTotalAccountCount = () => {
        return companies.reduce((total, company) => {
            return total + (company.accounts?.length || 0);
        }, 0);
    };

    const handleOpenDialog = (company?: Company) => {
        if (company) {
            setEditingCompany(company);
            setFormData({
                name: company.name,
                contactName: company.contactName,
                contactPhone: company.contactPhone,
            });
        } else {
            setEditingCompany(null);
            setFormData({
                name: "",
                contactName: "",
                contactPhone: "",
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        // 유효성 검증
        if (!formData.name.trim()) {
            toast({
                title: "입력 오류",
                description: "기업명은 필수 입력 항목입니다.",
                variant: "destructive",
            });
            return;
        }

        try {
            if (editingCompany) {
                // 기업 정보 수정
                const updated = await execute(() => api.companies.update(editingCompany.id, formData));
                setCompanies((prev) =>
                    prev.map((company) => (company.id === editingCompany.id ? updated : company))
                );
                toast({
                    title: "수정 완료",
                    description: `${formData.name} 기업 정보가 수정되었습니다.`,
                });
            } else {
                // 새 기업 추가
                const created = await execute(() => api.companies.create(formData));
                setCompanies((prev) => [...prev, created]);
                toast({
                    title: "추가 완료",
                    description: `${formData.name} 기업이 추가되었습니다.`,
                });
            }

            // 다이얼로그 닫기 및 폼 초기화
            setIsDialogOpen(false);
            setEditingCompany(null);
            setFormData({ name: "", contactName: "", contactPhone: "" });
        } catch (error: any) {
            console.error("Failed to save company:", error);
            toast({
                title: "저장 실패",
                description: error.response?.data?.message || "기업 정보 저장에 실패했습니다.",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string) => {
        const company = companies.find((c) => c.id === id);
        if (!company) return;

        const accountCount = getAccountCount(company.name);

        let confirmMessage = `정말 "${company.name}" 기업을 삭제하시겠습니까?`;
        if (accountCount > 0) {
            confirmMessage += `\n\n⚠️ 주의: 이 기업에는 ${accountCount}개의 계정이 연결되어 있습니다.`;
        }

        if (!confirm(confirmMessage)) return;

        try {
            await execute(() => api.companies.delete(id));
            setCompanies(companies.filter((company) => company.id !== id));
            toast({
                title: "삭제 완료",
                description: `${company.name} 기업이 삭제되었습니다.`,
            });
        } catch (error: any) {
            console.error("Failed to delete company:", error);
            toast({
                title: "삭제 실패",
                description: error.response?.data?.message || "기업 삭제에 실패했습니다.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary">기업 관리</h1>
                    <p className="text-muted-foreground mt-2">기업 정보를 관리하고 현황을 확인합니다</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()}>
                            <Plus className="mr-2 h-4 w-4" />
                            기업 추가
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCompany ? "기업 정보 수정" : "새 기업 추가"}</DialogTitle>
                            <DialogDescription>기업의 기본 정보를 입력해주세요</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">
                                    기업명 <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="기업명을 입력하세요"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="contactName">
                                    담당자 이름
                                </Label>
                                <Input
                                    id="contactName"
                                    placeholder="담당자 이름을 입력하세요"
                                    value={formData.contactName}
                                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="contactPhone">
                                    담당자 연락처
                                </Label>
                                <Input
                                    id="contactPhone"
                                    placeholder="010-0000-0000"
                                    value={formData.contactPhone}
                                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                />
                            </div>
                            <Button onClick={handleSave} className="w-full">
                                {editingCompany ? "수정" : "저장"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">전체 기업</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{companies.length}</div>
                        <p className="text-xs text-muted-foreground">등록된 기업 수</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{getTotalAccountCount()}</div>
                        <p className="text-xs text-muted-foreground">모든 기업의 사용자</p>
                    </CardContent>
                </Card>
            </div>

            {/* 기업 목록 테이블 */}
            <Card>
                <CardHeader>
                    <CardTitle>기업 목록</CardTitle>
                    <CardDescription>등록된 기업 정보를 확인하고 관리할 수 있습니다</CardDescription>
                </CardHeader>
                <CardContent>
                    {companies.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">등록된 기업이 없습니다.</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                상단의 "기업 추가" 버튼을 클릭하여 새 기업을 추가하세요.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>기업명</TableHead>
                                    <TableHead>담당자 이름</TableHead>
                                    <TableHead>담당자 연락처</TableHead>
                                    <TableHead>계정 개수</TableHead>
                                    <TableHead>등록일</TableHead>
                                    <TableHead className="text-right">작업</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {companies.map((company) => (
                                    <TableRow key={company.id}>
                                        <TableCell className="font-medium">{company.name}</TableCell>
                                        <TableCell>{company.contactName}</TableCell>
                                        <TableCell>{company.contactPhone}</TableCell>
                                        <TableCell>{getAccountCount(company.name)}개</TableCell>
                                        <TableCell>{company.createdAt}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenDialog(company)}
                                                    title="수정"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(company.id)}
                                                    title="삭제"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}