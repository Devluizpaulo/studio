import { AuthProvider } from "@/contexts/AuthContext";
import { ControleInternoClient } from "./ControleInternoClient";

export default function ControleInternoPage() {
    return (
        <AuthProvider>
             <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">
                       Controle Interno
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Gerencie as tarefas administrativas do escritório.
                    </p>
                </div>
                <ControleInternoClient />
            </div>
        </AuthProvider>
    )
}
