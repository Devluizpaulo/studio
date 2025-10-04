import { Button } from "@/components/ui/button";
import { Landmark, Briefcase, Heart, Shield } from "lucide-react";
import Image from "next/image";
import { TeamSection } from "./TeamSection";
import placeholderImages from "@/lib/placeholder-images.json";

const WHATSAPP_LINK = "https://wa.me/5511968285695?text=Olá, encontrei o site e gostaria de uma consulta.";

const practiceAreas = [
  {
    icon: <Landmark className="h-8 w-8 text-accent" />,
    title: "Direito Civil",
    description: "Soluções para contratos, obrigações, responsabilidade civil e questões do dia a dia."
  },
  {
    icon: <Briefcase className="h-8 w-8 text-accent" />,
    title: "Direito Trabalhista",
    description: "Defesa dos direitos de trabalhadores e empresas, buscando relações de trabalho justas."
  },
  {
    icon: <Heart className="h-8 w-8 text-accent" />,
    title: "Família e Sucessões",
    description: "Assessoria em divórcios, partilhas, heranças e planejamentos sucessórios com sensibilidade."
  },
  {
    icon: <Shield className="h-8 w-8 text-accent" />,
    title: "Direito Criminal",
    description: "Defesa estratégica para casos complexos, garantindo seus direitos em todas as instâncias."
  },
];


export default function Home() {
  const heroImages = placeholderImages.filter(p => p.section === 'hero');
  const officeImage = heroImages.find(p => p.id === 'office-background');
  const lawyerPortrait = heroImages.find(p => p.id === 'lawyer-portrait-hero');

  return (
    <div className="flex flex-col bg-background text-foreground">
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10"></div>
        {officeImage && (
            <Image
              src={officeImage.src}
              alt={officeImage.alt}
              layout="fill"
              objectFit="cover"
              className="z-0 opacity-20"
              data-ai-hint={officeImage.hint}
            />
        )}
        
        <div className="container mx-auto px-4 z-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
                <div className="p-8 border-2 border-accent/30 rounded-lg bg-background/70 backdrop-blur-md">
                    <div className="text-center lg:text-left mb-6">
                        <h2 className="text-4xl font-bold font-headline text-accent">RGJM</h2>
                        <p className="font-semibold text-white">ADVOCACIA E CONSULTORIA</p>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight font-headline mb-2">
                        Assessoria Jurídica Completa e Especializada
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                        Proteja seus direitos e garanta uma defesa sólida com a nossa equipe de especialistas.
                    </p>
                    <Button asChild size="lg" className="w-full lg:w-auto text-lg py-6 px-8 rounded-lg shadow-lg hover:shadow-accent/20 transition-all duration-300">
                        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                        Falar com um Advogado
                        </a>
                    </Button>
                </div>
            </div>
            
            <div className="hidden lg:flex justify-center">
                {lawyerPortrait && (
                    <Image
                      src={lawyerPortrait.src}
                      alt={lawyerPortrait.alt}
                      width={500}
                      height={700}
                      className="rounded-lg shadow-2xl"
                      priority
                      data-ai-hint={lawyerPortrait.hint}
                    />
                )}
            </div>
          </div>
        </div>
      </section>

      {/* Thin Divider */}
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>

      {/* Practice Areas Section */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-accent font-headline">
                Nossas Áreas de Atuação
              </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {practiceAreas.map((area, index) => (
              <div key={index} className="bg-card/50 p-8 rounded-lg text-center border border-accent/20 hover:border-accent/50 hover:bg-card transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex justify-center mb-4">
                    {area.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-headline">{area.title}</h3>
                <p className="text-muted-foreground">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TeamSection />

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto items-center">
            <div className="space-y-4 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-accent font-headline">Fale comigo</h2>
              <p className="text-muted-foreground">Não envie uma mensagem, pois as respostas podem levar dias. Agilize seu atendimento e fale conosco direto pelo WhatsApp. Garantimos que nossa equipe responderá o mais breve possível!</p>
               <Button asChild size="lg" className="text-lg py-4 px-8 rounded-lg shadow-lg hover:shadow-accent/20 transition-all duration-300">
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  Clique aqui
                </a>
              </Button>
            </div>
            
            <div className="bg-background/50 p-8 rounded-lg">
                 <form className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">Nome</label>
                        <input
                        id="name"
                        type="text"
                        className="w-full p-3 bg-input border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                        <input
                        id="email"
                        type="email"
                        className="w-full p-3 bg-input border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-muted-foreground mb-1">Mensagem</label>
                        <textarea
                        id="message"
                        rows={4}
                        className="w-full p-3 bg-input border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                        ></textarea>
                    </div>
                    <Button type="submit" className="w-full text-lg py-3 rounded-lg">
                        Enviar Mensagem
                    </Button>
                </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
