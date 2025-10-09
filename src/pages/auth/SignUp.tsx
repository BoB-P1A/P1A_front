import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: '오류',
        description: '비밀번호가 일치하지 않습니다.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: '오류',
        description: '비밀번호는 최소 6자 이상이어야 합니다.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password, fullName);
    setIsLoading(false);

    if (error) {
      console.error('Sign up error:', error);
      toast({
        title: '회원가입 실패',
        description: error.message || '회원가입 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: '회원가입 성공',
        description: '회원가입이 완료되었습니다. 로그인해주세요.',
      });
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>회원가입</CardTitle>
          <CardDescription>개인정보 영향평가 시스템 계정을 생성하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">이름</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="홍길동"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@company.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '처리 중...' : '회원가입'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-primary hover:underline">
              로그인
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
