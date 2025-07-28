"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, LogOut, LayoutDashboard, Scale } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#features", label: "Funcionalidades" },
  { href: "/summarize", label: "Resumo com IA" },
];

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-auto flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Scale className="h-7 w-7 text-primary" />
            <span className="font-headline text-2xl font-bold text-primary">
              JurisAI
            </span>
          </Link>
        </div>

        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="transition-colors hover:text-accent"
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
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="grid gap-4 py-6">
                <Link href="/" className="mb-4 flex items-center space-x-2">
                   <Scale className="h-7 w-7 text-primary" />
                  <span className="font-headline text-2xl font-bold text-primary">
                    JurisAI
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
                      Dashboard
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
                      <div className="space-y-2">
                         <SheetClose asChild>
                           <Button asChild className="w-full" style={{ backgroundColor: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}>
                              <Link href="/signup">Cadastre-se</Link>
                            </Button>
                         </SheetClose>
                         <SheetClose asChild>
                            <Button asChild variant="outline" className="w-full">
                              <Link href="/login">Login</Link>
                            </Button>
                          </SheetClose>
                      </div>
                    )}
                 </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden md:flex items-center ml-6">
          {user ? (
            <>
              <Button asChild variant="ghost" className="mr-2">
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                 <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="ml-2"
                style={{
                  backgroundColor: "hsl(var(--accent))",
                  color: "hsl(var(--accent-foreground))",
                }}
              >
                <Link href="/signup">Cadastre-se</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
