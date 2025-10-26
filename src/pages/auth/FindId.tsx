import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function FindId() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pia-primary to-pia-secondary p-4">
      <Card className="w-full max-w-md shadow-pia-hover">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-xl bg-gradient-to-br from-pia-primary to-pia-secondary flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">E</span>
          </div>
          <CardTitle className="text-xl font-bold text-primary">아이디 찾기</CardTitle>
          <CardDescription>등록된 이메일로 아이디를 확인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="등록된 이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-pia-primary hover:bg-pia-secondary" 
                disabled={isLoading}
              >
                {isLoading ? '확인 중...' : '아이디 찾기'}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 bg-secondary/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">입력하신 이메일로</p>
                <p className="font-medium">아이디 정보를 전송했습니다</p>
              </div>
              <p className="text-xs text-muted-foreground">
                이메일을 받지 못하셨다면 스팸함을 확인해주세요.
              </p>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-accent hover:underline">
              <ArrowLeft className="h-4 w-4" />
              로그인으로 돌아가기
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}