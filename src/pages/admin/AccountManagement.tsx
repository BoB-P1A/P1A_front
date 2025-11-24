import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { UserRole } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { toast } from '@/hooks/use-toast';

interface Account {
    _id: string;
    name: string;
    loginId: string;
    passwordHash?: string;
    role: UserRole;
    companyId: string;
    companyName: string;
    createdAt?: string;
    updatedAt?: string;
}

interface Company {
    _id: string;
    name: string;
    contactName: string;
    contactPhone: string;
}

export default function AccountManagement() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectKey, setSelectKey] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        loginId: '',
        password: '',
        role: '' as UserRole | '',
        companyId: '',
    });
    const { execute } = useApi();

    useEffect(() => {
        const loadData = async () => {
            try {
                const companiesData = await api.companies.getAll();
                setCompanies(Array.isArray(companiesData) ? companiesData : []);

                const accountsData = await api.accounts.getAll();
                setAccounts(Array.isArray(accountsData) ? accountsData : []);
            } catch (error) {
                console.error('Failed to load data:', error);
                setCompanies([]);
                setAccounts([]);
                toast({
                    title: '데이터 로딩 실패',
                    description: '데이터를 불러오는 중 오류가 발생했습니다.',
                    variant: 'destructive',
                });
            }
        };
        loadData();
    }, []);

    const getRoleDisplayName = (role: UserRole) => {
        switch (role) {
            case 'admin': return '관리자';
            case 'developer': return '개발팀';
            case 'privacy-team': return '개인정보팀';
            case 'planning-team': return '사업주관팀';
            default: return role;
        }
    };

    const getRoleBadgeVariant = (role: UserRole) => {
        switch (role) {
            case 'admin': return 'default';
            case 'developer': return 'secondary';
            case 'planning-team': return 'secondary';
            default: return 'outline';
        }
    };

    const handleOpenDialog = (account?: Account) => {
        if (account) {
            setEditingAccount(account);
            setFormData({
                name: account.name,
                loginId: account.loginId,
                password: '',
                role: account.role,
                companyId: account.companyId,
            });
        } else {
            setEditingAccount(null);
            setFormData({
                name: '',
                loginId: '',
                password: '',
                role: '',
                companyId: '',
            });
        }
        setSelectKey(prev => prev + 1);
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.loginId || !formData.role || !formData.companyId) {
            toast({
                title: '입력 오류',
                description: '이름, 아이디, 역할, 기업은 필수 입력 항목입니다.',
                variant: 'destructive',
            });
            return;
        }

        const isDuplicate = accounts.some(
            (acc) => acc.loginId === formData.loginId && acc._id !== editingAccount?._id
        );

        if (isDuplicate) {
            toast({
                title: '중복 오류',
                description: '이미 사용 중인 아이디입니다.',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsSubmitting(true);

            if (editingAccount) {
                // 기업이 변경되었는지 확인
                const companyChanged = editingAccount.companyId !== formData.companyId;

                const updateData: any = {
                    name: formData.name,
                    loginId: formData.loginId,
                    role: formData.role,
                    companyId: formData.companyId,
                };

                if (formData.password) {
                    updateData.passwordHash = formData.password;
                }

                // 기존 기업의 계정을 업데이트 (또는 기업이 변경된 경우에도 원래 companyId 사용)
                const updated = await execute(() =>
                    api.accounts.update(editingAccount.companyId, editingAccount._id, updateData)
                );

                setAccounts(prev => prev.map(acc =>
                    acc._id === editingAccount._id ? updated : acc
                ));

                toast({
                    title: '수정 완료',
                    description: companyChanged
                        ? '계정이 성공적으로 수정되었습니다. 기업도 변경되었습니다.'
                        : '계정이 성공적으로 수정되었습니다.',
                });
            } else {
                if (!formData.password) {
                    toast({
                        title: '입력 오류',
                        description: '비밀번호는 필수 입력 항목입니다.',
                        variant: 'destructive',
                    });
                    return;
                }

                const createData = {
                    name: formData.name,
                    loginId: formData.loginId,
                    passwordHash: formData.password,
                    role: formData.role,
                };

                const created = await execute(() =>
                    api.accounts.create(formData.companyId, createData)
                );
                setAccounts(prev => [...prev, created]);
                toast({
                    title: '생성 완료',
                    description: '계정이 성공적으로 생성되었습니다.',
                });
            }

            setEditingAccount(null);
            setFormData({ name: '', loginId: '', password: '', role: '', companyId: '' });
            setIsDialogOpen(false);
        } catch (error: any) {
            console.error('Failed to save account:', error);
            const errorMessage = error.response?.data?.message || '계정 저장 중 오류가 발생했습니다.';
            toast({
                title: '저장 실패',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (account: Account) => {
        if (!confirm(`${account.name}(${account.loginId}) 계정을 정말 삭제하시겠습니까?`)) {
            return;
        }

        try {
            await execute(() => api.accounts.delete(account.companyId, account._id));
            setAccounts(accounts.filter(acc => acc._id !== account._id));
            toast({
                title: '삭제 완료',
                description: '계정이 성공적으로 삭제되었습니다.',
            });
        } catch (error: any) {
            console.error('Failed to delete account:', error);
            const errorMessage = error.response?.data?.message || '계정 삭제 중 오류가 발생했습니다.';
            toast({
                title: '삭제 실패',
                description: errorMessage,
                variant: 'destructive',
            });
        }
    };

    // 날짜 포맷 함수 수정: 백엔드에서 이미 포맷된 문자열을 그대로 반환
    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return dateString;  // 백엔드에서 "2025-11-07 18:32:54" 형식으로 이미 포맷됨
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary">계정 및 권한 관리</h1>
                    <p className="text-muted-foreground mt-2">
                        사용자 계정을 생성하고 권한을 관리합니다
                    </p>
                </div>
                <Dialog
                    open={isDialogOpen}
                    onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) {
                            setEditingAccount(null);
                            setFormData({ name: '', loginId: '', password: '', role: '', companyId: '' });
                        }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()}>
                            <Plus className="mr-2 h-4 w-4" />
                            계정 생성
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingAccount ? '계정 수정' : '새 계정 생성'}
                            </DialogTitle>
                            <DialogDescription>
                                사용자 정보와 권한을 설정해주세요
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="company">기업 *</Label>
                                <select
                                    id="company"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.companyId}
                                    onChange={(e) => setFormData({...formData, companyId: e.target.value})}
                                >
                                    <option value="">기업 선택</option>
                                    {companies.map((company) => (
                                        <option key={company._id} value={company._id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="name">이름 *</Label>
                                <Input
                                    id="name"
                                    placeholder="이름을 입력하세요"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label htmlFor="loginId">아이디 *</Label>
                                <Input
                                    id="loginId"
                                    placeholder="아이디를 입력하세요"
                                    value={formData.loginId}
                                    onChange={(e) => setFormData({...formData, loginId: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label htmlFor="password">
                                    비밀번호 {editingAccount ? '(변경 시에만 입력)' : '*'}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder={editingAccount ? '변경하지 않으려면 비워두세요' : '비밀번호를 입력하세요'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label htmlFor="role">역할 *</Label>
                                <Select
                                    key={`role-${selectKey}`}
                                    value={formData.role}
                                    onValueChange={(value) => {
                                        setFormData({...formData, role: value as UserRole});
                                    }}
                                >
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="역할 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">관리자</SelectItem>
                                        <SelectItem value="developer">개발팀</SelectItem>
                                        <SelectItem value="privacy-team">개인정보팀</SelectItem>
                                        <SelectItem value="planning-team">사업주관팀</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleSave} className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? '저장 중...' : '저장'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>계정 목록</CardTitle>
                    <CardDescription>
                        전체 사용자 계정과 권한을 확인할 수 있습니다
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {accounts.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            등록된 계정이 없습니다
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>이름</TableHead>
                                    <TableHead>아이디</TableHead>
                                    <TableHead>기업</TableHead>
                                    <TableHead>역할</TableHead>
                                    <TableHead>생성일시</TableHead>
                                    <TableHead>수정일시</TableHead>
                                    <TableHead className="text-right">작업</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accounts.map((account) => (
                                    <TableRow key={account._id}>
                                        <TableCell className="font-medium">{account.name}</TableCell>
                                        <TableCell>{account.loginId}</TableCell>
                                        <TableCell>{account.companyName}</TableCell>
                                        <TableCell>
                                            <Badge variant={getRoleBadgeVariant(account.role)}>
                                                {getRoleDisplayName(account.role)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatDate(account.createdAt)}</TableCell>
                                        <TableCell>{formatDate(account.updatedAt)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenDialog(account)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(account)}
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