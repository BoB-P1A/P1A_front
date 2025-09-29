import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Eye, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface EvaluationRequestData {
  id: string;
  title: string;
  requestBy: string;
  department: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  description: string;
}

const mockRequests: EvaluationRequestData[] = [
  {
    id: 'REQ-001',
    title: '회원가입 시스템 개인정보 영향평가',
    requestBy: '김개발',
    department: '개발팀',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2024-01-15',
    description: '신규 회원가입 시스템에 대한 개인정보 영향평가 요청'
  },
  {
    id: 'REQ-002',
    title: '마케팅 데이터 수집 영향평가',
    requestBy: '박마케팅',
    department: '마케팅팀',
    status: 'pending',
    priority: 'medium',
    createdAt: '2024-01-14',
    description: '고객 마케팅 데이터 수집 및 활용에 대한 영향평가'
  },
  {
    id: 'REQ-003',
    title: 'HR 시스템 업그레이드 영향평가',
    requestBy: '최인사',
    department: '인사팀',
    status: 'completed',
    priority: 'low',
    createdAt: '2024-01-10',
    description: 'HR 시스템 업그레이드에 따른 개인정보 처리 영향평가'
  }
];

export default function EvaluationRequest() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<EvaluationRequestData[]>(mockRequests);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    priority: 'medium' as const
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">대기</Badge>;
      case 'in-progress':
        return <Badge variant="default">진행중</Badge>;
      case 'completed':
        return <Badge variant="secondary">완료</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">높음</Badge>;
      case 'medium':
        return <Badge variant="outline">보통</Badge>;
      case 'low':
        return <Badge variant="secondary">낮음</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const handleCreateRequest = () => {
    const newId = `REQ-${String(requests.length + 1).padStart(3, '0')}`;
    const createdRequest: EvaluationRequestData = {
      id: newId,
      title: newRequest.title,
      requestBy: user?.name || '사용자',
      department: user?.role === 'developer' ? '개발팀' : '기타',
      status: 'pending',
      priority: newRequest.priority,
      createdAt: new Date().toISOString().split('T')[0],
      description: newRequest.description
    };

    setRequests([createdRequest, ...requests]);
    setNewRequest({ title: '', description: '', priority: 'medium' });
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">영향평가 요청</h1>
          <p className="text-muted-foreground mt-2">
            개인정보 영향평가 요청을 생성하고 관리합니다
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-pia-primary hover:bg-pia-secondary">
              <Plus className="h-4 w-4 mr-2" />
              요청 생성
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>새 영향평가 요청</DialogTitle>
              <DialogDescription>
                새로운 개인정보 영향평가 요청을 생성합니다
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  placeholder="영향평가 제목을 입력하세요"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  placeholder="영향평가에 대한 설명을 입력하세요"
                  value={newRequest.description}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">우선순위</Label>
                <select
                  id="priority"
                  className="w-full p-2 border rounded-md"
                  value={newRequest.priority}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, priority: e.target.value as any }))}
                >
                  <option value="low">낮음</option>
                  <option value="medium">보통</option>
                  <option value="high">높음</option>
                </select>
              </div>
              <Button 
                onClick={handleCreateRequest} 
                className="w-full bg-pia-primary hover:bg-pia-secondary"
                disabled={!newRequest.title}
              >
                요청 생성
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-pia-card">
        <CardHeader>
          <CardTitle>영향평가 요청 목록</CardTitle>
          <CardDescription>
            총 {requests.length}개의 요청이 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>요청 ID</TableHead>
                <TableHead>제목</TableHead>
                <TableHead>요청자</TableHead>
                <TableHead>부서</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>우선순위</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-mono text-sm">{request.id}</TableCell>
                  <TableCell className="font-medium">{request.title}</TableCell>
                  <TableCell>{request.requestBy}</TableCell>
                  <TableCell>{request.department}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                  <TableCell>{request.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
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