"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState, useEffect } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  Scale
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
  const { isOpen, setIsOpen, isMobile } = useSidebar();

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
  
  const NavContent = () => (
    <div className="flex h-full flex-col px-3 py-4">
        <div className="mb-2 flex items-center justify-between px-4">
          <div className={cn(
              "flex items-center gap-2 text-lg font-bold transition-opacity duration-300",
              !isOpen && "opacity-0"
            )}>
            <Scale className="h-6 w-6 text-accent" />
            <span>RGJM Juris</span>
          </div>
          {isMobile && (
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={24} />
            </button>
          )}
        </div>
        <div className="mt-5 flex-1">
          <TooltipProvider delayDuration={0}>
             <nav className="grid items-start gap-1">
              {filteredItems.map((item) => {
                const isActive = (item.href === "/dashboard" && pathname === item.href) ||
                                (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        onClick={isMobile ? () => setIsOpen(false) : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                           isActive && "bg-muted text-primary"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span
                          className={cn(
                            "overflow-hidden transition-all",
                            isOpen ? "w-full" : "w-0"
                          )}
                        >
                          {item.title}
                        </span>
                      </Link>
                    </TooltipTrigger>
                     {!isOpen && (
                        <TooltipContent side="right">
                           <p>{item.title}</p>
                        </TooltipContent>
                     )}
                  </Tooltip>
                );
              })}
            </nav>
          </TooltipProvider>
        </div>
      </div>
  );

  if (isMobile) {
    return (
       <>
         <div className={cn(
            "fixed inset-0 z-40 bg-black/60 transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setIsOpen(false)}
         />
        <aside className={cn(
            "fixed inset-y-0 left-0 z-50 h-screen w-72 bg-background border-r transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <NavContent />
        </aside>
       </>
    )
  }

  return (
    <aside
      className={cn(
        "relative hidden h-screen border-r md:block transition-all duration-300 ease-in-out",
        isOpen ? "w-72" : "w-[78px]"
      )}
    >
      <NavContent />
    </aside>
  );
}
