// BUG 2 FIX: pathname.startsWith() replaced with exact match OR startsWith(url + "/") pattern
// BUG 3 FIX: removed activeClassName from NavLink - SidebarMenuButton isActive handles all active styling
//            Having both caused double-active style conflicts (two different classes applied simultaneously)
import { Brain, LayoutDashboard, Users, BookOpen, Bot, Lightbulb, FileText, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Knowledge Base", url: "/knowledge", icon: BookOpen },
  { title: "AI Agents", url: "/agents", icon: Bot },
  { title: "Insights", url: "/insights", icon: Lightbulb },
  { title: "Deliverables", url: "/deliverables", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
];

// BUG 2 FIX: precise active check — exact match OR child route (url + "/")
const isRouteActive = (itemUrl: string, pathname: string): boolean => {
  if (itemUrl === "/") return pathname === "/";
  return pathname === itemUrl || pathname.startsWith(itemUrl + "/");
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <Brain className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-foreground">AI Consulting</span>
              <span className="text-xs text-sidebar-foreground/60">Brain Platform</span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {/* BUG 3 FIX: isActive only on SidebarMenuButton — removed conflicting activeClassName from NavLink */}
                  <SidebarMenuButton
                    asChild
                    isActive={isRouteActive(item.url, location.pathname)}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
