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
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

interface Company {
  id: number;
  name: string;
  managerName: string;
  managerPhone: string;
  createdAt: string;
}

export default function CompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const { loading, execute } = useApi();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [companiesData, accountsData] = await Promise.all([
          api.companies.getAll(),
          api.accounts.getAll()
        ]);
        setCompanies(companiesData);
        setAccounts(accountsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, []);

  const getAccountCount = (companyName: string) => {
    return accounts.filter(account => account.company === companyName).length;
  };

  const getTotalAccountCount = () => {
    return accounts.length;
  };

  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    managerName: '',
    managerPhone: '',
  });

  const handleOpenDialog = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name,
        managerName: company.managerName,
        managerPhone: company.managerPhone,
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: '',
        managerName: '',
        managerPhone: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('회사명은 필수 입력 항목입니다.');
      return;
    }

    try {
      if (editingCompany) {
        const updated = await execute(() => api.companies.update(editingCompany.id.toString(), formData));
        setCompanies(prev => prev.map(company => 
          company.id === editingCompany.id ? updated : company
        ));
      } else {
        const created = await execute(() => api.companies.create(formData));
        setCompanies(prev => [...prev, created]);
      }

      setIsDialogOpen(false);
      setEditingCompany(null);
      setFormData({ name: '', managerName: '', managerPhone: '' });
    } catch (error) {
      console.error('Failed to save company:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        await execute(() => api.companies.delete(String(id)));
        setCompanies(companies.filter(company => company.id !== id));
      } catch (error) {
        console.error('Failed to delete company:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">기업 관리</h1>
          <p className="text-muted-foreground mt-2">
            기업 정보를 관리하고 현황을 확인합니다
          </p>
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
              <DialogTitle>
                {editingCompany ? '기업 정보 수정' : '새 기업 추가'}
              </DialogTitle>
              <DialogDescription>
                기업의 기본 정보를 입력해주세요
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">기업명</Label>
                <Input 
                  id="name" 
                  placeholder="기업명을 입력하세요" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="managerName">담당자 이름</Label>
                <Input 
                  id="managerName" 
                  placeholder="담당자 이름을 입력하세요" 
                  value={formData.managerName}
                  onChange={(e) => setFormData({...formData, managerName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="managerPhone">담당자 연락처</Label>
                <Input 
                  id="managerPhone" 
                  placeholder="010-0000-0000" 
                  value={formData.managerPhone}
                  onChange={(e) => setFormData({...formData, managerPhone: e.target.value})}
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                저장
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getTotalAccountCount()}
            </div>
            <p className="text-xs text-muted-foreground">모든 기업의 사용자</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>기업 목록</CardTitle>
          <CardDescription>
            등록된 기업 정보를 확인하고 관리할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  <TableCell>{company.managerName}</TableCell>
                  <TableCell>{company.managerPhone}</TableCell>
                  <TableCell>{getAccountCount(company.name)}개</TableCell>
                  <TableCell>{company.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleOpenDialog(company)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(company.id)}
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
