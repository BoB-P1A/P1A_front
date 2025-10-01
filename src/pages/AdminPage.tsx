import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Crown, Users, Building, Plus, Edit, UserCheck, BarChart3 } from 'lucide-react';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  permissions: {
    read: boolean;
    write: boolean;
    execute: boolean;
  };
}

interface CompanyInfo {
  id: string;
  name: string;
  industry: string;
  userCount: number;
  assessmentCount: number;
  status: 'active' | 'trial' | 'expired';
  lastActivity: string;
}

const mockUsers: UserAccount[] = [
  {
    id: '1',
    name: '김개발',
    email: 'dev@pia.com',
    role: 'developer',
    company: 'PIA Corp',
    status: 'active',
    lastLogin: '2024-01-15 14:30',
    permissions: { read: true, write: true, execute: false }
  },
  {
    id: '2',
    name: '박개인정보',
    email: 'privacy@pia.com',
    role: 'privacy-team',
    company: 'PIA Corp',
    status: 'active',
    lastLogin: '2024-01-15 09:15',
    permissions: { read: true, write: true, execute: true }
  },
  {
    id: '3',
    name: '이매니저',
    email: 'manager@techcorp.com',
    role: 'developer',
    company: 'Tech Corp',
    status: 'pending',
    lastLogin: '-',
    permissions: { read: true, write: false, execute: false }
  }
];

