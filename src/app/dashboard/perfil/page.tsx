import { ProfileClient } from "./ProfileClient";

export default function ProfilePage() {
    return (
        <div className="space-y-6">
                <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">
                    Meu Perfil
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Gerencie suas informações profissionais e personalize a sua experiência com a IA.
                </p>
            </div>
            <ProfileClient />
        </div>
    )
}
