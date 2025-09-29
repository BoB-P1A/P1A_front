import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Save, RefreshCw } from 'lucide-react';

interface LifecycleItem {
  id: string;
  phase: string;
  category: string;
  item: string;
  description: string;
  mandatory: boolean;
  checked: boolean;
}

const lifecycleData: LifecycleItem[] = [
  // 수집 단계
  { id: '1', phase: '수집', category: '동의', item: '개인정보 수집·이용 동의 획득', description: '명시적이고 구체적인 동의 절차 구현', mandatory: true, checked: false },
  { id: '2', phase: '수집', category: '고지', item: '개인정보 처리방침 고지', description: '수집 시점에 처리방침 안내', mandatory: true, checked: false },
  { id: '3', phase: '수집', category: '최소화', item: '최소한의 개인정보만 수집', description: '목적에 필요한 최소한의 정보만 수집', mandatory: true, checked: false },
  { id: '4', phase: '수집', category: '검증', item: '수집 정보의 정확성 검증', description: '수집된 개인정보의 정확성 확인', mandatory: false, checked: false },

  // 이용 단계
  { id: '5', phase: '이용', category: '목적제한', item: '수집 목적 범위 내에서만 이용', description: '명시된 목적 외 이용 금지', mandatory: true, checked: false },
  { id: '6', phase: '이용', category: '접근제어', item: '개인정보 접근권한 관리', description: '최소권한 원칙에 따른 접근제어', mandatory: true, checked: false },
  { id: '7', phase: '이용', category: '암호화', item: '개인정보 암호화 처리', description: '민감정보 및 고유식별정보 암호화', mandatory: true, checked: false },
  { id: '8', phase: '이용', category: '로그관리', item: '개인정보 처리 로그 기록', description: '처리 이력 추적 가능하도록 로그 관리', mandatory: false, checked: false },

  // 제공 단계
  { id: '9', phase: '제공', category: '동의', item: '제3자 제공 동의 획득', description: '제3자 제공 시 별도 동의 획득', mandatory: true, checked: false },
  { id: '10', phase: '제공', category: '계약', item: '개인정보 처리 위탁계약 체결', description: '위탁업체와의 개인정보 보호 계약', mandatory: true, checked: false },
  { id: '11', phase: '제공', category: '관리감독', item: '수탁업체 관리·감독', description: '위탁업체의 개인정보 처리 현황 점검', mandatory: true, checked: false },

  // 보관 단계
  { id: '12', phase: '보관', category: '기간관리', item: '보유기간 준수', description: '법정 보유기간 또는 동의한 기간 준수', mandatory: true, checked: false },
  { id: '13', phase: '보관', category: '분리보관', item: '보관 개인정보 분리 저장', description: '이용중인 정보와 분리하여 보관', mandatory: true, checked: false },
  { id: '14', phase: '보관', category: '백업관리', item: '개인정보 백업 관리', description: '백업 데이터의 보안 관리', mandatory: false, checked: false },

  // 파기 단계
  { id: '15', phase: '파기', category: '파기시점', item: '보유기간 경과 시 즉시 파기', description: '보유기간 만료 즉시 파기 실행', mandatory: true, checked: false },
  { id: '16', phase: '파기', category: '파기방법', item: '복구 불가능한 방법으로 파기', description: '완전삭제 또는 물리적 파기', mandatory: true, checked: false },
  { id: '17', phase: '파기', category: '파기확인', item: '파기 완료 확인 및 기록', description: '파기 완료 여부 확인 및 기록 보존', mandatory: true, checked: false }
];

export default function ProtectionLifecycle() {
  const [items, setItems] = useState<LifecycleItem[]>(lifecycleData);
  const [hasChanges, setHasChanges] = useState(false);

  const handleCheck = (id: string, checked: boolean) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked } : item
    ));
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    // TODO: API 호출로 저장
    console.log('Saving lifecycle checklist:', items);
  };

  const handleReset = () => {
    setItems(prev => prev.map(item => ({ ...item, checked: false })));
    setHasChanges(true);
  };

  const getPhaseStats = (phase: string) => {
    const phaseItems = items.filter(item => item.phase === phase);
    const checkedItems = phaseItems.filter(item => item.checked);
    return {
      total: phaseItems.length,
      completed: checkedItems.length,
      percentage: Math.round((checkedItems.length / phaseItems.length) * 100)
    };
  };

  const phases = ['수집', '이용', '제공', '보관', '파기'];
  const totalItems = items.length;
  const completedItems = items.filter(item => item.checked).length;
  const overallProgress = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Lifecycle Checklist</h1>
          <p className="text-muted-foreground mt-2">
            개인정보 생명주기별 보호조치 체크리스트입니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            초기화
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

      {/* 전체 진행률 */}
      <Card className="shadow-pia-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>전체 진행 현황</span>
            <Badge variant="outline">{completedItems}/{totalItems} 완료</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>완료율</span>
              <span>{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* 단계별 체크리스트 */}
      {phases.map(phase => {
        const phaseItems = items.filter(item => item.phase === phase);
        const stats = getPhaseStats(phase);
        
        return (
          <Card key={phase} className="shadow-pia-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <span>{phase} 단계</span>
                  <Badge variant={stats.percentage === 100 ? "secondary" : "outline"}>
                    {stats.completed}/{stats.total}
                  </Badge>
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {stats.percentage}% 완료
                </div>
              </div>
              <Progress value={stats.percentage} className="h-1" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {phaseItems.map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/5">
                    <Checkbox
                      id={item.id}
                      checked={item.checked}
                      onCheckedChange={(checked) => handleCheck(item.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <label 
                          htmlFor={item.id} 
                          className="font-medium cursor-pointer"
                        >
                          {item.item}
                        </label>
                        {item.mandatory && (
                          <Badge variant="destructive" className="text-xs">필수</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}