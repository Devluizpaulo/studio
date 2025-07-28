import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Bot, Briefcase, DraftingCompass } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: <Briefcase className="h-10 w-10 text-accent" />,
    title: "Gestão de Processos",
    description: "Otimize sua rotina, gerencie processos com eficiência e tenha uma visão clara de todos os seus casos.",
    link: "/signup",
  },
  {
    icon: <Bot className="h-10 w-10 text-accent" />,
    title: "Assistente IA",
    description: "Utilize nossa IA para obter insights, resumir documentos e acelerar a criação de petições.",
    link: "/summarize",
  },
   {
    icon: <DraftingCompass className="h-10 w-10 text-accent" />,
    title: "Documentos Inteligentes",
    description: "Gere rascunhos de petições e outros documentos alinhados com sua tese jurídica.",
    link: "/signup",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="bg-background">
        <div className="container mx-auto px-4 pt-24 pb-16 sm:pt-32 sm:pb-24 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-6xl">
            JurisAI: A Revolução na Gestão Jurídica para Advogados
          </h1>
          <p className="mt-6 text-lg leading-8 text-foreground/80 max-w-3xl mx-auto">
            Inteligência Artificial a serviço da sua advocacia.
            Modernize sua prática, automatize tarefas e tenha controle total sobre seus processos.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
              <Link href="/signup">
                Comece a Usar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#features">Saiba Mais</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 sm:py-32 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">Uma Plataforma Completa para o Advogado Moderno</h2>
            <p className="mt-6 text-lg leading-8 text-foreground/80">
              Oferecemos ferramentas poderosas para cada necessidade do seu dia a dia.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                <CardHeader className="items-center text-center">
                  <div className="bg-accent/10 p-4 rounded-full mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="font-headline text-2xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-foreground/70">{feature.description}</p>
                   <Button asChild variant="link" className="mt-4 text-accent">
                      <Link href={feature.link}>
                        Começar <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <section id="ia-features" className="bg-background py-24 sm:py-32">
        <div className="container mx-auto grid grid-cols-1 gap-12 px-4 md:grid-cols-2 md:items-center">
          <div className="h-96 w-full overflow-hidden rounded-lg shadow-xl">
             <Image
                src="https://placehold.co/600x400.png"
                alt="Inteligência Artificial Jurídica"
                width={600}
                height={400}
                className="h-full w-full object-cover"
                data-ai-hint="artificial intelligence abstract"
              />
          </div>
          <div>
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">Potencializado por Inteligência Artificial</h2>
            <p className="mt-6 text-lg leading-relaxed text-foreground/80">
              Nosso assistente com IA generativa ajuda a resumir documentos complexos, responder dúvidas jurídicas e até a gerar modelos de petições, permitindo que você foque no que realmente importa: a estratégia jurídica.
            </p>
             <Button asChild size="lg" className="mt-8" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
              <Link href="/summarize">
                Experimente o Resumo com IA
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 sm:py-32 bg-secondary/30">
        <div className="container mx-auto px-4">
           <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">Pronto para transformar sua advocacia?</h2>
            <p className="mt-6 text-lg leading-8 text-foreground/80">
             Crie sua conta e comece a usar as ferramentas que vão levar seu escritório para o próximo nível.
            </p>
            <div className="mt-10">
                <Button asChild size="lg" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                  <Link href="/signup">
                    Criar minha conta agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
