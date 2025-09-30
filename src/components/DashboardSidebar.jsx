import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FileText,
  CheckSquare,
  TrendingUp,
  Users,
  Shield,
  GitBranch,
  PieChart,
  AlertCircle,
  Settings,
  Crown
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

const menuItems = [
  {
    title: '영향평가 요청',
    url: '/evaluation-request',
    icon: FileText,
  },
  {
    title: '평가 기준 관리',
    icon: CheckSquare,
    items: [
      { title: '처리업무표', url: '/criteria/tasks', icon: CheckSquare },
      { title: '영향도 등급표', url: '/criteria/impact', icon: TrendingUp },
      { title: '개인정보건수 등급표', url: '/criteria/personal-data', icon: Users },
    ],
  },
  {
    title: '개인정보 처리단계별 보호조치',
    icon: Shield,
    items: [
      { title: 'Lifecycle Checklist', url: '/protection/lifecycle', icon: CheckSquare },
      { title: '개인정보 흐름표', url: '/protection/flow-table', icon: GitBranch },
      { title: '개인정보 흐름도', url: '/protection/flow-chart', icon: PieChart },
      { title: '위험도 산정', url: '/protection/risk', icon: AlertCircle },
    ],
  },
  {
    title: '기술적 보호조치',
    icon: Settings,
    items: [
      { title: 'Admin Checklist', url: '/technical/admin-checklist', icon: CheckSquare },
      { title: '위험도 산정', url: '/technical/risk', icon: AlertCircle },
    ],
  },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { user } = useAuth();
  const [openGroups, setOpenGroups] = useState([]);

  const toggleGroup = (title) => {
    setOpenGroups(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (path) => location.pathname === path;
  const isGroupActive = (items) => items.some(item => isActive(item.url));

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pia-secondary flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">EPIA</h1>
              <p className="text-xs text-sidebar-foreground/70">PIA 관리 플랫폼</p>
            </div>
          )}
        </div>
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
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/adminpage"
                    className={({ isActive }) => cn(
                      "flex items-center gap-2",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    )}
                  >
                    <Crown className="h-4 w-4" />
                    {!collapsed && <span>관리자 페이지</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
