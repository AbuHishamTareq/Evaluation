/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  Users,
  Home,
  LockKeyholeOpen,
  ShieldClose,
  Fingerprint,
  Settings,
  Building2,
  MapPinned,
  CrossIcon,
  HospitalIcon,
  BookOpen,
  Brain,
  DatabaseZap,
  MessageCircleQuestion,
  ListChecks,
  ChartColumnIcon,
  TableConfig,
  Pill,
  User,
  MapIcon,
  StethoscopeIcon,
  BookPlus,
  HeartHandshake,
  HeartPulse,
  Building,
  Cross,
  BriefcaseMedical,
  BriefcaseBusiness,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "../components/ui/sidebar";
import { useLanguage } from "../hooks/useLanguage";
import { useApp } from "../hooks/useApp";
import { Fragment, useEffect, useState } from "react";

// Helper: Render title with optional line breaks
const renderTitle = (title: string, isActiveRoute = false) => {
  const className = isActiveRoute ? "text-white" : "text-slate-700";
  if (typeof title !== "string") return title;

  const lines = title.split("\n");
  if (lines.length === 1) {
    return <span className={className}>{title}</span>;
  }

  return (
    <span className={className}>
      {lines[0]}
      <br />
      {lines.slice(1).map((line, i) => (
        <Fragment key={i}>
          {line}
          {i < lines.slice(1).length - 1}
        </Fragment>
      ))}
    </span>
  );
};

function usePersistentState(
  key: string,
  initialValue: Record<string, boolean>
) {
  const [state, setState] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
}

