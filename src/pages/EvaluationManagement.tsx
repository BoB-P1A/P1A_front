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
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

interface ChecklistItem {
  id: number;
  category: string;
  item: string;
  description: string;
  required: boolean;
}

export default function EvaluationManagement() {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    {
      id: 1,
      category: '개인정보 수집',
      item: '수집 목적 명시',
      description: '개인정보 수집 시 명확한 목적을 명시해야 합니다.',
      required: true,
    },
    {
      id: 2,
      category: '개인정보 보관',
      item: '암호화 조치',
      description: '개인정보는 암호화하여 보관해야 합니다.',
      required: true,
    },
    {
      id: 3,
      category: '개인정보 파기',
      item: '파기 절차 수립',
      description: '개인정보 파기를 위한 절차를 수립해야 합니다.',
      required: false,
    },
  ]);

  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = () => {
    // 저장 로직
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: number) => {
    setChecklistItems(checklistItems.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">영향평가 관리 페이지</h1>
          <p className="text-muted-foreground mt-2">
            체크리스트 항목을 구성하고 관리합니다
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(null)}>
              <Plus className="mr-2 h-4 w-4" />
              항목 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? '항목 수정' : '새 항목 추가'}
              </DialogTitle>
              <DialogDescription>
                체크리스트 항목의 정보를 입력해주세요
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">카테고리</Label>
                <Input id="category" placeholder="예: 개인정보 수집" />
              </div>
              <div>
                <Label htmlFor="item">항목명</Label>
                <Input id="item" placeholder="예: 수집 목적 명시" />
              </div>
              <div>
                <Label htmlFor="description">설명</Label>
                <Textarea id="description" placeholder="항목에 대한 설명을 입력하세요" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="required" />
                <Label htmlFor="required">필수 항목</Label>
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
          <CardTitle>체크리스트 항목 목록</CardTitle>
          <CardDescription>
            담당자가 체크리스트 항목을 구성, 수정, 삭제할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>카테고리</TableHead>
                <TableHead>항목명</TableHead>
                <TableHead>설명</TableHead>
                <TableHead>필수</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checklistItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell>{item.item}</TableCell>
                  <TableCell className="max-w-md truncate">{item.description}</TableCell>
                  <TableCell>
                    <Badge variant={item.required ? 'default' : 'secondary'}>
                      {item.required ? '필수' : '선택'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setEditingItem(item);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(item.id)}
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
