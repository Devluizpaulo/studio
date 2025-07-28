"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useState, useEffect } from "react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface NavItem {
  href: string
  title: string
  role?: string | string[]
}

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: NavItem[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      if(user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      }
    }
    fetchUserRole();
  }, [user])
  
  // Custom logic to handle the /perfil route
  const isProfilePage = pathname.startsWith('/dashboard/perfil');
  const filteredItems = items.filter(item => {
    // Hide 'Meu Perfil' from secretary
    if (item.href === '/dashboard/perfil' && userRole === 'secretary') {
      return false
    }

    if (!item.role) {
      return true; // Item visible to all roles
    }

    if (Array.isArray(item.role)) {
      return userRole && item.role.includes(userRole);
    }
    return userRole === item.role;
  })

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {filteredItems.map((item) => {
        const isActive = (item.href === '/dashboard' && pathname === item.href) || 
                         (item.href !== '/dashboard' && pathname.startsWith(item.href)) ||
                         (item.href === '/dashboard/perfil' && isProfilePage);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              isActive
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "hover:bg-transparent hover:underline",
              "justify-start text-base"
            )}
          >
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
