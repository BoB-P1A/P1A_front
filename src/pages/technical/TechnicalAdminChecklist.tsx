import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Save, RefreshCw, Shield } from 'lucide-react';

interface TechnicalItem {
  id: string;
  category: string;
  subcategory: string;
  item: string;
  description: string;
  compliance: 'mandatory' | 'recommended' | 'optional';
  checked: boolean;
}

const technicalItems: TechnicalItem[] = [
  // 접근통제
  { id: '1', category: '접근통제', subcategory: '사용자 인증', item: '안전한 인증체계 구현', description: '다단계 인증, 강력한 패스워드 정책', compliance: 'mandatory', checked: false },
  { id: '2', category: '접근통제', subcategory: '권한관리', item: '최소권한 원칙 적용', description: '업무에 필요한 최소한의 권한만 부여', compliance: 'mandatory', checked: false },
  { id: '3', category: '접근통제', subcategory: '세션관리', item: '세션 타임아웃 설정', description: '일정 시간 비활성 시 자동 로그아웃', compliance: 'mandatory', checked: false },
  { id: '4', category: '접근통제', subcategory: '로그인 보안', item: '계정 잠금 정책', description: '연속 로그인 실패 시 계정 일시 잠금', compliance: 'recommended', checked: false },

  // 암호화
  { id: '5', category: '암호화', subcategory: '저장 암호화', item: '개인정보 저장 시 암호화', description: 'AES-256 등 강력한 암호화 알고리즘 사용', compliance: 'mandatory', checked: false },
  { id: '6', category: '암호화', subcategory: '전송 암호화', item: '네트워크 전송 시 암호화', description: 'TLS 1.2 이상 사용', compliance: 'mandatory', checked: false },
  { id: '7', category: '암호화', subcategory: '키 관리', item: '암호화 키 안전 관리', description: '키 생성, 저장, 교체, 폐기 절차', compliance: 'mandatory', checked: false },
  { id: '8', category: '암호화', subcategory: '해시화', item: '패스워드 해시화', description: 'bcrypt, PBKDF2 등 안전한 해시 함수', compliance: 'mandatory', checked: false },

  // 접근기록
  { id: '9', category: '접근기록', subcategory: '로그 수집', item: '개인정보 접근 로그 기록', description: '접근 시간, 사용자, 처리 내역 기록', compliance: 'mandatory', checked: false },
  { id: '10', category: '접근기록', subcategory: '로그 보관', item: '로그 안전 보관', description: '무결성 보장, 최소 6개월 보관', compliance: 'mandatory', checked: false },
  { id: '11', category: '접근기록', subcategory: '로그 분석', item: '비정상 접근 탐지', description: '비정상적인 접근 패턴 모니터링', compliance: 'recommended', checked: false },

  // 악성코드 차단
  { id: '12', category: '악성코드 차단', subcategory: '백신 프로그램', item: '백신 프로그램 설치', description: '최신 백신 프로그램 설치 및 실시간 검사', compliance: 'mandatory', checked: false },
  { id: '13', category: '악성코드 차단', subcategory: '정기 검사', item: '정기적인 악성코드 검사', description: '주기적인 전체 시스템 검사', compliance: 'mandatory', checked: false },
  { id: '14', category: '악성코드 차단', subcategory: '업데이트', item: '백신 정의 파일 업데이트', description: '최신 악성코드 대응을 위한 정기 업데이트', compliance: 'mandatory', checked: false },

  // 보안 업데이트
  { id: '15', category: '보안 업데이트', subcategory: '시스템 패치', item: '운영체제 보안 패치', description: '보안 취약점 해결을 위한 정기 패치', compliance: 'mandatory', checked: false },
  { id: '16', category: '보안 업데이트', subcategory: '어플리케이션 패치', item: '어플리케이션 보안 업데이트', description: '사용 중인 소프트웨어 보안 업데이트', compliance: 'mandatory', checked: false },
  { id: '17', category: '보안 업데이트', subcategory: '취약점 관리', item: '취약점 스캔 및 관리', description: '정기적인 취약점 점검 및 조치', compliance: 'recommended', checked: false },
];

export default function TechnicalAdminChecklist() {
  const [items, setItems] = useState<TechnicalItem[]>(technicalItems);
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
    console.log('Saving technical checklist:', items);
  };

  const handleReset = () => {
    setItems(prev => prev.map(item => ({ ...item, checked: false })));
    setHasChanges(true);
  };

  const getCategoryStats = (category: string) => {
    const categoryItems = items.filter(item => item.category === category);
    const checkedItems = categoryItems.filter(item => item.checked);
    return {
      total: categoryItems.length,
      completed: checkedItems.length,
      percentage: Math.round((checkedItems.length / categoryItems.length) * 100)
    };
  };

  const getComplianceBadge = (compliance: string) => {
    switch (compliance) {
      case 'mandatory':
        return <Badge variant="destructive" className="text-xs">필수</Badge>;
      case 'recommended':
        return <Badge variant="default" className="text-xs">권장</Badge>;
      case 'optional':
        return <Badge variant="secondary" className="text-xs">선택</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{compliance}</Badge>;
    }
  };

  const categories = ['접근통제', '암호화', '접근기록', '악성코드 차단', '보안 업데이트'];
  const totalItems = items.length;
  const completedItems = items.filter(item => item.checked).length;
  const overallProgress = Math.round((completedItems / totalItems) * 100);
  const mandatoryItems = items.filter(item => item.compliance === 'mandatory');
  const completedMandatory = mandatoryItems.filter(item => item.checked).length;
  const mandatoryProgress = Math.round((completedMandatory / mandatoryItems.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Admin Checklist</h1>
          <p className="text-muted-foreground mt-2">
            관리적 보안조치 체크리스트입니다
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <Card className="shadow-pia-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>필수 항목 현황</span>
              <Badge variant={mandatoryProgress === 100 ? "secondary" : "destructive"}>
                {completedMandatory}/{mandatoryItems.length} 완료
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>필수 완료율</span>
                <span>{mandatoryProgress}%</span>
              </div>
              <Progress value={mandatoryProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 카테고리별 체크리스트 */}
      {categories.map(category => {
        const categoryItems = items.filter(item => item.category === category);
        const stats = getCategoryStats(category);
        
        return (
          <Card key={category} className="shadow-pia-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-pia-secondary" />
                  <span>{category}</span>
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
                {categoryItems.map(item => (
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
                        {getComplianceBadge(item.compliance)}
                        <Badge variant="outline" className="text-xs">
                          {item.subcategory}
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

      {/* 가이드 */}
      <Card className="shadow-pia-card">
        <CardHeader>
          <CardTitle>기술적 보호조치 가이드</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2 text-red-600">필수 조치</h4>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>법적 의무사항으로 반드시 구현</li>
                <li>미이행 시 과태료 부과 가능</li>
                <li>우선적으로 완료해야 할 항목</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-blue-600">권장 조치</h4>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>보안 강화를 위해 권장되는 조치</li>
                <li>업계 모범사례 기반</li>
                <li>추가 보안 수준 향상</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-gray-600">선택 조치</h4>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>특정 환경에서 필요한 경우</li>
                <li>조직 정책에 따라 선택 적용</li>
                <li>고도화된 보안 기능</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}