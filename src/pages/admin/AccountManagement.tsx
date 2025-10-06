import { useState } from 'react';
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

interface Account {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
  createdAt: string;
}

export default function AccountManagement() {
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: 'admin',
      name: '관리자',
      email: 'admin@pia.com',
      role: 'admin',
      company: 'PIA Corp',
      createdAt: '2024-01-01',
    },
    {
      id: 'developer',
      name: '김개발',
      email: 'dev@pia.com',
      role: 'developer',
      company: 'PIA Corp',
      createdAt: '2024-01-15',
    },
    {
      id: 'privacy',
      name: '박개인정보',
      email: 'privacy@pia.com',
      role: 'privacy-team',
      company: 'PIA Corp',
      createdAt: '2024-01-20',
    },
    {
      id: 'plan',
      name: '최기획',
      email: 'plan@pia.com',
      role: 'planning-team',
      company: 'PIA Corp',
      createdAt: '2024-01-10',
    },
  ]);

  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      default: return 'outline';
    }
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    setEditingAccount(null);
  };

  const handleDelete = (id: string) => {
    setAccounts(accounts.filter(account => account.id !== id));
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
            <Button onClick={() => setEditingAccount(null)}>
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
                <Input id="name" placeholder="이름을 입력하세요" />
              </div>
              <div>
                <Label htmlFor="email">이메일</Label>
                <Input id="email" type="email" placeholder="email@example.com" />
              </div>
              <div>
                <Label htmlFor="role">역할</Label>
                <Select>
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
              <div>
                <Label htmlFor="company">회사</Label>
                <Input id="company" placeholder="회사명을 입력하세요" />
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
                <TableHead>이메일</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>회사</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(account.role)}>
                      {getRoleDisplayName(account.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>{account.company}</TableCell>
                  <TableCell>{account.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setEditingAccount(account);
                          setIsDialogOpen(true);
                        }}
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
