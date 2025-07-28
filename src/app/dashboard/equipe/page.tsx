import { AuthProvider } from "@/contexts/AuthContext";
import { EquipeClient } from "./EquipeClient";

export default function EquipePage() {
    return (
        <AuthProvider>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">
                       Gestão de Equipe
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                       Gerencie os membros do seu escritório.
                    </p>
                </div>
                <EquipeClient />
            </div>
        </AuthProvider>
    )
}
