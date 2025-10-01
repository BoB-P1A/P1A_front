import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Save, Plus, Trash2, GitBranch } from 'lucide-react';

interface FlowData {
  id: string;
  step: number;
  source: string;
  process: string;
  destination: string;
  dataType: string;
  purpose: string;
  retention: string;
  protection: string;
}

const initialFlowData: FlowData[] = [
  {
    id: '1',
    step: 1,
    source: '고객',
    process: '회원가입',
    destination: '회원DB',
    dataType: '이름, 이메일, 전화번호',
    purpose: '서비스 이용계약',
    retention: '회원탈퇴 후 5년',
    protection: '암호화, 접근제어'
  },
  {
    id: '2',
    step: 2,
    source: '회원DB',
    process: '로그인 인증',
    destination: '인증서버',
    dataType: '이메일, 비밀번호',
    purpose: '본인 인증',
    retention: '즉시 삭제',
    protection: '해시화, SSL'
  },
  {
    id: '3',
    step: 3,
    source: '회원DB',
    process: '서비스 이용',
    destination: '어플리케이션',
    dataType: '사용자 프로필',
    purpose: '서비스 제공',
    retention: '이용 중',
    protection: '세션 관리, 암호화'
  }
];

export default function ProtectionFlowTable() {
  const [flowData, setFlowData] = useState<FlowData[]>(initialFlowData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const handleEdit = (id: string, field: keyof FlowData, value: string | number) => {
    setFlowData(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
    setHasChanges(true);
  };

  const handleAddFlow = () => {
    const newFlow: FlowData = {
      id: Date.now().toString(),
      step: flowData.length + 1,
      source: '',
      process: '',
      destination: '',
      dataType: '',
      purpose: '',
      retention: '',
      protection: ''
    };
    setFlowData(prev => [...prev, newFlow]);
    setEditingId(newFlow.id);
    setHasChanges(true);
  };

  const handleDeleteFlow = (id: string) => {
    setFlowData(prev => {
      const filtered = prev.filter(item => item.id !== id);
      // 단계 번호 재정렬
      return filtered.map((item, index) => ({ ...item, step: index + 1 }));
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    setEditingId(null);
    setHasChanges(false);
    // TODO: API 호출로 저장
    console.log('Saving flow table:', flowData);
  };

  const protectionOptions = [
    '암호화',
    '접근제어',
    '해시화',
    'SSL/TLS',
    '세션 관리',
    '로그 모니터링',
    '백업 관리'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">개인정보 흐름표</h1>
          <p className="text-muted-foreground mt-2">
            개인정보 처리 흐름을 단계별로 정의하고 관리합니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddFlow} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            단계 추가
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-pia-secondary hover:bg-pia-secondary-light"
            disabled={!hasChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
        </div>
      </div>

      <Card className="shadow-pia-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-pia-secondary" />
            개인정보 처리 흐름
          </CardTitle>
          <CardDescription>
            개인정보가 수집부터 파기까지 어떤 경로로 처리되는지 단계별로 기록합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">단계</TableHead>
                  <TableHead className="w-[120px]">출발지</TableHead>
                  <TableHead className="w-[150px]">처리과정</TableHead>
                  <TableHead className="w-[120px]">도착지</TableHead>
                  <TableHead className="w-[180px]">개인정보 유형</TableHead>
                  <TableHead className="w-[150px]">처리목적</TableHead>
                  <TableHead className="w-[120px]">보유기간</TableHead>
                  <TableHead className="w-[150px]">보호조치</TableHead>
                  <TableHead className="w-[80px]">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flowData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-center font-medium">
                      {item.step}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={item.source}
                          onChange={(e) => handleEdit(item.id, 'source', e.target.value)}
                          className="min-w-[100px]"
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingId(item.id)} 
                          className="cursor-pointer hover:bg-accent/10 p-1 rounded"
                        >
                          {item.source}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={item.process}
                          onChange={(e) => handleEdit(item.id, 'process', e.target.value)}
                          className="min-w-[130px]"
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingId(item.id)} 
                          className="cursor-pointer hover:bg-accent/10 p-1 rounded"
                        >
                          {item.process}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={item.destination}
                          onChange={(e) => handleEdit(item.id, 'destination', e.target.value)}
                          className="min-w-[100px]"
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingId(item.id)} 
                          className="cursor-pointer hover:bg-accent/10 p-1 rounded"
                        >
                          {item.destination}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={item.dataType}
                          onChange={(e) => handleEdit(item.id, 'dataType', e.target.value)}
                          className="min-w-[160px]"
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingId(item.id)} 
                          className="cursor-pointer hover:bg-accent/10 p-1 rounded text-sm"
                        >
                          {item.dataType}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={item.purpose}
                          onChange={(e) => handleEdit(item.id, 'purpose', e.target.value)}
                          className="min-w-[130px]"
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingId(item.id)} 
                          className="cursor-pointer hover:bg-accent/10 p-1 rounded text-sm"
                        >
                          {item.purpose}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={item.retention}
                          onChange={(e) => handleEdit(item.id, 'retention', e.target.value)}
                          className="min-w-[100px]"
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingId(item.id)} 
                          className="cursor-pointer hover:bg-accent/10 p-1 rounded text-sm"
                        >
                          {item.retention}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Select 
                          value={item.protection} 
                          onValueChange={(value) => handleEdit(item.id, 'protection', value)}
                        >
                          <SelectTrigger className="min-w-[130px]">
                            <SelectValue placeholder="보호조치 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            {protectionOptions.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span 
                          onClick={() => setEditingId(item.id)} 
                          className="cursor-pointer hover:bg-accent/10 p-1 rounded text-sm"
                        >
                          {item.protection}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFlow(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-pia-card">
        <CardHeader>
          <CardTitle>작성 가이드</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">작성 요령</h4>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>개인정보 처리의 전체 흐름을 시간순으로 기록</li>
                <li>각 단계별 출발지와 도착지를 명확히 표시</li>
                <li>처리되는 개인정보의 유형을 구체적으로 명시</li>
                <li>각 단계에서 적용되는 보호조치 기록</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">주요 보호조치</h4>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>암호화: 저장 및 전송 시 데이터 암호화</li>
                <li>접근제어: 권한 기반 접근 제한</li>
                <li>해시화: 비밀번호 등 민감정보 해시 처리</li>
                <li>SSL/TLS: 네트워크 전송 보안</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}