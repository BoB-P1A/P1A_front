import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [credentials, setCredentials] = useState({ id: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { user, login } = useAuth();
  const { toast } = useToast();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(credentials);
    
    if (success) {
      toast({
        title: "로그인 성공",
        description: "환영합니다!",
      });
    } else {
      toast({
        title: "로그인 실패",
        description: "아이디 또는 비밀번호를 확인해주세요.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pia-primary to-pia-secondary p-4">
      <Card className="w-full max-w-md shadow-pia-hover">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-xl bg-gradient-to-br from-pia-primary to-pia-secondary flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">E</span>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">EPIA</CardTitle>
          <CardDescription>개인정보 영향평가 관리 플랫폼</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id">아이디</Label>
              <Input
                id="id"
                type="text"
                placeholder="아이디를 입력하세요"
                value={credentials.id}
                onChange={(e) => setCredentials(prev => ({ ...prev, id: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-pia-primary hover:bg-pia-secondary" 
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>
          
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              계정을 잊으셨나요?
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <Link to="/find-id" className="text-accent hover:underline">
                아이디 찾기
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link to="/reset-password" className="text-accent hover:underline">
                비밀번호 재설정
              </Link>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">테스트 계정:</p>
            <div className="text-xs space-y-1">
              <p>관리자: admin / admin123</p>
              <p>개발팀: developer / dev123</p>
              <p>개인정보팀: privacy / privacy123</p>
              <p>사업주관팀: plan / plan123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
