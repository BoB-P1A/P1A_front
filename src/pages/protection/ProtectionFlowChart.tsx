import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, RefreshCw, Download, Save } from 'lucide-react';

interface DraggableIcon {
  id: string;
  type: 'box' | 'arrow' | 'db' | 'system' | 'burst' | 'pc' | 'file' | 'number';
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

    let style = 'px-4 py-2 rounded-lg border-2 shadow-sm cursor-move';
    let content = icon.text || '텍스트 입력';

    switch (icon.type) {
      case 'box':
        style += ' bg-gray-100 border-gray-400';
        break;
      case 'db':
        style += ' bg-orange-100 border-orange-400 rounded-full';
        break;
      case 'system':
        style += ' bg-blue-100 border-blue-400';
        break;
      case 'burst':
        style += ' bg-red-100 border-red-400';
        break;
      case 'pc':
        style += ' bg-cyan-100 border-cyan-400';
        break;
      case 'file':
        style += ' bg-purple-100 border-purple-400';
        break;
      case 'number':
        style += ' bg-black text-white border-black rounded-full w-10 h-10 flex items-center justify-center';
        break;
      case 'arrow':
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
                <Card className="shadow-pia-card min-h-[600px]">
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
                    <div
                      ref={canvasRef}
                      className="relative h-[500px] bg-gray-50 rounded-lg p-4 overflow-hidden border-2 border-dashed"
                      onClick={(e) => {
                        if (e.target === e.currentTarget) {
                          setSelectedIcon(null);
                        }
                      }}
                    >
                      {flowDataByTask[task]?.icons.map(icon => renderIcon(icon))}
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
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addIcon('box')}
                    >
                      <div className="w-6 h-6 border-2 border-gray-400 rounded mr-2"></div>
                      개인정보취급자 / 정보주체
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addIcon('arrow')}
                    >
                      <div className="flex items-center mr-2">
                        <div className="w-4 h-0.5 bg-black"></div>
                        <div className="w-0 h-0 border-t-2 border-t-transparent border-b-2 border-b-transparent border-l-4 border-l-black"></div>
                      </div>
                      화살표
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addIcon('db')}
                    >
                      <div className="w-6 h-6 bg-orange-100 border-2 border-orange-400 rounded-full mr-2"></div>
                      DB 암호화
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addIcon('system')}
                    >
                      <div className="w-6 h-6 bg-blue-100 border-2 border-blue-400 rounded mr-2"></div>
                      온라인 / 오프라인 처리업무
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addIcon('burst')}
                    >
                      <div className="w-6 h-6 bg-red-100 border-2 border-red-400 mr-2" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}></div>
                      개인정보 침해요인
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addIcon('pc')}
                    >
                      <div className="w-6 h-6 bg-cyan-100 border-2 border-cyan-400 rounded mr-2"></div>
                      개인정보 단말PC
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addIcon('file')}
                    >
                      <div className="w-6 h-6 bg-purple-100 border-2 border-purple-400 rounded mr-2"></div>
                      개인정보 문서(스캔파일)
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addIcon('number')}
                    >
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
