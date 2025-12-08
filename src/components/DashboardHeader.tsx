
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useNavigate } from 'react-router-dom';
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

const getRoleLabel = (role: string) => {
    switch (role) {
        case 'admin':
            return '관리자';
        case 'developer':
            return '개발팀';
        case 'privacy-team':
            return '개인정보팀';
        case 'planning-team':
            return '사업주관팀';
        default:
            return role;
    }
};

export function DashboardHeader() {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState(false);

    // 프로필 드롭다운이 열릴 때 사용자 정보 새로고침
    const handleProfileOpen = async (open: boolean) => {
        if (open) {
            await refreshUser();
        }
    };

    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
            <div className="flex items-center gap-4">
                <SidebarTrigger />
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                >
                    <div className="w-6 h-6 rounded bg-pia-primary flex items-center justify-center">
                        <span className="text-white font-bold text-xs">E</span>
                    </div>
                    <h1 className="text-lg font-semibold text-primary">EPIA</h1>
                </button>
            </div>

            <div className="flex items-center gap-2">

                {/* 마이페이지 드롭다운 */}
                <DropdownMenu onOpenChange={handleProfileOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:text-accent">
                            <User className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div>
                                <p className="font-medium">{user?.name}</p>
                                <p className="text-xs text-muted-foreground">{user?.username}</p>
                                <Badge variant="outline" className="mt-1">
                                    {getRoleLabel(user?.role || '')}
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
                                                <p className="text-sm text-muted-foreground">{user?.username}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">역할</label>
                                                <Badge variant="outline">
                                                    {getRoleLabel(user?.role || '')}
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
                        <DropdownMenuItem onClick={logout} className="text-destructive">
                            로그아웃
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}