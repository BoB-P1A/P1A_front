import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { PieChart, RefreshCw, Download, Save, Camera } from 'lucide-react';
import html2canvas from 'html2canvas';

interface DraggableIcon {
  id: string;
  type: 'handler' | 'subject' | 'arrow-solid' | 'arrow-dashed' | 'arrow-red' | 'db-encrypt' | 
        'online-process' | 'offline-process' | 'mixed-process' | 'system-db' | 'cabinet' | 
        'external-system' | 'internal-system' | 'online-destroy' | 'offline-destroy' | 
        'online-system' | 'offline-task' | 'burst' | 'pc' | 'file' | 'number';
  x: number;
  y: number;
  text: string;
}

interface FlowChartData {
  icons: DraggableIcon[];
}

export default function ProtectionFlowChart() {
  const [taskNames, setTaskNames] = useState<string[]>(['회원가입', '고객상담']);
  const [selectedTask, setSelectedTask] = useState('회원가입');
  const [flowDataByTask, setFlowDataByTask] = useState<Record<string, FlowChartData>>({
    '회원가입': { icons: [] },
    '고객상담': { icons: [] },
  });
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [personalInfoTexts, setPersonalInfoTexts] = useState<Record<string, { row1: string; row2: string; row3: string }>>({});

  useEffect(() => {
    const savedTasks = localStorage.getItem('processingTasks');
    if (savedTasks) {
      const tasks = JSON.parse(savedTasks);
      const taskNamesList = tasks.map((task: any) => task.taskName).filter((name: string) => name.trim() !== '');
      if (taskNamesList.length > 0) {
        setTaskNames(taskNamesList);
        
        const newFlowData = { ...flowDataByTask };
        taskNamesList.forEach((name: string) => {
          if (!newFlowData[name]) {
            newFlowData[name] = { icons: [] };
          }
        });
        setFlowDataByTask(newFlowData);
        
        if (!taskNamesList.includes(selectedTask)) {
          setSelectedTask(taskNamesList[0]);
        }
      }
    }

    const savedFlowData = localStorage.getItem('flowChartData');
    if (savedFlowData) {
      setFlowDataByTask(JSON.parse(savedFlowData));
    }

    const savedPersonalInfoTexts = localStorage.getItem('personalInfoTexts');
    if (savedPersonalInfoTexts) {
      setPersonalInfoTexts(JSON.parse(savedPersonalInfoTexts));
    }
  }, []);

  const addIcon = (type: DraggableIcon['type']) => {
    const newIcon: DraggableIcon = {
      id: Date.now().toString(),
      type,
      x: 100,
      y: 100,
      text: '',
    };

    setFlowDataByTask(prev => ({
      ...prev,
      [selectedTask]: {
        ...prev[selectedTask],
        icons: [...prev[selectedTask].icons, newIcon],
      },
    }));
  };

  const handleDrag = (id: string, x: number, y: number) => {
    setFlowDataByTask(prev => ({
      ...prev,
      [selectedTask]: {
        ...prev[selectedTask],
        icons: prev[selectedTask].icons.map(icon =>
          icon.id === id ? { ...icon, x, y } : icon
        ),
      },
    }));
  };

  const handleTextEdit = (id: string, text: string) => {
    setFlowDataByTask(prev => ({
      ...prev,
      [selectedTask]: {
        ...prev[selectedTask],
        icons: prev[selectedTask].icons.map(icon =>
          icon.id === id ? { ...icon, text } : icon
        ),
      },
    }));
    setEditingText(null);
  };

  const handleSave = () => {
    localStorage.setItem('flowChartData', JSON.stringify(flowDataByTask));
    localStorage.setItem('personalInfoTexts', JSON.stringify(personalInfoTexts));
    alert('저장되었습니다.');
  };

  const handleCaptureFlowChart = async () => {
    const flowChartElement = document.querySelector('.flow-chart-canvas') as HTMLElement;
    if (!flowChartElement) {
      alert('흐름도를 찾을 수 없습니다.');
      return;
    }

    try {
      const canvas = await html2canvas(flowChartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });
      
      const imageData = canvas.toDataURL('image/png');
      
      // Save to localStorage
      const flowChartImages = JSON.parse(localStorage.getItem('flowChartImages') || '{}');
      flowChartImages[selectedTask] = imageData;
      localStorage.setItem('flowChartImages', JSON.stringify(flowChartImages));
      
      alert(`${selectedTask} 흐름도가 이미지로 저장되었습니다.`);
    } catch (error) {
      console.error('Error capturing flow chart:', error);
      alert('흐름도 캡처 중 오류가 발생했습니다.');
    }
  };

  const handleExport = () => {
    if (!selectedTask) return;
    
    // Export as JSON data
    const data = JSON.stringify(flowDataByTask[selectedTask], null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `개인정보_흐름도_${selectedTask}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const renderIcon = (icon: DraggableIcon) => {
    const isSelected = selectedIcon === icon.id;
    const isEditing = editingText === icon.id;

    let style = 'px-4 py-2 rounded border-2 shadow-sm cursor-move';
    let content = icon.text || '텍스트 입력';

    switch (icon.type) {
      case 'handler':
        style += ' bg-gray-400 border-gray-600 text-white';
        content = icon.text || '개인정보취급자';
        break;
      case 'subject':
        style += ' bg-white border-gray-600';
        content = icon.text || '정보주체';
        break;
      case 'db-encrypt':
        style += ' bg-orange-500 border-orange-600 text-white font-semibold';
        content = icon.text || 'DB 암호화';
        break;
      case 'online-process':
        style += ' bg-blue-100 border-blue-500';
        style = style.replace('rounded', '');
        content = icon.text || '온라인 처리업무';
        break;
      case 'offline-process':
        style += ' bg-white border-gray-800 border-dashed';
        style = style.replace('rounded', '');
        content = icon.text || '오프라인 처리업무';
        break;
      case 'mixed-process':
        style += ' bg-blue-100 border-blue-500 border-dashed';
        style = style.replace('rounded', '');
        content = icon.text || '온/오프라인 처리업무';
        break;
      case 'system-db':
        // 원기둥 모양은 특별 렌더링
        return (
          <div
            key={icon.id}
            className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            style={{ left: icon.x, top: icon.y }}
            draggable
            onDragEnd={(e) => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                handleDrag(icon.id, e.clientX - rect.left, e.clientY - rect.top);
              }
            }}
            onClick={() => setSelectedIcon(icon.id)}
            onDoubleClick={() => setEditingText(icon.id)}
          >
            <div className="relative">
              <svg width="100" height="80" viewBox="0 0 100 80">
                <ellipse cx="50" cy="15" rx="40" ry="12" fill="#fef08a" stroke="#ca8a04" strokeWidth="2"/>
                <rect x="10" y="15" width="80" height="50" fill="#fef08a" stroke="none"/>
                <line x1="10" y1="15" x2="10" y2="65" stroke="#ca8a04" strokeWidth="2"/>
                <line x1="90" y1="15" x2="90" y2="65" stroke="#ca8a04" strokeWidth="2"/>
                <ellipse cx="50" cy="65" rx="40" ry="12" fill="#fef08a" stroke="#ca8a04" strokeWidth="2"/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                {isEditing ? (
                  <Input
                    value={icon.text}
                    onChange={(e) => handleTextEdit(icon.id, e.target.value)}
                    onBlur={() => setEditingText(null)}
                    className="w-20 h-6"
                    autoFocus
                  />
                ) : (
                  <span>{icon.text || '시스템 DB'}</span>
                )}
              </div>
            </div>
          </div>
        );
      case 'cabinet':
        // 직육면체 모양
        return (
          <div
            key={icon.id}
            className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            style={{ left: icon.x, top: icon.y }}
            draggable
            onDragEnd={(e) => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                handleDrag(icon.id, e.clientX - rect.left, e.clientY - rect.top);
              }
            }}
            onClick={() => setSelectedIcon(icon.id)}
            onDoubleClick={() => setEditingText(icon.id)}
          >
            <div className="relative">
              <svg width="90" height="70" viewBox="0 0 90 70">
                <polygon points="15,15 65,15 75,5 25,5" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2"/>
                <rect x="15" y="15" width="50" height="45" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2"/>
                <polygon points="65,15 75,5 75,50 65,60" fill="#fde68a" stroke="#f59e0b" strokeWidth="2"/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold" style={{paddingRight: '20px'}}>
                {isEditing ? (
                  <Input
                    value={icon.text}
                    onChange={(e) => handleTextEdit(icon.id, e.target.value)}
                    onBlur={() => setEditingText(null)}
                    className="w-16 h-6"
                    autoFocus
                  />
                ) : (
                  <span>{icon.text || '캐비닛'}</span>
                )}
              </div>
            </div>
          </div>
        );
      case 'external-system':
        // 직육면체 모양 (회색)
        return (
          <div
            key={icon.id}
            className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            style={{ left: icon.x, top: icon.y }}
            draggable
            onDragEnd={(e) => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                handleDrag(icon.id, e.clientX - rect.left, e.clientY - rect.top);
              }
            }}
            onClick={() => setSelectedIcon(icon.id)}
            onDoubleClick={() => setEditingText(icon.id)}
          >
            <div className="relative">
              <svg width="90" height="70" viewBox="0 0 90 70">
                <polygon points="15,15 65,15 75,5 25,5" fill="#d1d5db" stroke="#6b7280" strokeWidth="2"/>
                <rect x="15" y="15" width="50" height="45" fill="#d1d5db" stroke="#6b7280" strokeWidth="2"/>
                <polygon points="65,15 75,5 75,50 65,60" fill="#9ca3af" stroke="#6b7280" strokeWidth="2"/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold" style={{paddingRight: '20px'}}>
                {isEditing ? (
                  <Input
                    value={icon.text}
                    onChange={(e) => handleTextEdit(icon.id, e.target.value)}
                    onBlur={() => setEditingText(null)}
                    className="w-16 h-6"
                    autoFocus
                  />
                ) : (
                  <span>{icon.text || '외부 시스템'}</span>
                )}
              </div>
            </div>
          </div>
        );
      case 'internal-system':
        // 직육면체 모양 (점선)
        return (
          <div
            key={icon.id}
            className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            style={{ left: icon.x, top: icon.y }}
            draggable
            onDragEnd={(e) => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                handleDrag(icon.id, e.clientX - rect.left, e.clientY - rect.top);
              }
            }}
            onClick={() => setSelectedIcon(icon.id)}
            onDoubleClick={() => setEditingText(icon.id)}
          >
            <div className="relative">
              <svg width="90" height="70" viewBox="0 0 90 70">
                <polygon points="15,15 65,15 75,5 25,5" fill="white" stroke="#6b7280" strokeWidth="2" strokeDasharray="4"/>
                <rect x="15" y="15" width="50" height="45" fill="white" stroke="#6b7280" strokeWidth="2" strokeDasharray="4"/>
                <polygon points="65,15 75,5 75,50 65,60" fill="#f3f4f6" stroke="#6b7280" strokeWidth="2" strokeDasharray="4"/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold" style={{paddingRight: '20px'}}>
                {isEditing ? (
                  <Input
                    value={icon.text}
                    onChange={(e) => handleTextEdit(icon.id, e.target.value)}
                    onBlur={() => setEditingText(null)}
                    className="w-16 h-6"
                    autoFocus
                  />
                ) : (
                  <span>{icon.text || '내부 시스템'}</span>
                )}
              </div>
            </div>
          </div>
        );
        break;
      case 'online-destroy':
        style += ' bg-green-400 border-green-600 text-white font-semibold';
        style = style.replace('rounded', '');
        content = icon.text || '온라인 파기';
        break;
      case 'offline-destroy':
        style += ' bg-white border-gray-600 border-dotted';
        style = style.replace('rounded', '');
        content = icon.text || '오프라인 파기';
        break;
      case 'online-system':
        style += ' bg-blue-500 border-blue-700 text-white font-semibold';
        content = icon.text || '온라인 처리 시스템';
        break;
      case 'offline-task':
        style += ' bg-white border-gray-800 border-dashed';
        content = icon.text || '오프라인 처리';
        break;
      case 'burst':
        style += ' bg-red-100 border-red-500';
        content = icon.text || '침해요인';
        break;
      case 'pc':
        style += ' bg-cyan-100 border-cyan-500';
        content = icon.text || '단말PC';
        break;
      case 'file':
        style += ' bg-purple-100 border-purple-400';
        content = icon.text || '문서';
        break;
      case 'number':
        // 숫자 아이콘 - 텍스트 입력 가능 (우측 텍스트 없음)
        return (
          <div
            key={icon.id}
            className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            style={{ left: icon.x, top: icon.y }}
            draggable
            onDragEnd={(e) => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                handleDrag(icon.id, e.clientX - rect.left, e.clientY - rect.top);
              }
            }}
            onClick={() => setSelectedIcon(icon.id)}
            onDoubleClick={() => setEditingText(icon.id)}
          >
            {isEditing ? (
              <Input
                value={icon.text}
                onChange={(e) => handleTextEdit(icon.id, e.target.value)}
                onBlur={() => setEditingText(null)}
                placeholder="텍스트 입력"
                className="w-24 h-10 text-center"
                autoFocus
              />
            ) : (
              <div className="bg-black text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm px-2">
                {icon.text || '1'}
              </div>
            )}
          </div>
        );
        break;
      case 'arrow-solid':
        return (
          <div
            key={icon.id}
            className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            style={{ left: icon.x, top: icon.y }}
            draggable
            onDragEnd={(e) => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                handleDrag(icon.id, e.clientX - rect.left, e.clientY - rect.top);
              }
            }}
            onClick={() => setSelectedIcon(icon.id)}
            onDoubleClick={() => setEditingText(icon.id)}
          >
            <div className="flex items-center gap-2">
              <div className="w-20 h-0.5 bg-black"></div>
              <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-black"></div>
            </div>
            {isEditing ? (
              <Input
                value={icon.text}
                onChange={(e) => handleTextEdit(icon.id, e.target.value)}
                onBlur={() => setEditingText(null)}
                className="mt-1 w-32"
                placeholder="온라인 개인정보 흐름"
                autoFocus
              />
            ) : (
              <div className="text-xs mt-1">{icon.text || '온라인 개인정보 흐름'}</div>
            )}
          </div>
        );
      case 'arrow-dashed':
        return (
          <div
            key={icon.id}
            className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            style={{ left: icon.x, top: icon.y }}
            draggable
            onDragEnd={(e) => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                handleDrag(icon.id, e.clientX - rect.left, e.clientY - rect.top);
              }
            }}
            onClick={() => setSelectedIcon(icon.id)}
            onDoubleClick={() => setEditingText(icon.id)}
          >
            <div className="flex items-center gap-2">
              <div className="w-20 h-0.5 border-t-2 border-dashed border-black"></div>
              <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-black"></div>
            </div>
            {isEditing ? (
              <Input
                value={icon.text}
                onChange={(e) => handleTextEdit(icon.id, e.target.value)}
                onBlur={() => setEditingText(null)}
                className="mt-1 w-32"
                placeholder="오프라인 개인정보 흐름"
                autoFocus
              />
            ) : (
              <div className="text-xs mt-1">{icon.text || '오프라인 개인정보 흐름'}</div>
            )}
          </div>
        );
      case 'arrow-red':
        return (
          <div
            key={icon.id}
            className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            style={{ left: icon.x, top: icon.y }}
            draggable
            onDragEnd={(e) => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                handleDrag(icon.id, e.clientX - rect.left, e.clientY - rect.top);
              }
            }}
            onClick={() => setSelectedIcon(icon.id)}
            onDoubleClick={() => setEditingText(icon.id)}
          >
            <div className="flex items-center gap-2">
              <div className="w-20 h-0.5 bg-red-500"></div>
              <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-red-500"></div>
            </div>
            {isEditing ? (
              <Input
                value={icon.text}
                onChange={(e) => handleTextEdit(icon.id, e.target.value)}
                onBlur={() => setEditingText(null)}
                className="mt-1 w-32"
                placeholder="암호화 전송"
                autoFocus
              />
            ) : (
              <div className="text-xs mt-1">{icon.text || '암호화 전송'}</div>
            )}
          </div>
        );
    }

    // 상단 귀퉁이가 잘린 사각형 처리
    const isClippedTopRight = ['online-process', 'offline-process', 'mixed-process'].includes(icon.type);
    const isClippedTopLeft = ['online-destroy', 'offline-destroy'].includes(icon.type);
    
    let clipPath = '';
    if (isClippedTopRight) {
      clipPath = 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 0 100%)';
    } else if (isClippedTopLeft) {
      clipPath = 'polygon(15px 0, 100% 0, 100% 100%, 0 100%, 0 15px)';
    }

    return (
      <div
        key={icon.id}
        className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        style={{ left: icon.x, top: icon.y, pointerEvents: 'auto' }}
        draggable
        onDragEnd={(e) => {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            handleDrag(icon.id, e.clientX - rect.left, e.clientY - rect.top);
          }
        }}
        onClick={() => setSelectedIcon(icon.id)}
        onDoubleClick={() => setEditingText(icon.id)}
      >
        <div className={style} style={clipPath ? { clipPath } : undefined}>
          {isEditing ? (
            <Input
              value={icon.text}
              onChange={(e) => handleTextEdit(icon.id, e.target.value)}
              onBlur={() => setEditingText(null)}
              className="min-w-[100px]"
              autoFocus
            />
          ) : (
            <span className="text-sm">{content}</span>
          )}
        </div>
      </div>
    );
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
          <Button onClick={handleCaptureFlowChart} variant="outline">
            <Camera className="h-4 w-4 mr-2" />
            이미지 캡처
          </Button>
          <Button onClick={handleSave} variant="outline">
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
          <Button onClick={handleExport} className="bg-pia-secondary hover:bg-pia-secondary-light">
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
        </div>
      </div>

      <Tabs value={selectedTask} onValueChange={setSelectedTask}>
        <TabsList>
          {taskNames.map(t => <TabsTrigger key={t} value={t}>{t}</TabsTrigger>)}
        </TabsList>

        {taskNames.map(task => (
          <TabsContent key={task} value={task} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* 흐름도 캔버스 */}
              <div className="lg:col-span-3">
                <Card className="shadow-pia-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-pia-secondary" />
                      개인정보 처리 흐름도
                    </CardTitle>
                    <CardDescription>
                      아이콘을 드래그하여 배치하고 더블클릭하여 텍스트를 입력하세요
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flow-chart-canvas">
                    <div className="relative h-[55vh] md:h-[60vh] border border-border rounded-lg overflow-hidden">
                      <ResizablePanelGroup direction="horizontal">
                        {/* 개인정보 생명주기 열 (고정) */}
                        <ResizablePanel defaultSize={10} minSize={8} maxSize={15}>
                          <div className="h-full flex flex-col">
                            {/* 헤더 */}
                            <div className="h-12 bg-blue-100 border-b border-r border-border flex items-center justify-center font-semibold text-sm text-center p-2">
                              개인정보<br/>생명주기
                            </div>
                            {/* 본문 */}
                            <div className="flex-1">
                              <ResizablePanelGroup direction="vertical">
                                <ResizablePanel defaultSize={33.33} minSize={15}>
                                  <div className="h-full bg-blue-100 border-r border-b border-border flex items-center justify-center font-semibold text-sm">
                                    수집
                                  </div>
                                </ResizablePanel>
                                <ResizableHandle withHandle />
                                <ResizablePanel defaultSize={33.33} minSize={15}>
                                  <div className="h-full bg-blue-100 border-r border-b border-border flex items-center justify-center font-semibold text-sm text-center p-2">
                                    보유·<br/>이용·<br/>제공
                                  </div>
                                </ResizablePanel>
                                <ResizableHandle withHandle />
                                <ResizablePanel defaultSize={33.33} minSize={15}>
                                  <div className="h-full bg-blue-100 border-r border-border flex items-center justify-center font-semibold text-sm">
                                    파기
                                  </div>
                                </ResizablePanel>
                              </ResizablePanelGroup>
                            </div>
                          </div>
                        </ResizablePanel>

                        <ResizableHandle withHandle />

                        {/* 정보주체/개인정보취급자 열 */}
                        <ResizablePanel defaultSize={18} minSize={10}>
                          <div className="h-full flex flex-col">
                            {/* 헤더 */}
                            <div className="h-12 bg-blue-100 border-b border-r border-border flex items-center justify-center font-semibold text-sm text-center p-2">
                              정보주체/<br/>개인정보취급자
                            </div>
                            {/* 본문 - 세로 분할 */}
                            <div className="flex-1">
                              <ResizablePanelGroup direction="vertical">
                                <ResizablePanel defaultSize={33.33} minSize={15}>
                                  <div className="h-full border-r border-b border-border" />
                                </ResizablePanel>
                                <ResizableHandle className="opacity-0 pointer-events-none" />
                                <ResizablePanel defaultSize={33.33} minSize={15}>
                                  <div className="h-full border-r border-b border-border" />
                                </ResizablePanel>
                                <ResizableHandle className="opacity-0 pointer-events-none" />
                                <ResizablePanel defaultSize={33.33} minSize={15}>
                                  <div className="h-full border-r border-border" />
                                </ResizablePanel>
                              </ResizablePanelGroup>
                            </div>
                          </div>
                        </ResizablePanel>

                        <ResizableHandle withHandle />

                        {/* 개인정보 처리 흐름 열 */}
                        <ResizablePanel defaultSize={36} minSize={20}>
                          <div className="h-full flex flex-col">
                            {/* 헤더 */}
                            <div className="h-12 bg-blue-100 border-b border-r border-border flex items-center justify-center font-semibold text-sm text-center p-2">
                              개인정보 처리 흐름
                            </div>
                            {/* 본문 - 세로 분할 */}
                            <div className="flex-1">
                              <ResizablePanelGroup direction="vertical">
                                <ResizablePanel defaultSize={33.33} minSize={15}>
                                  <div className="h-full border-r border-b border-border" />
                                </ResizablePanel>
                                <ResizableHandle className="opacity-0 pointer-events-none" />
                                <ResizablePanel defaultSize={33.33} minSize={15}>
                                  <div className="h-full border-r border-b border-border" />
                                </ResizablePanel>
                                <ResizableHandle className="opacity-0 pointer-events-none" />
                                <ResizablePanel defaultSize={33.33} minSize={15}>
                                  <div className="h-full border-r border-border" />
                                </ResizablePanel>
                              </ResizablePanelGroup>
                            </div>
                          </div>
                        </ResizablePanel>

                        <ResizableHandle withHandle />

                        {/* 외부연계·제공 열 */}
                        <ResizablePanel defaultSize={18} minSize={10}>
                          <div className="h-full flex flex-col">
                            {/* 헤더 */}
                            <div className="h-12 bg-blue-100 border-b border-r border-border flex items-center justify-center font-semibold text-sm text-center p-2">
                              외부연계·제공
                            </div>
                            {/* 본문 - 세로 분할 */}
                            <div className="flex-1">
                              <ResizablePanelGroup direction="vertical">
                                <ResizablePanel defaultSize={33.33} minSize={15}>
                                  <div className="h-full border-r border-b border-border" />
                                </ResizablePanel>
                                <ResizableHandle className="opacity-0 pointer-events-none" />
                                <ResizablePanel defaultSize={33.33} minSize={15}>
                                  <div className="h-full border-r border-b border-border" />
                                </ResizablePanel>
                                <ResizableHandle className="opacity-0 pointer-events-none" />
                                <ResizablePanel defaultSize={33.33} minSize={15}>
                                  <div className="h-full border-r border-border" />
                                </ResizablePanel>
                              </ResizablePanelGroup>
                            </div>
                          </div>
                        </ResizablePanel>

                        <ResizableHandle withHandle />

                        {/* 처리 개인정보 열 */}
                        <ResizablePanel defaultSize={18} minSize={10} className="relative z-20">
                          <div className="h-full flex flex-col">
                            {/* 헤더 */}
                            <div className="h-12 bg-blue-100 border-b border-border flex items-center justify-center font-semibold text-sm text-center p-2">
                              처리 개인정보
                            </div>
                            {/* 본문 - 세로 분할 */}
                            <div className="flex-1">
                              <ResizablePanelGroup direction="vertical">
                                <ResizablePanel defaultSize={33.33} minSize={15}>
                                  <div className="h-full border-b border-border p-2 relative">
                                    <textarea
                                      className="w-full h-full resize-none border-none outline-none bg-transparent text-xs focus:ring-0"
                                      placeholder="개인정보 입력..."
                                      value={personalInfoTexts[task]?.row1 || ''}
                                      onChange={(e) => {
                                        setPersonalInfoTexts(prev => ({
                                          ...prev,
                                          [task]: { 
                                            row1: e.target.value,
                                            row2: prev[task]?.row2 || '',
                                            row3: prev[task]?.row3 || ''
                                          }
                                        }));
                                      }}
                                    />
                                  </div>
                                </ResizablePanel>
                                <ResizableHandle className="opacity-0 pointer-events-none" />
                                <ResizablePanel defaultSize={33.33} minSize={15}>
                                  <div className="h-full border-b border-border p-2 relative">
                                    <textarea
                                      className="w-full h-full resize-none border-none outline-none bg-transparent text-xs focus:ring-0"
                                      placeholder="개인정보 입력..."
                                      value={personalInfoTexts[task]?.row2 || ''}
                                      onChange={(e) => {
                                        setPersonalInfoTexts(prev => ({
                                          ...prev,
                                          [task]: { 
                                            row1: prev[task]?.row1 || '',
                                            row2: e.target.value,
                                            row3: prev[task]?.row3 || ''
                                          }
                                        }));
                                      }}
                                    />
                                  </div>
                                </ResizablePanel>
                                <ResizableHandle className="opacity-0 pointer-events-none" />
                                <ResizablePanel defaultSize={33.33} minSize={15}>
                                  <div className="h-full p-2 relative">
                                    <textarea
                                      className="w-full h-full resize-none border-none outline-none bg-transparent text-xs focus:ring-0"
                                      placeholder="개인정보 입력..."
                                      value={personalInfoTexts[task]?.row3 || ''}
                                      onChange={(e) => {
                                        setPersonalInfoTexts(prev => ({
                                          ...prev,
                                          [task]: { 
                                            row1: prev[task]?.row1 || '',
                                            row2: prev[task]?.row2 || '',
                                            row3: e.target.value
                                          }
                                        }));
                                      }}
                                    />
                                  </div>
                                </ResizablePanel>
                              </ResizablePanelGroup>
                            </div>
                          </div>
                        </ResizablePanel>
                      </ResizablePanelGroup>

                      {/* Icons overlay */}
                      <div
                        ref={canvasRef}
                        className="absolute left-0 right-0 top-0 bottom-0 z-10"
                        style={{ pointerEvents: 'none' }}
                        onClick={(e) => {
                          if (e.target === e.currentTarget) {
                            setSelectedIcon(null);
                          }
                        }}
                      >
                        {flowDataByTask[task]?.icons.map(icon => renderIcon(icon))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 아이콘 팔레트 */}
              <div className="space-y-4">
                <Card className="shadow-pia-card">
                  <CardHeader>
                    <CardTitle className="text-lg">아이콘 추가</CardTitle>
                    <CardDescription className="text-xs">
                      클릭하여 아이콘을 추가하세요
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-[65vh] overflow-y-auto">
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('handler')}>
                      <div className="w-6 h-6 border-2 border-gray-600 rounded mr-2 bg-gray-400"></div>
                      개인정보취급자
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('subject')}>
                      <div className="w-6 h-6 border-2 border-gray-600 rounded mr-2 bg-white"></div>
                      정보주체
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('arrow-solid')}>
                      <div className="flex items-center mr-2">
                        <div className="w-4 h-0.5 bg-black"></div>
                        <div className="w-0 h-0 border-t-2 border-t-transparent border-b-2 border-b-transparent border-l-4 border-l-black"></div>
                      </div>
                      온라인 개인정보 흐름
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('arrow-dashed')}>
                      <div className="flex items-center mr-2">
                        <div className="w-4 h-0.5 border-t-2 border-dashed border-black"></div>
                        <div className="w-0 h-0 border-t-2 border-t-transparent border-b-2 border-b-transparent border-l-4 border-l-black"></div>
                      </div>
                      오프라인 개인정보 흐름
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('arrow-red')}>
                      <div className="flex items-center mr-2">
                        <div className="w-4 h-0.5 bg-red-500"></div>
                        <div className="w-0 h-0 border-t-2 border-t-transparent border-b-2 border-b-transparent border-l-4 border-l-red-500"></div>
                      </div>
                      암호화 전송
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('db-encrypt')}>
                      <div className="w-6 h-6 bg-orange-500 border-2 border-orange-600 rounded mr-2"></div>
                      DB 암호화
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('online-process')}>
                      <div className="w-6 h-6 bg-blue-100 border-2 border-blue-500 mr-2" style={{clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)'}}></div>
                      온라인 처리업무
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('offline-process')}>
                      <div className="w-6 h-6 bg-white border-2 border-dashed border-gray-800 mr-2" style={{clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)'}}></div>
                      오프라인 처리업무
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('mixed-process')}>
                      <div className="w-6 h-6 bg-blue-100 border-2 border-dashed border-blue-500 mr-2" style={{clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)'}}></div>
                      온/오프라인 처리업무
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('system-db')}>
                      <div className="w-6 h-6 bg-yellow-200 border-2 border-yellow-600 rounded-full mr-2"></div>
                      시스템 DB
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('cabinet')}>
                      <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-500 rounded mr-2"></div>
                      캐비닛
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('external-system')}>
                      <div className="w-6 h-6 bg-gray-300 border-2 border-gray-600 rounded mr-2"></div>
                      외부 시스템
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('internal-system')}>
                      <div className="w-6 h-6 bg-white border-2 border-dashed border-gray-500 rounded mr-2"></div>
                      내부 시스템
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('online-destroy')}>
                      <div className="w-6 h-6 bg-green-400 border-2 border-green-600 mr-2" style={{clipPath: 'polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px)'}}></div>
                      온라인 파기
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('offline-destroy')}>
                      <div className="w-6 h-6 bg-white border-2 border-dotted border-gray-600 mr-2" style={{clipPath: 'polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px)'}}></div>
                      오프라인 파기
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('online-system')}>
                      <div className="w-6 h-6 bg-blue-500 border-2 border-blue-700 rounded mr-2"></div>
                      온라인 처리 시스템
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('offline-task')}>
                      <div className="w-6 h-6 bg-white border-2 border-dashed border-gray-800 rounded mr-2"></div>
                      오프라인 처리
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('burst')}>
                      <div className="w-6 h-6 bg-red-100 border-2 border-red-500 mr-2" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}></div>
                      개인정보 침해요인
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('pc')}>
                      <div className="w-6 h-6 bg-cyan-100 border-2 border-cyan-500 rounded mr-2"></div>
                      개인정보 단말PC
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('file')}>
                      <div className="w-6 h-6 bg-purple-100 border-2 border-purple-400 rounded mr-2"></div>
                      개인정보 문서(스캔파일)
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('number')}>
                      <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
                        1
                      </div>
                      처리되는 개인정보를 구분하기 위한 숫자 표기
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
