
import { db } from "@/lib/firebase-admin";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import placeholderImagesData from "@/lib/placeholder-images.json";

async function getTeamMembers() {
  if (!db) {
      console.warn("Firebase Admin (db) is not initialized. Skipping getTeamMembers.");
      return [];
  }
  try {
    const usersCollection = db.collection('users');
    const snapshot = await usersCollection.where('role', 'in', ['master', 'lawyer']).get();
    
    if (snapshot.empty) {
      return [];
    }

    const members = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        fullName: data.fullName,
        legalSpecialty: data.legalSpecialty,
        bio: data.bio,
        photoUrl: data.photoUrl,
        role: data.role,
      };
    });
    return members;
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
}


export async function TeamSection() {
    const team = await getTeamMembers();
    const placeholderImages: any[] = placeholderImagesData;

    if (team.length === 0) {
        return null;
    }

    const mainLawyer = team.find(member => member.role === 'master');
    const otherLawyers = team.filter(member => member.role !== 'master');
    
    const teamImages = placeholderImages.filter(p => p.section === 'team');
    const mainLawyerImage = teamImages.find(p => p.id === 'main-lawyer');


    const displaySpecialties = (specialties: string[] | string | undefined) => {
        if (!specialties) return null;
        if (Array.isArray(specialties) && specialties.length > 0) {
            return (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {specialties.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                </div>
            )
        }
        if (typeof specialties === 'string' && specialties) {
             return <p className="text-sm text-primary">{specialties}</p>
        }
        return null;
    }

    return (
        <>
            {mainLawyer && (
                <section id="about" className="py-24 sm:py-32 bg-card">
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
                            <div className="mt-2">
                                {displaySpecialties(mainLawyer.legalSpecialty)}
                            </div>
                        </div>
                    </div>
                </section>
            )}
             {otherLawyers.length > 0 && (
                <section id="team" className="py-24 sm:py-32 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Nossa Equipe</h2>
                            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Conheça os profissionais dedicados que estão por trás do nosso sucesso e prontos para lutar pela sua causa.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {otherLawyers.map((member) => (
                                <Card key={member.id} className="text-center overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-card">
                                    <CardHeader className="p-0">
                                        <div className="relative mx-auto h-56 w-full">
                                            {member.photoUrl ? (
                                                <Image src={member.photoUrl} alt={`Foto de ${member.fullName}`} fill className="object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-muted">
                                                    <User className="h-24 w-24 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <CardTitle className="text-2xl">{member.fullName}</CardTitle>
                                        <div className="mt-3 min-h-[40px]">
                                            {displaySpecialties(member.legalSpecialty)}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-center bg-card/50 p-6">
                                       <p className="text-sm text-muted-foreground text-center">{member.bio || "Advogado(a) especialista com vasta experiência."}</p>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
