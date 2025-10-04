
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
    // Fetch only non-master lawyers now
    const snapshot = await usersCollection.where('role', '==', 'lawyer').get();
    
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
    const otherLawyers = await getTeamMembers();
    const placeholderImages: any[] = placeholderImagesData;

    if (otherLawyers.length === 0) {
        return null;
    }
    
    const otherLawyerImages = placeholderImages.filter(p => p.id.startsWith('other-lawyer'));


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

    return (
        <>
            {otherLawyers.length > 0 && (
                <section id="team" className="py-24 sm:py-32 bg-card">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Nossa Equipe</h2>
                            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Conheça os profissionais dedicados que estão por trás do nosso sucesso e prontos para lutar pela sua causa.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {otherLawyers.map((member, index) => {
                                const placeholderImage = otherLawyerImages[index % otherLawyerImages.length];
                                return (
                                <Card key={member.id} className="text-center overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-background">
                                    <CardHeader className="p-0">
                                        <div className="relative mx-auto h-56 w-full">
                                            <Image 
                                                src={member.photoUrl || placeholderImage?.src || "https://placehold.co/600x600"} 
                                                alt={`Foto de ${member.fullName}`} 
                                                fill 
                                                className="object-cover" 
                                                data-ai-hint={placeholderImage?.hint || "lawyer portrait"}
                                            />
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
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
