
import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    FileText,
    CheckSquare,
    Shield,
    GitBranch,
    PieChart,
    AlertTriangle,
    Settings,
    Crown,
    ListChecks,
    Table,
    Users,
    Building2,
    FileCheck,
    History as HistoryIcon
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
    SidebarHeader
} from '@/components/ui/sidebar';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const getMenuItems = (userRole?: string) => {
    const items = [];

    // 평가항목 목록 - 모든 권한에게 표시
    items.push({
        title: '평가항목 목록',
        url: '/evaluation-management',
        icon: ListChecks,
    });

    items.push(
        {
            title: '개인정보 처리단계',
            icon: Shield,
            items: [
                { title: '개인정보 처리 업무표', url: '/lifecycle/task-table', icon: Table },
                { title: '개인정보 흐름표', url: '/lifecycle/flow-table', icon: GitBranch },
                { title: '개인정보 흐름도', url: '/lifecycle/flowchart', icon: PieChart },
                { title: 'Lifecycle Checklist', url: '/lifecycle/lifecycle', icon: CheckSquare },
                { title: '침해요인별 개선 가이드', url: '/lifecycle/improvement-plan', icon: AlertTriangle },
                { title: '조치 계획 수립', url: '/lifecycle/action-plan', icon: FileText },
                { title: '결과보고서', url: '/lifecycle/report', icon: FileCheck },
            ],
        },
        {
            title: '개인정보 처리시스템',
            icon: Settings,
            items: [
                { title: 'Admin Checklist', url: '/technical/checklist', icon: CheckSquare },
                { title: '침해요인별 개선 가이드', url: '/technical/improvement-plan', icon: AlertTriangle },
                { title: '조치 계획 수립', url: '/technical/action-plan', icon: FileText },
                { title: '결과보고서', url: '/technical/report', icon: FileCheck },
            ],
        },
        {
            title: '보안성 검토',
            icon: Shield,
            items: [
                { title: '보안성 검토 Checklist', url: '/security/checklist', icon: CheckSquare },
                { title: '침해요인별 개선 가이드', url: '/security/improvement-plan', icon: AlertTriangle },
                { title: '조치 계획 수립', url: '/security/action-plan', icon: FileText },
                { title: '결과보고서', url: '/security/report', icon: FileCheck },
            ],
        }
    );

    // 로그 기록 - 관리자만 표시
    if (userRole === 'admin') {
        items.push({
            title: '로그 기록',
            url: '/history-logs',
            icon: HistoryIcon,
        });
    }

    return items;
};

export function DashboardSidebar() {
    const { state } = useSidebar();
    const collapsed = state === 'collapsed';
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [openGroups, setOpenGroups] = useState<string[]>([]);

    const toggleGroup = (title: string) => {
        setOpenGroups(prev =>
            prev.includes(title)
                ? prev.filter(item => item !== title)
                : [...prev, title]
        );
    };

    const isActive = (path: string) => location.pathname === path;
    const isGroupActive = (items: any[]) => items.some(item => isActive(item.url));

    const menuItems = getMenuItems(user?.role);

    return (
        <Sidebar className="border-r border-sidebar-border">
            <SidebarHeader className="p-6 border-b border-sidebar-border">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity cursor-pointer"
                >
                    <div className="w-8 h-8 rounded-lg bg-pia-secondary flex items-center justify-center">
                        <span className="text-white font-bold text-sm">E</span>
                    </div>
                    {!collapsed && (
                        <div className="text-left">
                            <h1 className="text-lg font-bold text-sidebar-foreground">EPIA</h1>
                            <p className="text-xs text-sidebar-foreground/70">PIA 관리 프레임워크</p>
                        </div>
                    )}
                </button>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {menuItems.map((item) => {
                            if (item.items) {
                                const isGroupOpen = openGroups.includes(item.title);
                                const isGroupActiveState = isGroupActive(item.items);

                                return (
                                    <Collapsible
                                        key={item.title}
                                        open={isGroupOpen}
                                        onOpenChange={() => toggleGroup(item.title)}
                                    >
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton
                                                    className={cn(
                                                        "w-full justify-between",
                                                        isGroupActiveState && "bg-sidebar-accent text-sidebar-accent-foreground"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <item.icon className="h-4 w-4" />
                                                        {!collapsed && <span>{item.title}</span>}
                                                    </div>
                                                    {!collapsed && (
                                                        <ChevronRight className={cn(
                                                            "h-4 w-4 transition-transform duration-200",
                                                            isGroupOpen && "rotate-90"
                                                        )} />
                                                    )}
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>

                                            {!collapsed && (
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {item.items.map((subItem) => (
                                                            <SidebarMenuSubItem key={subItem.url}>
                                                                <SidebarMenuSubButton asChild>
                                                                    <NavLink
                                                                        to={subItem.url}
                                                                        className={({ isActive }) => cn(
                                                                            "flex items-center gap-2",
                                                                            isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                                                        )}
                                                                    >
                                                                        <subItem.icon className="h-4 w-4" />
                                                                        <span>{subItem.title}</span>
                                                                    </NavLink>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            )}
                                        </SidebarMenuItem>
                                    </Collapsible>
                                );
                            }

                            return (
                                <SidebarMenuItem key={item.url}>
                                    <SidebarMenuButton asChild>
                                        <NavLink
                                            to={item.url}
                                            className={({ isActive }) => cn(
                                                "flex items-center gap-2",
                                                isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                            )}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {!collapsed && <span>{item.title}</span>}
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}

                        {/* Admin Page - 관리자만 보이도록 */}
                        {user?.role === 'admin' && (
                            <Collapsible
                                open={openGroups.includes('관리자 페이지')}
                                onOpenChange={() => toggleGroup('관리자 페이지')}
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            className={cn(
                                                "w-full justify-between",
                                                (isActive('/admin/accounts') || isActive('/admin/companies')) && "bg-sidebar-accent text-sidebar-accent-foreground"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Crown className="h-4 w-4" />
                                                {!collapsed && <span>관리자 페이지</span>}
                                            </div>
                                            {!collapsed && (
                                                <ChevronRight className={cn(
                                                    "h-4 w-4 transition-transform duration-200",
                                                    openGroups.includes('관리자 페이지') && "rotate-90"
                                                )} />
                                            )}
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>

                                    {!collapsed && (
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                <SidebarMenuSubItem>
                                                    <SidebarMenuSubButton asChild>
                                                        <NavLink
                                                            to="/admin/accounts"
                                                            className={({ isActive }) => cn(
                                                                "flex items-center gap-2",
                                                                isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                                            )}
                                                        >
                                                            <Users className="h-4 w-4" />
                                                            <span>계정 및 권한 관리</span>
                                                        </NavLink>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                                <SidebarMenuSubItem>
                                                    <SidebarMenuSubButton asChild>
                                                        <NavLink
                                                            to="/admin/companies"
                                                            className={({ isActive }) => cn(
                                                                "flex items-center gap-2",
                                                                isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                                            )}
                                                        >
                                                            <Building2 className="h-4 w-4" />
                                                            <span>기업 관리</span>
                                                        </NavLink>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    )}
                                </SidebarMenuItem>
                            </Collapsible>
                        )}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}