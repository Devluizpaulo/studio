
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Scale, Briefcase, Users, Landmark, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TeamSection } from "./TeamSection";

const services = [
  {
    icon: <Scale className="h-10 w-10 text-accent" />,
    title: "Direito Cível & Família",
    description: "Soluções jurídicas para contratos, obrigações, heranças e todas as questões do direito de família.",
  },
  {
    icon: <Briefcase className="h-10 w-10 text-accent" />,
    title: "Direito Trabalhista",
    description: "Defesa dos direitos de trabalhadores e empresas, buscando sempre a justiça e o equilíbrio nas relações de trabalho.",
  },
   {
    icon: <Landmark className="h-10 w-10 text-accent" />,
    title: "Direito Tributário",
    description: "Consultoria e contencioso tributário para pessoas físicas e jurídicas, visando a otimização fiscal.",
  },
];

const specialties = [
  "Ações de Indenização por Danos Morais e Materiais",
  "Direito do Consumidor",
  "Questões de Herança, Inventários e Testamentos",
  "Divórcio, Guarda e Pensão Alimentícia",
  "Reconhecimento e Dissolução de União Estável",
  "Direitos do Trabalhador (rescisão, horas extras, etc.)",
  "Defesa em Reclamações Trabalhistas para Empresas",
  "Planejamento Tributário e Recuperação de Créditos",
  "Defesa em Execuções Fiscais",
  "Consultoria sobre Impostos (IR, ICMS, ISS)",
  "Elaboração e Revisão de Contratos",
  "Pareceres e consultoria jurídica especializada",
];

const WHATSAPP_LINK = "https://wa.me/5511999999999?text=Olá, encontrei o site do escritório RGMJ e gostaria de uma consulta.";

const WhatsappButton = () => (
    <a 
        href={WHATSAPP_LINK}
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-transform transform hover:scale-110 flex items-center justify-center"
        aria-label="Contato via WhatsApp"
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
    </a>
)


export default function Home() {
  return (
    <div className="flex flex-col bg-background text-foreground">
      
      {/* Hero Section */}
      <section 
        id="home"
        className="relative pt-32 pb-20 text-center"
      >
        <div className="glow-effect" />
        <div className="container mx-auto px-4 z-10 relative">
          <div className="max-w-4xl mx-auto">
             <Image
                src="/logo.png"
                alt="Logo RGMJ Advocacia e Consultoria Jurídica"
                width={800}
                height={400}
                className="mx-auto max-w-lg"
                priority
              />
            <p className="mt-8 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Atuação dedicada e estratégica na defesa dos seus direitos nas áreas cível, trabalhista, família e tributário.
            </p>
            <div className="mt-10">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-7 px-10">
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  Fale Conosco via WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center mb-16">
            <h2 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl">Áreas de Atuação</h2>
            <p className="mt-4 text-lg text-muted-foreground">Compromisso e excelência na defesa dos seus direitos.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {services.map((service) => (
              <Card key={service.title} className="bg-card/80 border-border text-center transform transition-all duration-300 hover:-translate-y-2 hover:border-accent/80 hover:shadow-2xl hover:shadow-accent/10">
                <CardHeader className="items-center">
                  <div className="p-4 rounded-full mb-4">
                    {service.icon}
                  </div>
                  <CardTitle className="font-headline text-2xl text-primary">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-left">
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <TeamSection />
      
      {/* Specialties Section */}
      <section id="specialties" className="py-24 sm:py-32 bg-card/80">
         <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl">Nossas Especialidades</h2>
              <p className="mt-4 text-lg text-muted-foreground">Oferecemos uma assessoria jurídica completa e detalhada.</p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 max-w-6xl mx-auto">
              {specialties.map((item) => (
                <div key={item} className="flex items-start">
                  <Check className="h-6 w-6 text-accent mr-3 mt-1 flex-shrink-0"/>
                  <span className="text-lg text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
         </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 sm:py-32">
        <div className="container mx-auto px-4">
           <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl">Agende uma Consulta</h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
             Está pronto para dar o próximo passo? Clique no botão abaixo para nos enviar uma mensagem diretamente no WhatsApp. Nossa equipe está pronta para atendê-lo.
            </p>
          </div>
          <div className="mt-10 text-center">
              <Button asChild size="lg" className="w-full max-w-sm bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-7">
                  <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                    <Phone className="mr-3 h-6 w-6"/>
                    Iniciar Conversa no WhatsApp
                  </a>
               </Button>
          </div>
        </div>
      </section>
      <WhatsappButton />
    </div>
  );
}
