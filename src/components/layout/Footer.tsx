"use client"
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-8 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Logo and Tagline */}
          <div className="text-center md:text-left">
            <div className="mb-3">
              <div className="text-2xl font-bold tracking-wider bg-gradient-to-r from-accent to-yellow-400 bg-clip-text text-transparent">
                RGMJ
              </div>
              <p className="text-xs text-accent mt-1">ADVOCACIA E CONSULTORIA JURÍDICA</p>
            </div>
            <p className="text-muted-foreground text-xs">
              Advocacia e Consultoria Jurídica.
            </p>
          </div>
          
          {/* Center Column - Contact */}
          <div className="text-center">
            <h3 className="text-white font-semibold mb-3 text-sm">Contato</h3>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-3 w-3 text-accent" />
                <span className="text-muted-foreground text-xs">contato@rgmj.com.br</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Phone className="h-3 w-3 text-accent" />
                <span className="text-muted-foreground text-xs">(11) 96828-5695</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <MapPin className="h-3 w-3 text-accent" />
                <span className="text-muted-foreground text-xs">São Paulo, SP</span>
              </div>
            </div>
          </div>
          
          {/* Right Column - Navigation */}
          <div className="text-center md:text-right">
            <h3 className="text-white font-semibold mb-3 text-sm">Navegação</h3>
            <div className="space-y-1">
              <div>
                <a href="#services" className="text-muted-foreground text-xs hover:text-accent transition-colors">
                  Atuação
                </a>
              </div>
              <div>
                <a href="#specialties" className="text-muted-foreground text-xs hover:text-accent transition-colors">
                  Especialidades
                </a>
              </div>
              <div>
                <a href="/dashboard" className="text-muted-foreground text-xs hover:text-accent transition-colors">
                  Login
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section - Copyright and Domain */}
        <div className="text-center pt-4 border-t border-border">
          <p className="text-muted-foreground text-xs mb-1">
            © 2024 RGMJ Advocacia. Todos os direitos reservados.
          </p>
          <p className="text-muted-foreground text-xs">
            <a href="https://rgmj.adv.br" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
              RGMJ.ADV.BR
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
