
"use client"
import Link from "next/link";
import { Scale } from "lucide-react";
import { usePathname } from "next/navigation";

interface OwnerInfo {
  fullName: string;
  office: string;
  oab: string;
}

interface FooterProps {
  ownerInfo?: OwnerInfo;
}

export default function Footer({ ownerInfo }: FooterProps) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  if (isDashboard) {
    return null;
  }
  
  return (
    <footer className="py-8 bg-card border-t border-accent/20">
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        <div className="mb-4">
          <h3 className="text-2xl font-bold font-headline text-accent">RGJM Advocacia</h3>
          <p className="text-sm text-muted-foreground">Advogado(a) | OAB/UF 000.000</p>
        </div>
        
        <div className="mb-4">
           <a 
                href="https://www.instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block p-2 rounded-full bg-card/80 hover:bg-accent/20 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-muted-foreground hover:text-accent"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
            </a>
        </div>
        
        <div className="text-center pt-4">
          <p className="text-muted-foreground text-xs mb-1">
            © 2024 RGJM Advocacia. Todos os direitos reservados.
          </p>
          <p className="text-muted-foreground text-xs">
            Desenvolvido por{' '}
            <a
              href="https://fenixsb.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent hover:underline"
            >
              Fênix Solutions & Build
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
