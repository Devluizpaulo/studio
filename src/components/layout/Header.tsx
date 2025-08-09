
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, LogOut, LayoutDashboard, Scale } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };
  
  const isDashboard = pathname.startsWith('/dashboard');

  if (isDashboard) {
    return null; // The dashboard has its own layout and header
  }

  const navLinks = [
      { href: "/#", label: "Início" },
      { href: "/#services", label: "Atuação" },
      { href: "/#specialties", label: "Especialidades" },
      { href: "/#contact", label: "Contato" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-accent/20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="mr-auto flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Scale className="h-8 w-8 text-accent" />
            <span className="font-headline text-xl font-bold text-primary">
              ARTHUR ORTEGA
            </span>
          </Link>
        </div>

          <nav className="hidden items-center space-x-8 text-sm font-medium md:flex">
            {navLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="transition-colors hover:text-accent text-base"
              >
                {label}
              </Link>
            ))}
          </nav>

        <div className="flex items-center md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="text-left">
                  <SheetTitle className="sr-only">Menu</SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 py-6">
                <Link href="/" className="mb-4 flex items-center space-x-2">
                   <Scale className="h-7 w-7 text-accent" />
                  <span className="font-headline text-2xl font-bold text-primary">
                    Arthur Ortega
                  </span>
                </Link>
                {navLinks.map(({ href, label }) => (
                  <SheetClose asChild key={label}>
                    <Link
                      href={href}
                      className="flex w-full items-center py-2 text-lg font-semibold"
                    >
                      {label}
                    </Link>
                   </SheetClose>
                ))}
                 {user && (
                   <SheetClose asChild>
                    <Link
                      href="/dashboard"
                      className="flex w-full items-center py-2 text-lg font-semibold"
                    >
                      Painel de Gestão
                    </Link>
                  </SheetClose>
                )}
                 <div className="mt-4 border-t pt-4">
                    {user ? (
                      <Button onClick={handleSignOut} variant="outline" className="w-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                      </Button>
                    ) : (
                       <SheetClose asChild>
                          <Button asChild variant="outline" className="w-full">
                            <Link href="/login">Área do Advogado</Link>
                          </Button>
                        </SheetClose>
                    )}
                 </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden md:flex items-center ml-6">
          {user ? (
            <>
              <Button asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Acessar Painel
                </Link>
              </Button>
              <Button onClick={handleSignOut} variant="ghost" size="sm" className="ml-2">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </>
          ) : (
            <Button asChild variant="outline">
               <Link href="/login">Área do Advogado</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
