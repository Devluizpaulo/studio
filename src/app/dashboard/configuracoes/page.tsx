import { AuthProvider } from "@/contexts/AuthContext";
import { ConfiguracoesClient } from "./ConfiguracoesClient";

export default function ConfiguracoesPage() {
    return (
        <AuthProvider>
             <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">
                       Configurações do Escritório
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Gerencie as configurações e integrações do seu escritório.
                    </p>
                </div>
                <ConfiguracoesClient />
            </div>
        </AuthProvider>
    )
}
