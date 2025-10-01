import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PieChart, RefreshCw, Download, ArrowRight, Database, Shield } from 'lucide-react';

interface FlowNode {
  id: string;
  step: number;
  label: string;
  type: 'source' | 'process' | 'storage' | 'destination';
  x: number;
  y: number;
}

interface FlowConnection {
  from: string;
  to: string;
  label: string;
  dataType: string;
}

const mockFlowNodes: FlowNode[] = [
  { id: 'customer', step: 1, label: '고객', type: 'source', x: 50, y: 150 },
  { id: 'signup', step: 2, label: '회원가입', type: 'process', x: 200, y: 150 },
  { id: 'member-db', step: 3, label: '회원DB', type: 'storage', x: 350, y: 150 },
  { id: 'auth', step: 4, label: '인증서버', type: 'process', x: 200, y: 300 },
  { id: 'app', step: 5, label: '어플리케이션', type: 'destination', x: 500, y: 150 },
];

const mockConnections: FlowConnection[] = [
  { from: 'customer', to: 'signup', label: '정보입력', dataType: '이름, 이메일, 전화번호' },
  { from: 'signup', to: 'member-db', label: '정보저장', dataType: '암호화된 개인정보' },
  { from: 'member-db', to: 'auth', label: '인증요청', dataType: '로그인 정보' },
  { from: 'member-db', to: 'app', label: '프로필 제공', dataType: '사용자 프로필' },
];

export default function ProtectionFlowChart() {
  const [nodes] = useState<FlowNode[]>(mockFlowNodes);
  const [connections] = useState<FlowConnection[]>(mockConnections);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'source':
        return '👤';
      case 'process':
        return '⚙️';
      case 'storage':
        return '🗄️';
      case 'destination':
        return '📱';
      default:
        return '📋';
    }
  };

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case 'source':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'process':
        return 'bg-blue-100 border-blue-300 text-blue-800';  
      case 'storage':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'destination':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const handleGenerateChart = () => {
    // TODO: 흐름표 데이터를 기반으로 차트 자동 생성
    console.log('Generating flow chart from table data...');
  };

  const handleExportChart = () => {
    // TODO: 차트를 이미지 또는 PDF로 내보내기
    console.log('Exporting flow chart...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">개인정보 흐름도</h1>
          <p className="text-muted-foreground mt-2">
            흐름표 데이터를 시각적 다이어그램으로 변환합니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGenerateChart} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            차트 생성
          </Button>
          <Button onClick={handleExportChart} className="bg-pia-secondary hover:bg-pia-secondary-light">
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 흐름도 영역 */}
        <div className="lg:col-span-3">
          <Card className="shadow-pia-card min-h-[500px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-pia-secondary" />
                개인정보 처리 흐름도
              </CardTitle>
              <CardDescription>
                개인정보 처리 과정을 시각적으로 표현한 다이어그램입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-gray-50 rounded-lg p-4 overflow-hidden">
                {/* SVG 기반 플로우차트 */}
                <svg width="100%" height="100%" className="absolute inset-0">
                  {/* 연결선 그리기 */}
                  {connections.map((conn, index) => {
                    const fromNode = nodes.find(n => n.id === conn.from);
                    const toNode = nodes.find(n => n.id === conn.to);
                    if (!fromNode || !toNode) return null;

                    return (
                      <g key={index}>
                        <line
                          x1={fromNode.x + 40}
                          y1={fromNode.y + 20}
                          x2={toNode.x - 10}
                          y2={toNode.y + 20}
                          stroke="#6366f1"
                          strokeWidth="2"
                          markerEnd="url(#arrowhead)"
                        />
                        <text
                          x={(fromNode.x + toNode.x) / 2}
                          y={(fromNode.y + toNode.y) / 2 - 10}
                          textAnchor="middle"
                          className="text-xs fill-gray-600"
                        >
                          {conn.label}
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* 화살표 마커 정의 */}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="#6366f1"
                      />
                    </marker>
                  </defs>
                </svg>

                {/* 노드 그리기 */}
                {nodes.map((node) => (
                  <div
                    key={node.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-105 ${
                      selectedNode === node.id ? 'ring-2 ring-pia-secondary' : ''
                    }`}
                    style={{ left: node.x, top: node.y }}
                    onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                  >
                    <div className={`px-4 py-2 rounded-lg border-2 shadow-sm ${getNodeTypeColor(node.type)}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getNodeTypeIcon(node.type)}</span>
                        <span className="font-medium text-sm">{node.label}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 사이드 패널 */}
        <div className="space-y-4">
          {/* 범례 */}
          <Card className="shadow-pia-card">
            <CardHeader>
              <CardTitle className="text-lg">범례</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="px-2 py-1 rounded bg-green-100 border border-green-300">
                  <span>👤</span>
                </div>
                <span className="text-sm">정보 출처</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-2 py-1 rounded bg-blue-100 border border-blue-300">
                  <span>⚙️</span>
                </div>
                <span className="text-sm">처리 과정</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-2 py-1 rounded bg-purple-100 border border-purple-300">
                  <span>🗄️</span>
                </div>
                <span className="text-sm">저장소</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-2 py-1 rounded bg-orange-100 border border-orange-300">
                  <span>📱</span>
                </div>
                <span className="text-sm">최종 목적지</span>
              </div>
            </CardContent>
          </Card>

          {/* 선택된 노드 정보 */}
          {selectedNode && (
            <Card className="shadow-pia-card">
              <CardHeader>
                <CardTitle className="text-lg">노드 정보</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const node = nodes.find(n => n.id === selectedNode);
                  if (!node) return null;
                  
                  return (
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium">{node.label}</p>
                        <Badge variant="outline" className="mt-1">
                          {node.type === 'source' ? '정보 출처' :
                           node.type === 'process' ? '처리 과정' :
                           node.type === 'storage' ? '저장소' : '최종 목적지'}
                        </Badge>
                      </div>
                      
                      <div className="text-sm space-y-2">
                        <p><strong>처리 단계:</strong> {node.step}</p>
                        <div>
                          <p><strong>연결된 흐름:</strong></p>
                          <ul className="list-disc pl-4 mt-1 space-y-1">
                            {connections
                              .filter(conn => conn.from === node.id || conn.to === node.id)
                              .map((conn, idx) => (
                                <li key={idx} className="text-xs text-muted-foreground">
                                  {conn.label}: {conn.dataType}
                                </li>
                              ))
                            }
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* 통계 정보 */}
          <Card className="shadow-pia-card">
            <CardHeader>
              <CardTitle className="text-lg">처리 현황</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">총 처리 단계</span>
                <Badge variant="outline">{nodes.length}개</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">데이터 흐름</span>
                <Badge variant="outline">{connections.length}개</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">저장소</span>
                <Badge variant="outline">
                  {nodes.filter(n => n.type === 'storage').length}개
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}