
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Scale, Briefcase, Users, Landmark, Phone, ArrowRight, Star, Shield, Award, Clock, MapPin, User, BookOpen, Gavel, MessageCircle, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AnimatedCounter } from "@/components/ui/animated-counter";

const services = [
  {
    icon: <Scale className="h-8 w-8" />,
    title: "Direito Cível",
    description: "Soluções jurídicas para contratos, obrigações e responsabilidade civil."
  },
  {
    icon: <Briefcase className="h-8 w-8" />,
    title: "Direito Trabalhista",
    description: "Defesa dos direitos de trabalhadores e empresas."
  },
  {
    icon: <Landmark className="h-8 w-8" />,
    title: "Direito Tributário",
    description: "Consultoria e contencioso tributário especializado."
  },
];

const values = [
  {
    icon: <Award className="h-8 w-8" />,
    title: "Experiência",
    description: "Anos de experiência e centenas de casos de sucesso nos tornam referência em nossa área de atuação."
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Confidencialidade",
    description: "Sua privacidade é nossa prioridade. Todo atendimento é realizado com total discrição."
  },
  {
    icon: <Star className="h-8 w-8" />,
    title: "Eficiência",
    description: "Compromisso com resultados rápidos e efetivos, priorizando a satisfação do cliente."
  },
];

const testimonials = [
  {
    name: "João Silva",
    text: "O Dr. Reinaldo resolveu meu caso trabalhista de forma rápida e eficiente. Recomendo fortemente!"
  },
  {
    name: "Maria Santos",
    text: "Excelente atendimento e profissionalismo. Conseguiu resolver uma questão complexa de herança."
  },
];

const WHATSAPP_LINK = "https://wa.me/5511968285695?text=Olá, encontrei o site do escritório RGMJ e gostaria de uma consulta.";

const WhatsappButton = () => (
    <a 
        href={WHATSAPP_LINK}
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-all duration-300 transform hover:scale-110 flex items-center justify-center animate-pulse"
        aria-label="Contato via WhatsApp"
    >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
    </a>
)

