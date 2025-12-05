import { useState } from "react";

import {
  FileText,
  Users,
  LayoutDashboard,
  BarChart3,
  Upload,
  Settings,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface SidebarItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  badge?: string;
}

interface SidebarProps {
  onItemClick?: (route: string) => void;
  collapsed?: boolean;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "overview",
    title: "Overview",
    icon: LayoutDashboard,
    route: "/admin/dashboard",
  },
  {
    id: "documents",
    title: "Documents",
    icon: FileText,
    route: "/admin/dashboard/documents",
  },
  {
    id: "users",
    title: "Users",
    icon: Users,
    route: "/admin/dashboard/users",
  },
];

const secondaryItems: SidebarItem[] = [
  {
    id: "analytics",
    title: "Analytics",
    icon: BarChart3,
    route: "/admin/dashboard/analytics",
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    route: "/admin/dashboard/settings",
  },
];

export const Sidebar = ({ onItemClick, collapsed = false }: SidebarProps) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isActive = (route: string) => {
    if (route === "/admin/dashboard") {
      return location.pathname === route;
    }
    return location.pathname.startsWith(route);
  };

  const handleItemClick = (item: SidebarItem) => {
    onItemClick?.(item.route);
  };

  const NavItem = ({ item }: { item: SidebarItem }) => {
    const Icon = item.icon;
    const active = isActive(item.route);

    const content = (
      <Button
        variant={active ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-3 transition-all duration-200",
          active && "bg-primary/10 text-primary font-medium",
          !collapsed && "px-3",
          collapsed && "px-2 justify-center"
        )}
        onClick={() => handleItemClick(item)}
        onMouseEnter={() => setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <Icon
          className={cn(
            "h-5 w-5 shrink-0",
            active ? "text-primary" : "text-muted-foreground"
          )}
        />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.title}</span>
            {item.badge && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {item.badge}
              </span>
            )}
            {hoveredItem === item.id && !active && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </>
        )}
      </Button>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.title}
            {item.badge && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {item.badge}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <ScrollArea className="h-full py-4">
        <div className={cn("space-y-4", collapsed ? "px-2" : "px-3")}>
          {/* Logo/Brand */}
          {!collapsed && (
            <div className="px-3 py-2">
              <h2 className="text-lg font-semibold tracking-tight">
                Admin Panel
              </h2>
              <p className="text-xs text-muted-foreground">
                Document Management
              </p>
            </div>
          )}

          {/* Main Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Main
              </h3>
            )}
            {sidebarItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>

          <Separator className="my-4" />

          {/* Secondary Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                More
              </h3>
            )}
            {secondaryItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Quick Upload Button */}
        {!collapsed && (
          <div className="absolute bottom-4 left-3 right-3">
            <Button
              className="w-full gap-2"
              onClick={() => onItemClick?.("/admin/dashboard/documents")}
            >
              <Upload className="h-4 w-4" />
              Quick Upload
            </Button>
          </div>
        )}
      </ScrollArea>
    </aside>
  );
};
