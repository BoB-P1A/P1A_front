import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    id: '',
    email: ''
  });
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
          <CardTitle className="text-xl font-bold text-primary">비밀번호 재설정</CardTitle>
          <CardDescription>새로운 비밀번호를 설정하세요</CardDescription>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">아이디</Label>
                <Input
                  id="id"
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={formData.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="등록된 이메일을 입력하세요"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-pia-primary hover:bg-pia-secondary" 
                disabled={isLoading}
              >
                {isLoading ? '전송 중...' : '재설정 링크 전송'}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 bg-secondary/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">입력하신 이메일로</p>
                <p className="font-medium">비밀번호 재설정 링크를 전송했습니다</p>
              </div>
              <p className="text-xs text-muted-foreground">
                링크는 24시간 동안 유효합니다.
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