const mockCompanies: CompanyInfo[] = [
  {
    id: '1',
    name: 'PIA Corp',
    industry: 'IT 서비스',
    userCount: 5,
    assessmentCount: 12,
    status: 'active',
    lastActivity: '2024-01-15'
  },
  {
    id: '2',
    name: 'Tech Corp',
    industry: '소프트웨어',
    userCount: 3,
    assessmentCount: 3,
    status: 'trial',
    lastActivity: '2024-01-10'
  },
  {
    id: '3',
    name: 'Data Solutions',
    industry: '데이터 분석',
    userCount: 1,
    assessmentCount: 0,
    status: 'expired',
    lastActivity: '2023-12-20'
  }
];

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>(mockUsers);
  const [companies] = useState<CompanyInfo[]>(mockCompanies);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'developer' as UserRole,
    company: '',
    permissions: { read: true, write: false, execute: false }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary">활성</Badge>;
      case 'inactive':
        return <Badge variant="outline">비활성</Badge>;
      case 'pending':
        return <Badge variant="default">대기</Badge>;
      case 'trial':
        return <Badge variant="outline">체험</Badge>;
      case 'expired':
        return <Badge variant="destructive">만료</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'admin': return '관리자';
      case 'developer': return '개발팀';
      case 'privacy-team': return '개인정보팀';
      default: return role;
    }
  };

  const handleCreateUser = () => {
    const user: UserAccount = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      company: newUser.company,
      status: 'pending',
      lastLogin: '-',
      permissions: newUser.permissions
    };
    
    setUsers(prev => [...prev, user]);
    setNewUser({
      name: '',
      email: '',
      role: 'developer',
      company: '',
      permissions: { read: true, write: false, execute: false }
    });
    setIsCreateUserOpen(false);
  };

  const handleUpdateUser = (userId: string, field: keyof UserAccount, value: any) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, [field]: value } : user
    ));
  };

  const handleUpdatePermissions = (userId: string, permission: keyof UserAccount['permissions'], value: boolean) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, permissions: { ...user.permissions, [permission]: value } }
        : user
    ));
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Crown className="h-8 w-8 text-pia-secondary" />
            관리자 페이지
          </h1>
          <p className="text-muted-foreground mt-2">
            시스템 사용자 및 기업 관리 대시보드입니다
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          관리자: {user?.name}
        </Badge>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-pia-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">전체 사용자</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-primary">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">활성 사용자: {activeUsers}명</p>
          </CardContent>
        </Card>

        <Card className="shadow-pia-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">등록 기업</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-primary">{totalCompanies}</div>
            <p className="text-xs text-muted-foreground">활성 기업: {activeCompanies}개</p>
          </CardContent>
        </Card>

        <Card className="shadow-pia-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 평가 건수</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-primary">
              {companies.reduce((sum, c) => sum + c.assessmentCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">진행 중인 평가</p>
          </CardContent>
        </Card>

        <Card className="shadow-pia-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">시스템 상태</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-600">정상</div>
            <p className="text-xs text-muted-foreground">모든 서비스 정상 운영</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 사용자 관리 */}
        <Card className="shadow-pia-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-pia-primary" />
                사용자 관리
              </CardTitle>
              <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-pia-secondary hover:bg-pia-secondary-light">
                    <Plus className="h-4 w-4 mr-2" />
                    사용자 추가
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>새 사용자 추가</DialogTitle>
                    <DialogDescription>
                      시스템에 새로운 사용자를 추가합니다
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">이름</Label>
                        <Input
                          id="name"
                          value={newUser.name}
                          onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">이메일</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="role">역할</Label>
                        <Select value={newUser.role} onValueChange={(value: UserRole) => setNewUser(prev => ({ ...prev, role: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="developer">개발팀</SelectItem>
                            <SelectItem value="privacy-team">개인정보팀</SelectItem>
                            <SelectItem value="admin">관리자</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">회사</Label>
                        <Input
                          id="company"
                          value={newUser.company}
                          onChange={(e) => setNewUser(prev => ({ ...prev, company: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>권한 설정</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newUser.permissions.read}
                            onChange={(e) => setNewUser(prev => ({ 
                              ...prev, 
                              permissions: { ...prev.permissions, read: e.target.checked }
                            }))}
                          />
                          <span className="text-sm">읽기</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newUser.permissions.write}
                            onChange={(e) => setNewUser(prev => ({ 
                              ...prev, 
                              permissions: { ...prev.permissions, write: e.target.checked }
                            }))}
                          />
                          <span className="text-sm">쓰기</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newUser.permissions.execute}
                            onChange={(e) => setNewUser(prev => ({ 
                              ...prev, 
                              permissions: { ...prev.permissions, execute: e.target.checked }
                            }))}
                          />
                          <span className="text-sm">실행</span>
                        </label>
                      </div>
                    </div>
                    <Button 
                      onClick={handleCreateUser} 
                      className="w-full bg-pia-primary hover:bg-pia-secondary"
                      disabled={!newUser.name || !newUser.email}
                    >
                      사용자 추가
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription>시스템 사용자 계정을 관리합니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{user.name}</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(user.status)}
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-2">
                      <Badge variant="outline">{getRoleDisplayName(user.role)}</Badge>
                      <Badge variant="outline">{user.company}</Badge>
                    </div>
                    <div className="flex gap-1 text-xs">
                      <span className={user.permissions.read ? 'text-green-600' : 'text-gray-400'}>R</span>
                      <span className={user.permissions.write ? 'text-green-600' : 'text-gray-400'}>W</span>
                      <span className={user.permissions.execute ? 'text-green-600' : 'text-gray-400'}>X</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 기업 관리 */}
        <Card className="shadow-pia-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-pia-secondary" />
              기업 관리 대시보드
            </CardTitle>
            <CardDescription>등록된 기업들의 현황을 관리합니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companies.map((company) => (
                <div key={company.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{company.name}</h4>
                      <p className="text-sm text-muted-foreground">{company.industry}</p>
                    </div>
                    {getStatusBadge(company.status)}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">사용자 수</span>
                      <p className="font-medium">{company.userCount}명</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">평가 건수</span>
                      <p className="font-medium">{company.assessmentCount}건</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">최근 활동</span>
                      <p className="font-medium">{company.lastActivity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 상세 사용자 테이블 */}
      <Card className="shadow-pia-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-pia-primary" />
            사용자 상세 정보
          </CardTitle>
          <CardDescription>모든 사용자의 상세 정보와 권한을 관리합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>회사</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>권한</TableHead>
                <TableHead>최근 로그인</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getRoleDisplayName(user.role)}</Badge>
                  </TableCell>
                  <TableCell>{user.company}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 text-xs">
                      <span className={`px-1 rounded ${user.permissions.read ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                        R
                      </span>
                      <span className={`px-1 rounded ${user.permissions.write ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                        W
                      </span>
                      <span className={`px-1 rounded ${user.permissions.execute ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                        X
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.lastLogin}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
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