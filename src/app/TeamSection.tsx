
import { db } from "@/lib/firebase-admin";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

async function getTeamMembers() {
  if (!db) {
      console.warn("Firebase Admin is not initialized. Skipping getTeamMembers.");
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
        photoUrl: data.photoUrl
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

    if (team.length === 0) {
        return null;
    }

    // The first user (master) is the main lawyer. We show it separately.
    const mainLawyer = team.find(member => member.id === 'UcgSrjP2jEN4v5Vfa8qMR86G3LN2');
    const otherLawyers = team.filter(member => member.id !== 'UcgSrjP2jEN4v5Vfa8qMR86G3LN2');

    const displaySpecialties = (specialties: string[] | string | undefined) => {
        if (!specialties) return null;
        if (Array.isArray(specialties)) {
            return (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {specialties.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                </div>
            )
        }
        return <p className="text-sm text-accent">{specialties}</p>
    }


    return (
        <>
            {mainLawyer && (
                <section id="philosophy" className="py-24 sm:py-32">
                    <div className="container mx-auto grid grid-cols-1 gap-12 px-4 md:grid-cols-2 md:items-center">
                        <div className="h-[500px] w-full relative rounded-lg overflow-hidden shadow-2xl">
                             <Image
                                src="/reinaldo.png"
                                alt={`Advogado(a) ${mainLawyer.fullName}`}
                                fill
                                className="object-cover"
                                data-ai-hint="lawyer portrait"
                              />
                        </div>
                        <div>
                            <h2 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl">O sucesso na sua causa demanda uma defesa e consultoria especializadas.</h2>
                             <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-justify">
                               {mainLawyer.bio || "Compreendemos que cada caso é único e exige uma abordagem dedicada. Nosso compromisso é com a defesa intransigente dos seus interesses, aplicando um profundo conhecimento técnico e uma visão estratégica para alcançar os melhores resultados. Buscamos a excelência em cada etapa, garantindo que seus direitos sejam sempre preservados."}
                            </p>
                            <p className="mt-6 text-xl font-semibold text-primary font-headline">{mainLawyer.fullName}</p>
                            <div className="mt-2">
                                {displaySpecialties(mainLawyer.legalSpecialty)}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {otherLawyers.length > 0 && (
                 <section id="team" className="py-24 sm:py-32">
                    <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl text-center mb-16">
                        <h2 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl">Conheça Nossa Equipe</h2>
                        <p className="mt-4 text-lg text-muted-foreground">Profissionais dedicados e prontos para defender seus direitos.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {otherLawyers.map((member) => (
                        <Card key={member.id} className="bg-card/80 border-border text-center flex flex-col">
                            <CardHeader className="items-center">
                                <div className="relative h-40 w-40 rounded-full mb-4 overflow-hidden border-4 border-accent/20">
                                    <Image 
                                        src={member.photoUrl || "https://placehold.co/400x400.png"}
                                        alt={`Foto de ${member.fullName}`}
                                        fill
                                        className="object-cover"
                                        data-ai-hint="lawyer portrait"
                                    />
                                </div>
                                <CardTitle className="font-headline text-2xl text-primary">{member.fullName}</CardTitle>
                                <div className="mt-2 h-12">
                                    {displaySpecialties(member.legalSpecialty)}
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-muted-foreground text-sm text-justify">{member.bio || "Advogado(a) especialista com vasta experiência e dedicação à justiça."}</p>
                            </CardContent>
                        </Card>
                        ))}
                    </div>
                    </div>
                </section>
            )}
        </>
    )
}
