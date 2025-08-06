"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  Users,
  DollarSign,
  ShieldCheck,
  FileText,
  Users2,
  User,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";

interface NavItem {
  href: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  role?: string | string[];
}

const sidebarNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Processos",
    href: "/dashboard/processos",
    icon: Briefcase,
  },
  {
    title: "Agenda",
    href: "/dashboard/agenda",
    icon: Calendar,
  },
  {
    title: "Clientes",
    href: "/dashboard/clientes",
    icon: Users,
  },
  {
    title: "Financeiro",
    href: "/dashboard/financeiro",
    icon: DollarSign,
    role: ["master", "secretary"],
  },
  {
    title: "Controle Interno",
    href: "/dashboard/controle-interno",
    icon: ShieldCheck,
    role: ["master", "secretary"],
  },
  {
    title: "Documentos",
    href: "/dashboard/documentos",
    icon: FileText,
    role: "master",
  },
  {
    title: "Equipe",
    href: "/dashboard/equipe",
    icon: Users2,
    role: "master",
  },
  {
    title: "Meu Perfil",
    href: "/dashboard/perfil",
    icon: User,
  },
  {
    title: "Configurações",
    href: "/dashboard/configuracoes",
    icon: Settings,
    role: "master",
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const { isOpen, setIsOpen } = useSidebar();
  const isMobile = useIsMobile();
  
  const handleClose = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  }

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      }
    };
    fetchUserRole();
  }, [user]);

  const filteredItems = sidebarNavItems.filter((item) => {
    if (item.href === "/dashboard/perfil" && userRole === "secretary") {
      return false;
    }
    if (!item.role) return true;
    if (Array.isArray(item.role)) {
      return userRole && item.role.includes(userRole);
    }
    return userRole === item.role;
  });

  if (!isOpen && isMobile) return null;

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        "fixed left-0 top-0 z-40 h-screen lg:relative lg:z-auto",
        isOpen ? "w-72" : "w-0 lg:w-20",
        isMobile && "!w-72"
      )}
    >
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
          {isOpen && (
            <span className="text-lg font-semibold text-sidebar-primary-foreground">
              JurisAI
            </span>
          )}
           {isMobile && (
              <button
                onClick={() => setIsOpen(false)}
                className="text-sidebar-foreground hover:text-sidebar-primary-foreground"
              >
                <X size={24} />
              </button>
            )}
        </div>
        <nav className="flex-1 space-y-2 px-4 py-4">
          {filteredItems.map((item) => {
            const isActive =
              (item.href === "/dashboard" && pathname === item.href) ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground",
                  !isOpen && "justify-center"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span
                  className={cn(
                    "truncate transition-opacity duration-200",
                    !isOpen && "lg:sr-only"
                  )}
                >
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
