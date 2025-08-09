
import { Button } from "@/components/ui/button";
import { Check, Scale, Briefcase, Gavel, Shield, Globe } from "lucide-react";
import Image from "next/image";

const WHATSAPP_LINK = "https://wa.me/5511968285695?text=Olá, encontrei o site e gostaria de uma consulta.";

const services = [
  {
    icon: <Shield className="h-8 w-8 text-accent" />,
    title: "Advocacia Criminal",
    description: "Defesa estratégica para casos complexos, garantindo seus direitos em todas as instâncias."
  },
  {
    icon: <Gavel className="h-8 w-8 text-accent" />,
    title: "Tribunal do Júri",
    description: "Atuação especializada e combativa no Tribunal do Júri, com vasta experiência em plenário."
  },
  {
    icon: <Globe className="h-8 w-8 text-accent" />,
    title: "Todo Brasil",
    description: "Conte com nosso atendimento especializado e defesa estratégica em qualquer região do país."
  },
];

const specialties = [
    "Crimes de organização criminosa",
    "Crimes de Homicídio",
    "Ações de improbidade administrativa",
    "Crimes licitatórios",
    "Crimes aduaneiros",
    "Investigação defensiva",
    "Crimes militares",
    "Crimes contra a administração pública",
    "Atuação perante Tribunais Superiores",
    "Crimes de lavagem de dinheiro",
    "Crimes contra o meio ambiente",
    "Crimes de estelionato",
    "Crimes contra o sistema financeiro",
    "Crimes da Lei de drogas",
    "Crimes tributários",
    "Acordo de não persecução penal",
    "Lei Maria da Penha"
];


export default function Home() {
  return (
    <div className="flex flex-col bg-background text-foreground">
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10"></div>
        <Image
          src="https://placehold.co/1920x1080.png"
          alt="Escritório de advocacia"
          layout="fill"
          objectFit="cover"
          className="z-0 opacity-20"
          data-ai-hint="library background"
        />
        
        <div className="container mx-auto px-4 z-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
                <div className="p-8 border-2 border-accent/30 rounded-lg bg-background/50 backdrop-blur-md">
                    <div className="text-center lg:text-left mb-6">
                        <h2 className="text-4xl font-bold font-headline text-accent">REINALDO GONÇALVES</h2>
                        <p className="font-semibold text-white">ADVOCACIA E CONSULTORIA</p>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight font-headline mb-2">
                        Advocacia Criminal Especializada
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                        Proteja seus direitos e garanta uma defesa sólida em casos criminais.
                    </p>
                    <Button asChild size="lg" className="w-full lg:w-auto bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6 px-8 rounded-lg shadow-lg hover:shadow-accent/20 transition-all duration-300">
                        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                        Falar com o Advogado
                        </a>
                    </Button>
                </div>
            </div>
            
            <div className="hidden lg:flex justify-center">
                <Image
                  src="https://placehold.co/500x700.png"
                  alt="Advogado Reinaldo Gonçalves"
                  width={500}
                  height={700}
                  className="rounded-lg shadow-2xl"
                  priority
                  data-ai-hint="lawyer portrait"
                />
            </div>
          </div>
        </div>
      </section>

      {/* Thin Divider */}
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {services.map((service, index) => (
              <div key={index} className="bg-card/50 p-8 rounded-lg text-center border border-accent/20">
                <div className="flex justify-center mb-4">
                    {service.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-headline">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties Section */}
       <section id="specialties" className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-accent font-headline">
              Algumas das nossas especialidades
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 max-w-6xl mx-auto">
            {specialties.map((specialty, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="h-5 w-5 text-accent flex-shrink-0" />
                <span className="text-muted-foreground">{specialty}</span>
              </div>
            ))}
          </div>
           <div className="text-center mt-12">
                <p className="text-muted-foreground mb-4">Se você está enfrentando alguma situação criminal, entre em contato conosco e agende sua consulta agora mesmo.</p>
                 <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6 px-8 rounded-lg shadow-lg hover:shadow-accent/20 transition-all duration-300">
                    <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                    Falar com o Advogado
                    </a>
                </Button>
                <p className="text-muted-foreground text-sm mt-2">Atendimento para todo Brasil.</p>
           </div>
        </div>
      </section>


      {/* About Section */}
      <section id="about" className="py-24 sm:py-32">
        <div className="container mx-auto grid grid-cols-1 gap-12 px-4 md:grid-cols-2 md:items-center">
            <div className="h-[500px] w-full relative rounded-lg overflow-hidden shadow-2xl">
                    <Image
                    src="https://placehold.co/600x800.png"
                    alt="Advogado em reflexão"
                    fill
                    className="object-cover"
                    data-ai-hint="lawyer profile"
                    />
            </div>
            <div>
                <h2 className="font-headline text-3xl font-bold tracking-tight text-accent sm:text-4xl">O sucesso no enfrentamento de um processo criminal, demanda uma defesa especializada.</h2>
                    <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-justify">
                    Se você está sendo acusado de cometer um crime, é fundamental contar com um advogado especializado nesse tema e que se empenhará incansavelmente em seu favor, assegurando a preservação dos seus direitos. Meus objetivos centrais é preservar os direitos fundamentais garantidos pela Constituição, buscando sempre a estratégia mais eficaz na busca pela preservação da liberdade e pela justiça.
                </p>
                <p className="mt-6 text-xl font-semibold text-primary font-headline">Reinaldo Gonçalves</p>
                <p className="text-sm text-accent">Advogado Criminalista</p>
            </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto items-center">
            <div className="space-y-4 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-accent font-headline">Fale comigo</h2>
              <p className="text-muted-foreground">Não envie uma mensagem, pois as respostas podem levar dias. Agilize seu atendimento e fale conosco direto pelo WhatsApp. Garantimos que nossa equipe responderá o mais breve possível!</p>
               <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-4 px-8 rounded-lg shadow-lg hover:shadow-accent/20 transition-all duration-300">
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
                    <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-3 rounded-lg">
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
