import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Edit, Trash2, Save } from 'lucide-react';

interface EvaluationItem {
  id: number;
  area: string;
  field: string;
  subField: string;
  no: string;
  item: string;
}

export default function EvaluationManagement() {
  const [items, setItems] = useState<EvaluationItem[]>([
    {
      id: 1,
      area: '개인정보 처리단계별 보호조치',
      field: '개인정보 수집',
      subField: '개인정보보안관리 등록',
      no: '2.2.2',
      item: '대상시스템에서 개인정보보안관리를 진행할 보유하거나 기초입력을 받았다는 점검 개인정보보안관리의 이행 확보하도록 계획하고 있습니까?',
    },
    {
      id: 2,
      area: '개인정보 처리단계별 보호조치',
      field: '개인정보 처리방침의 공개',
      subField: '개인정보 처리방침의 공개',
      no: '2.3.1',
      item: '대상시스템에 대한 개인정보 처리방침을 수립하거나 변경하는 경우에는 인터넷 홈페이지 관리 등에 접촉 주제가 잘게 확고하면 수 있도록 게시하고 있습니까?',
    },
  ]);

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

  const handleSave = () => {
    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData } as EvaluationItem
          : item
      ));
    } else {
      const newItem: EvaluationItem = {
        id: Date.now(),
        area: formData.area || '',
        field: formData.field || '',
        subField: formData.subField || '',
        no: formData.no || '',
        item: formData.item || '',
      };
      setItems([...items, newItem]);
    }
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleDelete = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">영향평가 관리 페이지</h1>
          <p className="text-muted-foreground mt-2">
            평가항목을 구성하고 관리합니다
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              항목 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? '항목 수정' : '새 항목 추가'}
              </DialogTitle>
              <DialogDescription>
                평가항목의 정보를 입력해주세요
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="area">평가영역</Label>
                <Input 
                  id="area" 
                  placeholder="예: 개인정보 처리단계별 보호조치"
                  value={formData.area || ''}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="field">평가분야</Label>
                <Input 
                  id="field" 
                  placeholder="예: 개인정보 수집"
                  value={formData.field || ''}
                  onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="subField">세부분야</Label>
                <Input 
                  id="subField" 
                  placeholder="예: 개인정보보안관리 등록"
                  value={formData.subField || ''}
                  onChange={(e) => setFormData({ ...formData, subField: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="no">No.</Label>
                <Input 
                  id="no" 
                  placeholder="예: 2.2.2"
                  value={formData.no || ''}
                  onChange={(e) => setFormData({ ...formData, no: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="item">평가항목</Label>
                <Textarea 
                  id="item" 
                  placeholder="평가항목의 내용을 입력하세요"
                  className="min-h-[100px]"
                  value={formData.item || ''}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                저장
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>평가항목 목록</CardTitle>
          <CardDescription>
            담당자가 평가항목을 구성, 수정, 삭제할 수 있습니다
          </CardDescription>
        </CardHeader>
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
                  <TableHead className="w-[100px] text-right">작업</TableHead>
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenDialog(item)}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
