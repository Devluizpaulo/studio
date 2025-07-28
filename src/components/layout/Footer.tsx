import Link from "next/link";
import { Mail, Phone, MapPin, Scale } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card text-primary-foreground border-t border-accent/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div>
            <div className="flex items-center space-x-2">
                <Scale className="h-8 w-8 text-accent"/>
                <h3 className="font-headline text-2xl font-semibold text-primary">JurisAI</h3>
            </div>
            <p className="mt-4 text-muted-foreground">
              A plataforma inteligente para gestão jurídica.
            </p>
          </div>
          <div>
            <h3 className="font-headline text-xl font-semibold text-primary">Contato</h3>
            <ul className="mt-4 space-y-3 text-muted-foreground">
              <li className="flex items-center">
                <Mail className="mr-3 h-5 w-5 text-accent" />
                <span>contato@jurisai.com</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-3 h-5 w-5 text-accent" />
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-center">
                <MapPin className="mr-3 h-5 w-5 text-accent" />
                <span>Atendimento em todo o Brasil</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline text-xl font-semibold text-primary">Navegação</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/#services" className="text-muted-foreground hover:text-accent transition-colors">Atuação</Link></li>
              <li><Link href="/#specialties" className="text-muted-foreground hover:text-accent transition-colors">Especialidades</Link></li>
              <li><Link href="/login" className="text-muted-foreground hover:text-accent transition-colors">Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border/50 pt-8 text-center text-muted-foreground/60">
          <p>&copy; {new Date().getFullYear()} JurisAI. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
