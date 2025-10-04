
import { Button } from "@/components/ui/button";
import { Landmark, Briefcase, Heart, Shield, Scale, CalendarCheck2 } from "lucide-react";
import Image from "next/image";
import { TeamSection } from "./TeamSection";
import placeholderImagesData from "@/lib/placeholder-images.json";

const WHATSAPP_LINK = "https://wa.me/5511968285695?text=Olá, encontrei o site e gostaria de uma consulta.";

const practiceAreas = [
  {
    icon: <Landmark className="h-8 w-8 text-primary" />,
    title: "Direito Civil",
    description: "Soluções para contratos, obrigações, responsabilidade civil e questões do dia a dia."
  },
  {
    icon: <Briefcase className="h-8 w-8 text-primary" />,
    title: "Direito Trabalhista",
    description: "Defesa dos direitos de trabalhadores e empresas, buscando relações de trabalho justas."
  },
  {
    icon: <Heart className="h-8 w-8 text-primary" />,
    title: "Família e Sucessões",
    description: "Assessoria em divórcios, partilhas, heranças e planejamentos sucessórios com sensibilidade."
  },
  {
    icon: <Shield className="h-8 w-8 text-primary" />,
    title: "Direito Criminal",
    description: "Defesa estratégica para casos complexos, garantindo seus direitos em todas as instâncias."
  },
];


export default function Home() {
  const placeholderImages: any[] = placeholderImagesData;
  const heroImages = placeholderImages.filter(p => p.section === 'hero');
  const officeImage = heroImages.find(p => p.id === 'office-background');
  const lawyerPortrait = heroImages.find(p => p.id === 'lawyer-portrait-hero');

  return (
    <div className="flex flex-col bg-background text-foreground">
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
         {officeImage && (
             <div 
                className="absolute inset-0 bg-cover bg-center bg-fixed z-0 opacity-10"
                style={{ backgroundImage: `url(${officeImage.src})` }}
                data-ai-hint={officeImage.hint}
            ></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent z-10"></div>
        
        <div className="container mx-auto px-4 z-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6 text-center lg:text-left">
                <div className="flex justify-center lg:justify-start items-center gap-4 mb-4">
                    <Scale className="h-12 w-12 text-primary" />
                    <div>
                        <h2 className="text-2xl font-bold font-headline text-foreground">RGJM</h2>
                        <p className="font-semibold text-primary/80 tracking-widest">ADVOCACIA</p>
                    </div>
                </div>

                <p className="font-semibold text-primary uppercase tracking-wider">Seus direitos como consumidor, levados a sério.</p>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight font-headline">
                   Problemas com uma Compra ou Serviço? Recupere o Controle e Exija Seus Direitos.
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                    Proteção e justiça para o consumidor. Assessoria especializada para resolver seu caso.
                </p>
                <Button asChild size="lg" className="w-full lg:w-auto text-lg py-7 px-8 rounded-lg shadow-lg hover:shadow-primary/20 transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                        <CalendarCheck2 className="mr-3 h-6 w-6"/>
                        Agende sua Consulta
                    </a>
                </Button>
            </div>
            
            <div className="hidden lg:flex justify-center items-end">
                {lawyerPortrait && (
                    <Image
                      src={lawyerPortrait.src}
                      alt={lawyerPortrait.alt}
                      width={450}
                      height={650}
                      className="object-contain"
                      priority
                      data-ai-hint={lawyerPortrait.hint}
                    />
                )}
            </div>
          </div>
        </div>
      </section>

      {/* Practice Areas Section */}
      <section id="services" className="py-24 sm:py-32 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground font-headline">
                Nossas Áreas de Atuação
              </h2>
               <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Oferecemos consultoria e representação jurídica em diversas áreas do direito, sempre com foco na excelência e na defesa intransigente dos seus interesses.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {practiceAreas.map((area, index) => (
              <div key={index} className="bg-background p-8 rounded-lg text-center border border-border hover:border-primary/50 hover:bg-card/50 transition-all duration-300 transform hover:-translate-y-2 shadow-lg hover:shadow-primary/10">
                <div className="flex justify-center mb-4">
                    {area.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2 font-headline">{area.title}</h3>
                <p className="text-muted-foreground">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

       <TeamSection />

      {/* Contact Section */}
      <section id="contact" className="py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground font-headline">Pronto para dar o próximo passo?</h2>
            <p className="text-muted-foreground text-lg mt-4">Para agilizar seu atendimento, recomendamos o contato direto via WhatsApp. Nossa equipe está pronta para avaliar seu caso e oferecer a melhor solução jurídica.</p>
            <div className="mt-8">
              <Button asChild size="lg" className="text-lg py-7 px-8 rounded-lg shadow-lg hover:shadow-primary/20 transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                Fale Conosco Agora no WhatsApp
              </a>
            </Button>
            </div>
          </div>
        </div>
      </section>
       <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg z-50 hover:bg-green-600 transition-transform hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path><path d="M14.05 2.95a16 16 0 0 1 8 8M14.05 6.95a12 12 0 0 1 4 4"></path></svg>
      </a>
    </div>
  );
}