export default function Home() {
  return (
    <div className="flex flex-col bg-background text-foreground">
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Image with Legal Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/85 z-0">
          {/* Legal Elements Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-32 h-32">
              <Scale className="w-full h-full text-accent/30" />
            </div>
            <div className="absolute bottom-40 left-20 w-24 h-24">
              <Gavel className="w-full h-full text-accent/20" />
            </div>
            <div className="absolute top-1/2 left-1/3 w-20 h-20">
              <BookOpen className="w-full h-full text-accent/25" />
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 z-10 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-8">
              {/* Logo */}
              <div className="mb-8">
                <div className="text-4xl font-bold tracking-wider bg-gradient-to-r from-accent to-yellow-400 bg-clip-text text-transparent">
                  RGMJ
                </div>
              </div>
              
              {/* Main Title */}
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Somos a solução de todos os seus problemas jurídicos
              </h1>
              
              {/* Description */}
              <p className="text-xl text-muted-foreground leading-relaxed">
                Com anos de experiência e centenas de casos de sucesso, nossa equipe prioriza resolver suas pendências judiciais com eficácia, dinamismo, eficiência e agilidade. Oferecemos atendimento personalizado nas áreas cível, trabalhista e tributário.
              </p>
              
              {/* CTA Button */}
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6 px-8 rounded-lg shadow-2xl hover:shadow-accent/25 transition-all duration-300">
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                  Fale conosco agora
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
            </div>
            
            {/* Right - Lawyer Photo with Legal Elements */}
            <div className="relative">
              <div className="relative w-full max-w-md mx-auto">
                          
                <Image
                  src="/hero.png"
                  alt="Dr. Reinaldo - Advogado"
                  width={600}
                  height={600}
                  className="rounded-2xl shadow-2xl relative z-10"
                  priority
                />
                                
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/20 to-transparent opacity-50 z-5"></div>
              </div>
            </div>
          </div>
        </div>
                
      </section>

      {/* Services Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Nossas especialidades:
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {services.map((service, index) => (
              <Card key={index} className="bg-white text-black border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-accent/10 rounded-full">
                      {service.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <div key={index} className="bg-card/80 p-8 rounded-lg border border-border">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-accent/10 rounded-full">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-4">{value.title}</h3>
                <p className="text-muted-foreground text-center leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Feedback dos nossos clientes
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Testimonials */}
            <div className="space-y-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-card/80 p-6 rounded-lg border border-border">
                  <p className="text-muted-foreground mb-4 leading-relaxed">"{testimonial.text}"</p>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                </div>
              ))}
              
              <div className="pt-6">
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6 px-8 rounded-lg">
                  <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                    Fale conosco agora
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>
            
            {/* Justice Statue */}
            <div className="flex justify-center">
              <div className="relative">
                <Scale className="h-64 w-64 text-accent opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Gavel className="h-16 w-16 text-accent mx-auto mb-4" />
                    <p className="text-accent font-serif italic text-lg">Justiça</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Quem somos nós?
            </h2>
            {/* Latin Phrase */}
            <div className="space-y-2">
              <p className="text-accent font-serif italic text-lg">
                "Fiat justitia ruat caelum"
              </p>
              <p className="text-muted-foreground text-sm">
                Que a justiça seja feita, ainda que o céu caia
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Lawyer Photo */}
            <div className="relative">
              {/* Background Frame */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5 rounded-3xl blur-xl"></div>
              
              {/* Photo Container */}
              <div className="relative overflow-hidden rounded-3xl">
                <Image
                  src="/adv.png"
                  alt="Dr. Reinaldo - Advogado"
                  width={500}
                  height={600}
                  className="object-cover w-full h-auto transition-all duration-500 hover:scale-105"
                  priority
                />
                
                {/* Soft Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent"></div>
                
                {/* Subtle Border Glow */}
                <div className="absolute inset-0 rounded-3xl border border-accent/20"></div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-accent/10 rounded-full blur-sm animate-pulse"></div>
              <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-accent/15 rounded-full blur-sm animate-pulse delay-1000"></div>
              
              {/* Professional Badge */}
              <div className="absolute -bottom-4 -right-4 bg-gradient-to-br from-accent to-yellow-400 text-accent-foreground p-4 rounded-full shadow-2xl hover:shadow-accent/25 transition-all duration-300 transform hover:scale-110">
                <Gavel className="h-8 w-8" />
              </div>
            </div>
            
            {/* Content */}
            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                O sucesso no enfrentamento de um processo jurídico demanda uma defesa especializada.
              </h3>
              
              <p className="text-muted-foreground leading-relaxed text-lg">
                O escritório RGMJ, sob a liderança do Dr. Reinaldo, é reconhecido pela excelência jurídica e compromisso com a justiça. Nossa equipe oferece atendimento personalizado e estratégico, sempre priorizando os interesses de nossos clientes.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                Atuamos nas áreas do Direito Cível, Trabalhista e Tributário, oferecendo soluções jurídicas completas e eficazes. Nossa missão é proporcionar segurança jurídica e resultados satisfatórios, mantendo sempre a ética e a transparência em todas as relações profissionais.
              </p>
              
              
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6 px-8 rounded-lg shadow-2xl hover:shadow-accent/25 transition-all duration-300 transform hover:-translate-y-1">
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                  <Phone className="h-5 w-5" />
                  Fale comigo agora!
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white mb-4">
                Contato
              </h2>
              
              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-accent" />
                  <span className="text-white">contato@rgmj.com.br</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-6 w-6 text-accent" />
                  <span className="text-white">(11) 96828-5695</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-accent" />
                  <span className="text-white">São Paulo, SP</span>
                </div>
              </div>
              
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6 px-8 rounded-lg">
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                  Chamar no WhatsApp
                  <MessageCircle className="h-5 w-5" />
                </a>
              </Button>
            </div>
            
            {/* Contact Form */}
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Nome"
                  className="w-full p-4 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-4 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <textarea
                  placeholder="Mensagem"
                  rows={4}
                  className="w-full p-4 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-accent resize-none"
                ></textarea>
              </div>
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-4 rounded-lg">
                Enviar mensagem
              </Button>
            </div>
          </div>
        </div>
      </section>
       
      <WhatsappButton />
    </div>
  );
}
