"use client"
import Link from "next/link";
import { Scale, Instagram, Linkedin } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  if (isDashboard) {
    return null;
  }
  
  return (
    <footer className="bg-card border-t border-accent/20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          {/* Coluna 1: Identidade e Social */}
          <div className="flex flex-col items-center md:items-start">
             <Link href="/" className="mb-4 flex items-center space-x-2">
                <Scale className="h-8 w-8 text-primary" />
                <span className="font-headline text-xl font-bold text-foreground">
                RGJM Advocacia
                </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
                Defendendo seus direitos com excelência e dedicação.
            </p>
            <div className="mt-6 flex space-x-4">
               <a 
                    href="https://www.instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                >
                    <Instagram className="h-6 w-6" />
                    <span className="sr-only">Instagram</span>
                </a>
                 <a 
                    href="https://www.linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                >
                    <Linkedin className="h-6 w-6" />
                    <span className="sr-only">LinkedIn</span>
                </a>
            </div>
          </div>

          {/* Coluna 2: Navegação */}
          <div>
            <h4 className="font-headline text-lg font-semibold text-foreground mb-4">Navegação</h4>
            <ul className="space-y-3">
              <li><Link href="/#services" className="text-muted-foreground hover:text-primary transition-colors">Áreas de Atuação</Link></li>
              <li><Link href="/#about" className="text-muted-foreground hover:text-primary transition-colors">Sobre Nós</Link></li>
              <li><Link href="/#team" className="text-muted-foreground hover:text-primary transition-colors">Nossa Equipe</Link></li>
              <li><Link href="/#contact" className="text-muted-foreground hover:text-primary transition-colors">Contato</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Contato */}
          <div>
            <h4 className="font-headline text-lg font-semibold text-foreground mb-4">Entre em Contato</h4>
            <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center justify-center md:justify-start">
                    <span className="font-semibold">Endereço:&nbsp;</span>Rua Fictícia, 123, São Paulo/SP
                </li>
                 <li className="flex items-center justify-center md:justify-start">
                   <span className="font-semibold">Telefone:&nbsp;</span>(11) 99999-9999
                </li>
                 <li className="flex items-center justify-center md:justify-start">
                    <span className="font-semibold">Email:&nbsp;</span>contato@rgjm.com.br
                </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border/50 py-6">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
            <p className="mb-1">
                © 2024 RGJM Advocacia. Todos os direitos reservados.
            </p>
            <p>
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