const navigationItems = [
  { title: "Overview", url: "/dashboard", icon: Home, color: "text-blue-600" },
  {
    title: "Authorization",
    icon: Fingerprint,
    color: "text-black",
    permission: "access-user-module",
    children: [
      {
        title: "Permissions",
        url: "/permissions",
        icon: LockKeyholeOpen,
        permission: "access-permission-module",
        color: "text-red-600",
      },
      {
        title: "Roles",
        url: "/roles",
        icon: ShieldClose,
        permission: "access-role-module",
        color: "text-amber-600",
      },
      {
        title: "Users",
        url: "/users",
        icon: Users,
        permission: "access-user-module",
        color: "text-green-600",
      },
    ],
  },
  {
    title: "Primary Health Care",
    icon: CrossIcon,
    color: "text-red-600",
    permission: "access-center-module",
    children: [
      {
        title: "PHC",
        url: "/centers",
        permission: "access-center-module",
        icon: HospitalIcon,
        color: "text-indigo-600",
      },
      {
        title: "Team Based Code",
        url: "/tbcs",
        permission: "access-tbc-module",
        icon: BookOpen,
        color: "text-fuchsia-600",
      },
      {
        title: "Team Based Code Role",
        url: "/tbcroles",
        permission: "access-tbc-role-module",
        icon: BriefcaseBusiness,
        color: "text-orange-800",
      },
      {
        title: "Medication",
        url: "/medications",
        permission: "access-medication-module",
        icon: Pill,
        color: "text-teal-600",
      },
    ],
  },
  {
    title: "Human Resources",
    icon: Users,
    color: "text-green-600",
    permission: "access-hr-module",
    children: [
      {
        title: "Employee",
        url: "/employees",
        permission: "access-employee-module",
        icon: User,
        color: "text-indigo-600",
      },
      {
        title: "Departments",
        url: "/departments",
        permission: "access-department-module",
        icon: Building,
        color: "text-violet-600",
      },
      {
        title: "Clinics",
        url: "/clinics",
        permission: "access-clinic-module",
        icon: Cross,
        color: "text-red-800",
      },
      {
        title: "Nationalities",
        url: "/nationality",
        permission: "access-nationality-module",
        icon: MapIcon,
        color: "text-green-600",
      },
      {
        title: "Healthcare Fields",
        url: "/sectors",
        permission: "access-sector-module",
        icon: StethoscopeIcon,
        color: "text-orange-600",
      },
      {
        title: "Healthcare Specialties",
        url: "/specialties",
        permission: "access-specialty-module",
        icon: BookPlus,
        color: "text-stone-600",
      },
      {
        title: "Healthcare Ranks",
        url: "/ranks",
        permission: "access-rank-module",
        icon: HeartHandshake,
        color: "text-sky-600",
      },
      {
        title: "SHC Category",
        url: "/categories",
        permission: "access-category-module",
        icon: HeartPulse,
        color: "text-rose-600",
      },
      {
        title: "Healthcare Roles\n& Administration",
        url: "/healthcareRoles",
        permission: "access-healthcare-role-and-administration",
        icon: BriefcaseMedical,
        color: "text-sky-800",
      },
    ],
  },
  {
    title: "Question Bank",
    icon: DatabaseZap,
    color: "text-yellow-600",
    children: [
      {
        title: "Sections",
        url: "/sections",
        permission: "access-section-module",
        icon: ListChecks,
        color: "text-violate-600",
      },
      {
        title: "Domains",
        url: "/domains",
        permission: "access-domain-module",
        icon: Brain,
        color: "text-pink-600",
      },
      {
        title: "Questions",
        url: "/questions",
        permission: "access-question-module",
        icon: MessageCircleQuestion,
        color: "text-teal-600",
      },
    ],
  },
  {
    title: "Evaluation",
    icon: ChartColumnIcon,
    color: "text-red-700",
    children: [
      {
        title: "Manage Evaluations",
        url: "/evaluations",
        permission: "manage-evaluations",
        icon: ChartColumnIcon,
        color: "text-green-800",
      },
      {
        title: "Evaluation Forms",
        url: "/evaluations/evaluation-form",
        permission: "access-evaluation-form",
        icon: ChartColumnIcon,
        color: "text-green-800",
      },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    color: "text-blue-600",
    permission: "access-user-module",
    children: [
      {
        title: "Dynamic Table Builder",
        url: "/dynamic-table",
        permission: "access-dynamic-table-builder",
        icon: TableConfig,
        color: "text-sky-600",
      },
      {
        title: "Elt",
        url: "/elts",
        permission: "access-elt-module",
        icon: Building2,
        color: "text-red-600",
      },
      {
        title: "Zone",
        url: "/zones",
        permission: "access-zone-module",
        icon: MapPinned,
        color: "text-amber-600",
      },
    ],
  },
];

export function AppSidebar() {
  const { language } = useLanguage();
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { can } = useApp();
  const [openMenus, setOpenMenus] = usePersistentState(
    "sidebar-open-menus",
    {}
  );
  const isRtl = language === "ar";

  const isActive = (path: string) => currentPath === path;

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isActiveInMenu = (menu: any): boolean => {
    if (!menu.children) return false;

    return menu.children.some((child: any) => {
      if (child.url && currentPath.startsWith(child.url)) {
        return true;
      }
      return isActiveInMenu(child);
    });
  };

  useEffect(() => {
    const newOpenMenus: Record<string, boolean> = {};

    const markActiveMenus = (items: any[]) => {
      items.forEach((item) => {
        if (item.children) {
          const active = isActiveInMenu(item);
          newOpenMenus[item.title] = active;
          markActiveMenus(item.children);
        }
      });
    };

    markActiveMenus(navigationItems);
    setOpenMenus(newOpenMenus);
  }, [currentPath]);

  const getNavClass = (isActiveRoute: boolean) =>
    isActiveRoute
      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium shadow-lg hover:from-blue-600 hover:to-indigo-600"
      : "hover:bg-blue-50 hover:text-blue-700 transition-all duration-200";

  const renderNavItem = (item: any, depth = 0) => {
    const isOpen = openMenus[item.title];

    if (item.children) {
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            onClick={() => toggleMenu(item.title)}
            className="flex justify-between items-center rounded-lg px-3 py-2 hover:bg-blue-100"
            style={{ paddingLeft: `${depth * 16 + 12}px` }}
          >
            <div className="flex items-center gap-2">
              {item.icon && <item.icon className={`w-4 h-4 ${item.color}`} />}
              {renderTitle(item.title)}
            </div>
            <span className="text-xs">{isOpen ? "−" : "+"}</span>
          </SidebarMenuButton>

          {isOpen && (
            <ul className="space-y-1 mt-1">
              {item.children
                .filter(
                  (child: any) => !child.permission || can(child.permission)
                )
                .map((child: any) => renderNavItem(child, depth + 1))}
            </ul>
          )}
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          className={`${getNavClass(
            isActive(item.url)
          )} rounded-lg transition-all duration-200`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          <NavLink to={item.url} end>
            {item.icon && (
              <item.icon
                className={`w-4 h-4 ${
                  isActive(item.url) ? "text-white" : item.color
                }`}
              />
            )}
            {renderTitle(item.title, isActive(item.url))}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar
      side={isRtl ? "right" : "left"}
      className="border-r border-blue-100 bg-gradient-to-b from-white to-blue-50/50"
    >
      <SidebarHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="w-14 h-14 rounded-lg flex items-center justify-center shadow-lg">
            <img src="../images/logo.png" className="w-12 h-12 text-white" />
          </div>
          {state === "expanded" && (
            <div className="pt-2">
              <h3 className="text-sm font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Al Ahsa Health Cluster
              </h3>
              <p className="text-sm font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                تجمــع الاحســاء الصحــي
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-transparent to-blue-25">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-600 font-semibold text-xs uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems
                .filter((item) => !item.permission || can(item.permission))
                .map((item) => renderNavItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="p-2">
          {state === "expanded" && (
            <div className="text-xs text-blue-600 font-medium">
              © 2025 Al Ahsa Health Cluster
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
