import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

export function DashboardHeader() {
  const { user, signOut } = useAuth();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const mockNotifications = [
    { id: 1, title: '새로운 영향평가 요청', time: '5분 전', type: 'info' },
    { id: 2, title: '체크리스트 수행 요청', time: '1시간 전', type: 'reception' },
    { id: 3, title: '체크리스트 미완료 항목 있음', time: '3시간 전', type: 'warning' },
  ];

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-pia-primary flex items-center justify-center">
            <span className="text-white font-bold text-xs">E</span>
          </div>
          <h1 className="text-lg font-semibold text-primary">EPIA</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* 알림 아이콘 */}
        <Dialog open={notificationOpen} onOpenChange={setNotificationOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover:text-accent">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>알림</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {mockNotifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                  <Badge variant={notification.type === 'info' ? 'default' : 
                                notification.type === 'reception' ? 'secondary' : 'destructive'}>
                    {notification.type}
                  </Badge>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* 마이페이지 드롭다운 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:text-accent">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.id}</p>
                <Badge variant="outline" className="mt-1">
                  {user?.role === 'admin' ? '관리자' : 
                   user?.role === 'developer' ? '개발팀' : '개인정보팀'}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
                <DialogTrigger className="w-full text-left">
                  프로필 설정
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>프로필 설정</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">이름</label>
                        <p className="text-sm text-muted-foreground">{user?.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">아이디</label>
                        <p className="text-sm text-muted-foreground">{user?.id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">역할</label>
                        <Badge variant="outline">
                          {user?.role === 'admin' ? '관리자' : 
                           user?.role === 'developer' ? '개발팀' : '개인정보팀'}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium">회사</label>
                        <p className="text-sm text-muted-foreground">{user?.company}</p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive">
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}