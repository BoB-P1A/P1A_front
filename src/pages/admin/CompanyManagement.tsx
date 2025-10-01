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
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  businessNumber: string;
  representative: string;
  address: string;
  userCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function CompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: 1,
      name: 'PIA Corp',
      businessNumber: '123-45-67890',
      representative: '홍길동',
      address: '서울시 강남구 테헤란로 123',
      userCount: 15,
      status: 'active',
      createdAt: '2024-01-01',
    },
    {
      id: 2,
      name: '테크기업',
      businessNumber: '987-65-43210',
      representative: '김철수',
      address: '서울시 서초구 서초대로 456',
      userCount: 8,
      status: 'active',
      createdAt: '2024-01-15',
    },
  ]);

  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = () => {
    setIsDialogOpen(false);
    setEditingCompany(null);
  };

  const handleDelete = (id: number) => {
    setCompanies(companies.filter(company => company.id !== id));
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
            <Button onClick={() => setEditingCompany(null)}>
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
                <Input id="name" placeholder="기업명을 입력하세요" />
              </div>
              <div>
                <Label htmlFor="businessNumber">사업자등록번호</Label>
                <Input id="businessNumber" placeholder="000-00-00000" />
              </div>
              <div>
                <Label htmlFor="representative">대표자</Label>
                <Input id="representative" placeholder="대표자명을 입력하세요" />
              </div>
              <div>
                <Label htmlFor="address">주소</Label>
                <Input id="address" placeholder="주소를 입력하세요" />
              </div>
              <Button onClick={handleSave} className="w-full">
                저장
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <CardTitle className="text-sm font-medium">활성 기업</CardTitle>
            <Building2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">활성화된 기업</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.reduce((acc, c) => acc + c.userCount, 0)}
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
                <TableHead>사업자번호</TableHead>
                <TableHead>대표자</TableHead>
                <TableHead>사용자 수</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.businessNumber}</TableCell>
                  <TableCell>{company.representative}</TableCell>
                  <TableCell>{company.userCount}명</TableCell>
                  <TableCell>
                    <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                      {company.status === 'active' ? '활성' : '비활성'}
                    </Badge>
                  </TableCell>
                  <TableCell>{company.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setEditingCompany(company);
                          setIsDialogOpen(true);
                        }}
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
