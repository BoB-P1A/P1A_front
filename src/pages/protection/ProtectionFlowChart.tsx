import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { PieChart, RefreshCw, Download, Save } from 'lucide-react';

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
    alert('저장되었습니다.');
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
        style += ' bg-gray-100 border-gray-400';
        content = icon.text || '개인정보취급자';
        break;
      case 'subject':
        style += ' bg-gray-100 border-gray-400';
        content = icon.text || '정보주체';
        break;
      case 'db-encrypt':
        style += ' bg-orange-500 border-orange-600 text-white font-semibold';
        content = icon.text || 'DB 암호화';
        break;
      case 'online-process':
        style += ' bg-blue-100 border-blue-500';
        content = icon.text || '온라인 처리업무';
        break;
      case 'offline-process':
        style += ' bg-white border-gray-800 border-dashed';
        content = icon.text || '오프라인 처리업무';
        break;
      case 'mixed-process':
        style += ' bg-white border-gray-800 border-dashed';
        content = icon.text || '온/오프라인 처리업무';
        break;
      case 'system-db':
        style += ' bg-yellow-200 border-yellow-600 rounded-full px-6 py-4';
        content = icon.text || '시스템 DB';
        break;
      case 'cabinet':
        style += ' bg-yellow-100 border-yellow-500';
        content = icon.text || '캐비닛';
        break;
      case 'external-system':
        style += ' bg-amber-100 border-amber-600';
        content = icon.text || '외부 시스템';
        break;
      case 'internal-system':
        style += ' bg-white border-gray-500 border-dashed';
        content = icon.text || '내부 시스템';
        break;
      case 'online-destroy':
        style += ' bg-green-400 border-green-600 text-white font-semibold';
        content = icon.text || '온라인 파기';
        break;
      case 'offline-destroy':
        style += ' bg-white border-gray-600 border-dotted';
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
        style += ' bg-black text-white rounded-full w-10 h-10 flex items-center justify-center p-0';
        content = icon.text || '1';
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
                autoFocus
              />
            ) : (
              icon.text && <div className="text-xs mt-1">{icon.text}</div>
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
                autoFocus
              />
            ) : (
              icon.text && <div className="text-xs mt-1">{icon.text}</div>
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
                autoFocus
              />
            ) : (
              icon.text && <div className="text-xs mt-1">{icon.text}</div>
            )}
          </div>
        );
    }

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
        <div className={style}>
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
                  <CardContent>
                    <div className="relative h-[55vh] md:h-[60vh] border border-border rounded-lg overflow-hidden">
                      {/* HEADER ROW */}
                      <div className="flex h-12 border-b border-border">
                        <div className="w-[100px] bg-blue-100 border-r border-border flex items-center justify-center font-semibold text-sm text-center p-2">
                          개인정보<br/>생명주기
                        </div>
                        <ResizablePanelGroup direction="horizontal" className="flex-1">
                          <ResizablePanel defaultSize={20} minSize={10}>
                            <div className="h-full">
                              <div className="h-12 bg-blue-100 border-r border-border flex items-center justify-center font-semibold text-sm text-center p-2">
                                정보주체/<br/>개인정보취급자
                              </div>
                            </div>
                          </ResizablePanel>
                          <ResizableHandle withHandle />
                          <ResizablePanel defaultSize={40} minSize={20}>
                            <div className="h-full">
                              <div className="h-12 bg-blue-100 border-r border-border flex items-center justify-center font-semibold text-sm text-center p-2">
                                개인정보 처리 흐름
                              </div>
                            </div>
                          </ResizablePanel>
                          <ResizableHandle withHandle />
                          <ResizablePanel defaultSize={20} minSize={10}>
                            <div className="h-full">
                              <div className="h-12 bg-blue-100 border-r border-border flex items-center justify-center font-semibold text-sm text-center p-2">
                                외부연계·제공
                              </div>
                            </div>
                          </ResizablePanel>
                          <ResizableHandle withHandle />
                          <ResizablePanel defaultSize={20} minSize={10}>
                            <div className="h-full">
                              <div className="h-12 bg-blue-100 flex items-center justify-center font-semibold text-sm text-center p-2">
                                처리 개인정보
                              </div>
                            </div>
                          </ResizablePanel>
                        </ResizablePanelGroup>
                      </div>

                      {/* BODY AREA with Resizable Rows */}
                      <div className="relative h-[calc(100%-3rem)]">
                        <ResizablePanelGroup direction="vertical" className="h-full">
                          {/* 수집 Row */}
                          <ResizablePanel defaultSize={33.33} minSize={15}>
                            <div className="flex h-full">
                              {/* Left fixed row label */}
                              <div className="w-[100px] bg-blue-100 border-r border-b border-border flex items-center justify-center font-semibold text-sm">
                                수집
                              </div>

                              {/* Resizable columns */}
                              <ResizablePanelGroup direction="horizontal" className="flex-1">
                                <ResizablePanel defaultSize={20} minSize={10}>
                                  <div className="h-full border-r border-b border-border p-2" />
                                </ResizablePanel>
                                <ResizableHandle withHandle />
                                <ResizablePanel defaultSize={40} minSize={20}>
                                  <div className="h-full border-r border-b border-border p-2" />
                                </ResizablePanel>
                                <ResizableHandle withHandle />
                                <ResizablePanel defaultSize={20} minSize={10}>
                                  <div className="h-full border-r border-b border-border p-2" />
                                </ResizablePanel>
                                <ResizableHandle withHandle />
                                <ResizablePanel defaultSize={20} minSize={10}>
                                  <div className="h-full border-b border-border p-2" />
                                </ResizablePanel>
                              </ResizablePanelGroup>
                            </div>
                          </ResizablePanel>

                          <ResizableHandle withHandle />

                          {/* 보유·이용·제공 Row */}
                          <ResizablePanel defaultSize={33.33} minSize={15}>
                            <div className="flex h-full">
                              <div className="w-[100px] bg-blue-100 border-r border-b border-border flex items-center justify-center font-semibold text-sm text-center p-2">
                                보유·<br/>이용·<br/>제공
                              </div>

                              <ResizablePanelGroup direction="horizontal" className="flex-1">
                                <ResizablePanel defaultSize={20} minSize={10}>
                                  <div className="h-full border-r border-b border-border p-2" />
                                </ResizablePanel>
                                <ResizableHandle withHandle />
                                <ResizablePanel defaultSize={40} minSize={20}>
                                  <div className="h-full border-r border-b border-border p-2" />
                                </ResizablePanel>
                                <ResizableHandle withHandle />
                                <ResizablePanel defaultSize={20} minSize={10}>
                                  <div className="h-full border-r border-b border-border p-2" />
                                </ResizablePanel>
                                <ResizableHandle withHandle />
                                <ResizablePanel defaultSize={20} minSize={10}>
                                  <div className="h-full border-b border-border p-2" />
                                </ResizablePanel>
                              </ResizablePanelGroup>
                            </div>
                          </ResizablePanel>

                          <ResizableHandle withHandle />

                          {/* 파기 Row */}
                          <ResizablePanel defaultSize={33.33} minSize={15}>
                            <div className="flex h-full">
                              <div className="w-[100px] bg-blue-100 border-r border-border flex items-center justify-center font-semibold text-sm">
                                파기
                              </div>

                              <ResizablePanelGroup direction="horizontal" className="flex-1">
                                <ResizablePanel defaultSize={20} minSize={10}>
                                  <div className="h-full border-r border-border p-2" />
                                </ResizablePanel>
                                <ResizableHandle withHandle />
                                <ResizablePanel defaultSize={40} minSize={20}>
                                  <div className="h-full border-r border-border p-2" />
                                </ResizablePanel>
                                <ResizableHandle withHandle />
                                <ResizablePanel defaultSize={20} minSize={10}>
                                  <div className="h-full border-r border-border p-2" />
                                </ResizablePanel>
                                <ResizableHandle withHandle />
                                <ResizablePanel defaultSize={20} minSize={10}>
                                  <div className="h-full p-2" />
                                </ResizablePanel>
                              </ResizablePanelGroup>
                            </div>
                          </ResizablePanel>
                        </ResizablePanelGroup>

                        {/* Icons overlay spanning the entire body area */}
                        <div
                          ref={canvasRef}
                          className="absolute left-[100px] right-0 top-0 bottom-0 z-10 pointer-events-auto"
                          onClick={(e) => {
                            if (e.target === e.currentTarget) {
                              setSelectedIcon(null);
                            }
                          }}
                        >
                          {flowDataByTask[task]?.icons.map(icon => renderIcon(icon))}
                        </div>
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
                      <div className="w-6 h-6 border-2 border-gray-400 rounded mr-2 bg-gray-100"></div>
                      개인정보취급자
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('subject')}>
                      <div className="w-6 h-6 border-2 border-gray-400 rounded mr-2 bg-gray-100"></div>
                      정보주체
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('arrow-solid')}>
                      <div className="flex items-center mr-2">
                        <div className="w-4 h-0.5 bg-black"></div>
                        <div className="w-0 h-0 border-t-2 border-t-transparent border-b-2 border-b-transparent border-l-4 border-l-black"></div>
                      </div>
                      실선 화살표
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('arrow-dashed')}>
                      <div className="flex items-center mr-2">
                        <div className="w-4 h-0.5 border-t-2 border-dashed border-black"></div>
                        <div className="w-0 h-0 border-t-2 border-t-transparent border-b-2 border-b-transparent border-l-4 border-l-black"></div>
                      </div>
                      점선 화살표
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('arrow-red')}>
                      <div className="flex items-center mr-2">
                        <div className="w-4 h-0.5 bg-red-500"></div>
                        <div className="w-0 h-0 border-t-2 border-t-transparent border-b-2 border-b-transparent border-l-4 border-l-red-500"></div>
                      </div>
                      빨간색 화살표
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('db-encrypt')}>
                      <div className="w-6 h-6 bg-orange-500 border-2 border-orange-600 rounded mr-2"></div>
                      DB 암호화
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('online-process')}>
                      <div className="w-6 h-6 bg-blue-100 border-2 border-blue-500 rounded mr-2"></div>
                      온라인 처리업무
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('offline-process')}>
                      <div className="w-6 h-6 bg-white border-2 border-dashed border-gray-800 rounded mr-2"></div>
                      오프라인 처리업무
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('mixed-process')}>
                      <div className="w-6 h-6 bg-white border-2 border-dashed border-gray-800 rounded mr-2"></div>
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
                      <div className="w-6 h-6 bg-amber-100 border-2 border-amber-600 rounded mr-2"></div>
                      외부 시스템
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('internal-system')}>
                      <div className="w-6 h-6 bg-white border-2 border-dashed border-gray-500 rounded mr-2"></div>
                      내부 시스템
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('online-destroy')}>
                      <div className="w-6 h-6 bg-green-400 border-2 border-green-600 rounded mr-2"></div>
                      온라인 파기
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs" onClick={() => addIcon('offline-destroy')}>
                      <div className="w-6 h-6 bg-white border-2 border-dotted border-gray-600 rounded mr-2"></div>
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
                      <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center mr-2 text-xs">
                        1
                      </div>
                      처리되는 개인정보 숫자
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
