import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Scale, Briefcase, Users, Landmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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


export default function Home() {
  return (
    <div className="flex flex-col bg-background text-foreground">
      {/* Hero Section */}
      <section 
        id="home"
        className="relative flex h-[80vh] min-h-[600px] items-center justify-center text-center text-white"
      >
        <div className="absolute inset-0 bg-black/60 z-10"/>
        <Image
            src="https://placehold.co/1920x1080.png"
            alt="Escritório de advocacia"
            layout="fill"
            objectFit="cover"
            className="z-0"
            data-ai-hint="lawyer office background"
        />
        <div className="relative z-20 container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block p-6 border-2 border-accent/80">
              <h1 className="font-headline text-5xl font-bold tracking-tight text-white sm:text-7xl uppercase">
                Reinaldo Gonçalves Miguel de Jesus
              </h1>
              <p className="text-2xl text-accent font-semibold mt-2">
                Advocacia Especializada
              </p>
            </div>
            <p className="mt-8 text-lg leading-8 text-gray-200 max-w-2xl mx-auto">
              Atuação dedicada e estratégica na defesa dos seus direitos nas áreas cível, trabalhista, família e tributário.
            </p>
            <div className="mt-10">
              <Button asChild size="lg" variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-7 px-10">
                <Link href="#contact">
                  Entre em Contato
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {services.map((service) => (
              <Card key={service.title} className="bg-card border-accent/20 text-center transform transition-transform duration-300 hover:-translate-y-2">
                <CardHeader className="items-center">
                  <div className="p-4 rounded-full mb-4">
                    {service.icon}
                  </div>
                  <CardTitle className="font-headline text-2xl text-primary">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section id="specialties" className="py-24 sm:py-32 bg-card">
         <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl">Nossas Áreas de Atuação</h2>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 max-w-4xl mx-auto">
              {specialties.map((item) => (
                <div key={item} className="flex items-start">
                  <Check className="h-6 w-6 text-accent mr-3 mt-1 flex-shrink-0"/>
                  <span className="text-lg text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
             <div className="text-center mt-16">
               <p className="text-muted-foreground mb-6">Se você precisa de assessoria jurídica, entre em contato e agende sua consulta.</p>
                <Button asChild size="lg" variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-7 px-10">
                  <Link href="#contact">
                    Fale Conosco
                  </Link>
                </Button>
                <p className="text-accent font-semibold mt-3">Atendimento em todo Brasil.</p>
            </div>
         </div>
      </section>

      {/* Philosophy Section */}
       <section id="philosophy" className="py-24 sm:py-32">
        <div className="container mx-auto grid grid-cols-1 gap-12 px-4 md:grid-cols-2 md:items-center">
          <div className="h-[500px] w-full relative">
             <Image
                src="https://placehold.co/600x800.png"
                alt="Advogado Reinaldo Gonçalves"
                layout="fill"
                objectFit="cover"
                className="rounded-lg shadow-xl"
                data-ai-hint="lawyer portrait"
              />
          </div>
          <div>
            <h2 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl">O sucesso na sua causa demanda uma defesa e consultoria especializadas.</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
             Compreendemos que cada caso é único e exige uma abordagem dedicada. Meu compromisso é com a defesa intransigente dos seus interesses, aplicando um profundo conhecimento técnico e uma visão estratégica para alcançar os melhores resultados. Buscamos a excelência em cada etapa, garantindo que seus direitos sejam sempre preservados.
            </p>
             <p className="mt-6 text-xl font-semibold text-primary font-headline">Reinaldo Gonçalves Miguel de Jesus</p>
             <p className="text-sm text-accent">Advogado - OAB/SP 123.456</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 sm:py-32 bg-card">
        <div className="container mx-auto px-4">
           <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl">Fale Conosco</h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
             Envie uma mensagem contando como podemos lhe ajudar. Nossa equipe responderá o mais breve possível para agendar uma consulta!
            </p>
          </div>
          <div className="mt-16 mx-auto max-w-lg">
            <form action="#" className="space-y-6">
               <Input placeholder="Nome" name="name" className="bg-background h-12"/>
               <Input placeholder="Email" name="email" type="email" className="bg-background h-12"/>
               <Textarea placeholder="Mensagem" name="message" rows={5} className="bg-background"/>
               <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-7">
                  Enviar Mensagem
               </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
