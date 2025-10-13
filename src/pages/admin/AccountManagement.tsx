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

interface Account {
  id: string;
  name: string;
  username: string;
  password: string;
  role: UserRole;
  company: string;
  createdAt: string;
}

interface Company {
  id: number;
  name: string;
}

export default function AccountManagement() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: '' as UserRole | '',
    company: '',
  });
  const { loading, execute } = useApi();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [accountsData, companiesData] = await Promise.all([
          api.accounts.getAll(),
          api.companies.getAll()
        ]);
        setAccounts(accountsData);
        setCompanies(companiesData.map((c: any) => ({ id: c.id, name: c.name })));
      } catch (error) {
        console.error('Failed to load data:', error);
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
        username: account.username,
        password: account.password,
        role: account.role,
        company: account.company,
      });
    } else {
      setEditingAccount(null);
      setFormData({
        name: '',
        username: '',
        password: '',
        role: '',
        company: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.username || !formData.password || !formData.role || !formData.company) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    // 아이디 중복 체크
    const isDuplicate = accounts.some(account => 
      account.username === formData.username && 
      (!editingAccount || account.id !== editingAccount.id)
    );

    if (isDuplicate) {
      alert('이미 존재하는 아이디입니다. 다른 아이디를 입력해주세요.');
      return;
    }

    try {
      if (editingAccount) {
        await execute(() => api.accounts.update(editingAccount.id, formData));
        setAccounts(accounts.map(a => 
          a.id === editingAccount.id 
            ? { ...a, ...formData, role: formData.role as UserRole }
            : a
        ));
      } else {
        const newAccount: Account = {
          id: Date.now().toString(),
          ...formData,
          role: formData.role as UserRole,
          createdAt: new Date().toISOString().split('T')[0],
        };
        await execute(() => api.accounts.create(newAccount));
        setAccounts([...accounts, newAccount]);
      }
      
      setIsDialogOpen(false);
      setEditingAccount(null);
      setFormData({ name: '', username: '', password: '', role: '', company: '' });
    } catch (error) {
      console.error('Failed to save account:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        await execute(() => api.accounts.delete(id));
        setAccounts(accounts.filter(account => account.id !== id));
      } catch (error) {
        console.error('Failed to delete account:', error);
      }
    }
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                <Label htmlFor="name">이름</Label>
                <Input 
                  id="name" 
                  placeholder="이름을 입력하세요" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="username">아이디</Label>
                <Input 
                  id="username" 
                  placeholder="아이디를 입력하세요" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="password">비밀번호</Label>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="비밀번호를 입력하세요" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="company">기업</Label>
                <Select value={formData.company} onValueChange={(value) => setFormData({...formData, company: value})}>
                  <SelectTrigger id="company">
                    <SelectValue placeholder="기업 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.name}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="role">역할</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value as UserRole})}>
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
              <Button onClick={handleSave} className="w-full">
                저장
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>아이디</TableHead>
                <TableHead>기업</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>{account.username}</TableCell>
                  <TableCell>{account.company}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(account.role)}>
                      {getRoleDisplayName(account.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>{account.createdAt}</TableCell>
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
                        onClick={() => handleDelete(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
