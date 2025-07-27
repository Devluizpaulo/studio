import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Bot, Briefcase } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: <Briefcase className="h-10 w-10 text-accent" />,
    title: "Gestão de Processos",
    description: "Otimize sua rotina, gerencie processos com eficiência e utilize nossa IA para obter insights.",
    link: "/signup",
  },
  {
    icon: <Bot className="h-10 w-10 text-accent" />,
    title: "Assistente IA",
    description: "Resumos de documentos, respostas para dúvidas e auxílio na criação de petições.",
    link: "/summarize",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="bg-primary/5 py-24 sm:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-6xl">
            JurisAI: A Revolução na Gestão Jurídica para Advogados
          </h1>
          <p className="mt-6 text-lg leading-8 text-foreground/80">
            Inteligência Artificial a serviço da sua advocacia.
            Modernize sua prática e tenha controle total sobre seus processos.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
              <Link href="/signup">
                Cadastre-se Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#features">Saiba Mais</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">Uma Plataforma Completa para o Advogado Moderno</h2>
            <p className="mt-6 text-lg leading-8 text-foreground/80">
              Oferecemos ferramentas poderosas para cada necessidade do seu dia a dia.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.title} className="transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                <CardHeader className="items-center">
                  {feature.icon}
                  <CardTitle className="font-headline text-2xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-foreground/70">{feature.description}</p>
                   <Button asChild variant="link" className="mt-4">
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
      
      <section id="ia-features" className="bg-primary/5 py-24 sm:py-32">
        <div className="container mx-auto grid grid-cols-1 gap-12 px-4 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">Potencializado por Inteligência Artificial</h2>
            <p className="mt-6 text-lg leading-relaxed text-foreground/80">
              Nosso assistente com IA generativa ajuda a resumir documentos complexos, responder dúvidas jurídicas e até a gerar modelos de petições, permitindo que você foque no que realmente importa: a estratégia jurídica.
            </p>
             <Button asChild size="lg" className="mt-8" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
              <Link href="/summarize">
                Experimente o Resumo IA
              </Link>
            </Button>
          </div>
          <div className="h-80 w-full overflow-hidden rounded-lg shadow-xl">
             <Image
                src="https://placehold.co/600x400.png"
                alt="Inteligência Artificial Jurídica"
                width={600}
                height={400}
                className="h-full w-full object-cover"
                data-ai-hint="artificial intelligence abstract"
              />
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 sm:py-32">
        <div className="container mx-auto px-4">
           <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">Fale Conosco</h2>
            <p className="mt-6 text-lg leading-8 text-foreground/80">
              Tem alguma dúvida ou sugestão? Entre em contato com nossa equipe.
            </p>
          </div>
          <Card className="mx-auto mt-16 max-w-xl">
            <CardContent className="p-8">
               <p className="text-center text-foreground/80">
                Para suporte ou informações, envie um e-mail para <a href="mailto:contato@jurisai.com" className="text-accent underline">contato@jurisai.com</a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
