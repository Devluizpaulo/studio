
import { Button } from "@/components/ui/button";
import { Landmark, Briefcase, Heart, Shield, Scale } from "lucide-react";
import Image from "next/image";
import { TeamSection } from "./TeamSection";
import placeholderImagesData from "@/lib/placeholder-images.json";
import { db } from "@/lib/firebase-admin";
import { Badge } from "@/components/ui/badge";
import { ContactForm } from "./ContactForm";

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

async function getPageData() {
    if (!db) {
        console.warn("Firebase Admin (db) is not initialized. Using default data.");
        return { mainLawyer: null, whatsappLink: "https://wa.me/" };
    }
    try {
        const officeSnapshot = await db.collection("offices").limit(1).get();
        if (officeSnapshot.empty) {
            return { mainLawyer: null, whatsappLink: "https://wa.me/" };
        }
        const officeData = officeSnapshot.docs[0].data();

        let mainLawyer = null;
        if (officeData.ownerId) {
            const lawyerSnapshot = await db.collection('users').doc(officeData.ownerId).get();
            if (lawyerSnapshot.exists) {
                const lawyerData = lawyerSnapshot.data();
                if (lawyerData) {
                    mainLawyer = {
                        id: lawyerSnapshot.id,
                        fullName: lawyerData.fullName,
                        legalSpecialty: lawyerData.legalSpecialty,
                        bio: lawyerData.bio,
                        photoUrl: lawyerData.photoUrl,
                        office: lawyerData.office,
                    };
                }
            }
        }
        
        return {
            mainLawyer,
            whatsappLink: officeData.whatsappLink || "https://wa.me/",
        };

    } catch (error) {
        console.error("Error fetching page data:", error);
        return { mainLawyer: null, whatsappLink: "https://wa.me/" };
    }
}


const displaySpecialties = (specialties: string[] | string | undefined) => {
    if (!specialties) return null;
    const specialtiesArray = Array.isArray(specialties) ? specialties : (typeof specialties === 'string' ? specialties.split(',').map(s => s.trim()) : []);

    if (specialtiesArray.length > 0) {
        return (
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {specialtiesArray.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
            </div>
        )
    }
    return null;
}


export default async function Home() {
  const placeholderImages: any[] = placeholderImagesData;
  const heroImages = placeholderImages.filter(p => p.section === 'hero');
  const lawyerPortrait = heroImages.find(p => p.id === 'lawyer-portrait-hero');
  
  const { mainLawyer, whatsappLink } = await getPageData();
  const mainLawyerImage = placeholderImages.find(p => p.id === 'main-lawyer');

  return (
    <div className="flex flex-col bg-background text-foreground">
      
      {/* Hero Section - Split Screen Layout */}
      <section className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Content */}
        <div className="flex flex-col justify-center bg-background p-8 lg:p-16">
          <div className="mx-auto w-full max-w-md space-y-8 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start items-center gap-4 mb-4">
              <Scale className="h-12 w-12 text-primary" />
              <div>
                <h2 className="text-2xl font-bold font-headline text-foreground">{mainLawyer?.office || 'RGJM'}</h2>
                <p className="font-semibold text-primary/80 tracking-widest">ADVOCACIA</p>
              </div>
            </div>

            <p className="font-semibold text-primary uppercase tracking-wider">Seus direitos como consumidor, levados a sério.</p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight font-headline">
               Problemas com uma Compra ou Serviço? Recupere o Controle.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
                Proteção e justiça para o consumidor. Assessoria especializada para resolver seu caso de forma rápida e eficaz.
            </p>
            <Button asChild size="lg" className="w-full lg:w-auto text-lg py-7 px-8 rounded-lg shadow-lg hover:shadow-primary/20 transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    Fale com um Advogado
                </a>
            </Button>
          </div>
        </div>
        
        {/* Right Side: Image */}
        <div className="relative hidden h-full min-h-[50vh] lg:block">
            {lawyerPortrait && (
                <Image
                  src={lawyerPortrait.src}
                  alt={lawyerPortrait.alt}
                  fill
                  className="object-cover"
                  priority
                  data-ai-hint={lawyerPortrait.hint}
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
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

      {/* About Section */}
      {mainLawyer && (
          <section id="about" className="py-24 sm:py-32 bg-background">
              <div className="container mx-auto grid grid-cols-1 gap-12 px-4 md:grid-cols-2 md:items-center">
                  <div className="h-[500px] w-full relative rounded-lg overflow-hidden shadow-2xl">
                       <Image
                          src={mainLawyer.photoUrl || mainLawyerImage?.src || "https://placehold.co/600x800.png"}
                          alt={mainLawyerImage?.alt || `Advogado(a) ${mainLawyer.fullName}`}
                          fill
                          className="object-cover"
                          data-ai-hint={mainLawyerImage?.hint || "lawyer portrait"}
                        />
                  </div>
                  <div>
                      <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">O sucesso na sua causa demanda uma defesa e consultoria especializadas.</h2>
                       <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-justify">
                         {mainLawyer.bio || "Compreendemos que cada caso é único e exige uma abordagem dedicada. Nosso compromisso é com a defesa intransigente dos seus interesses, aplicando um profundo conhecimento técnico e uma visão estratégica para alcançar os melhores resultados. Buscamos a excelência em cada etapa, garantindo que seus direitos sejam sempre preservados."}
                      </p>
                      <p className="mt-6 text-xl font-semibold text-foreground font-headline">{mainLawyer.fullName}</p>
                       <p className="mt-1 text-md text-primary/80">{mainLawyer.office}</p>
                      <div className="mt-2">
                          {displaySpecialties(mainLawyer.legalSpecialty)}
                      </div>
                  </div>
              </div>
          </section>
      )}

       <TeamSection />

      {/* Contact Section */}
      <section id="contact" className="py-24 sm:py-32">
        <div className="container mx-auto grid grid-cols-1 gap-16 px-4 md:grid-cols-2 md:items-center">
           <div className="text-center md:text-left">
              <p className="font-semibold text-primary uppercase tracking-wider">Fale Conosco</p>
              <h2 className="mt-2 font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Pronto para dar o próximo passo?</h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                  Seja para uma consulta inicial, para discutir um caso complexo ou para entender melhor seus direitos, nossa equipe está pronta para ouvir. Preencha o formulário ao lado ou, se preferir um contato mais direto, clique no botão para falar conosco via WhatsApp.
              </p>
              <div className="mt-8 flex justify-center md:justify-start">
                  <Button asChild size="lg" className="text-lg py-7 px-8 rounded-lg shadow-lg hover:shadow-primary/20 transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                      Fale no WhatsApp
                    </a>
                  </Button>
              </div>
          </div>
          <div className="w-full">
            <ContactForm />
          </div>
        </div>
      </section>
       <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg z-50 hover:bg-green-600 transition-transform hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7"><path d="M16.6 14c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.7-.8.9-.1.1-.3.1-.5 0-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.2.3-.3.1-.1.2-.3.1-.4-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2 1 2.3c.1.1 1.5 2.3 3.6 3.2.5.2.8.3 1.1.4.5.1 1 .1 1.3.1.4 0 1.1-.5 1.3-1 .2-.5.2-1 .1-1.1-.1-.1-.3-.2-.5-.3zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/></svg>
      </a>
    </div>
  );
}
