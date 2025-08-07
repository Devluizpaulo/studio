"use client";

import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Menu, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebar } from "@/contexts/SidebarContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Header() {
  const { user } = useAuth();
  const { setIsOpen } = useSidebar();
  const router = useRouter();
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [initials, setInitials] = useState<string>("");

  useEffect(() => {
    if (user) {
      const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
        if (doc.exists()) {
          setPhotoUrl(doc.data().photoUrl || "");
          const name = doc.data().fullName || user.displayName || "";
          setInitials(
            name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
          );
        }
      });
      return () => unsub();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={photoUrl} alt="User profile photo" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.displayName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push('/dashboard/perfil')}>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
