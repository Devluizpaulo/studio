import { AuthProvider } from "@/contexts/AuthContext";
import { ProcessosClient } from "./ProcessosClient";

export default function ProcessosPage() {
    return (
        <AuthProvider>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">
                        Meus Processos
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Gerencie todos os seus casos em um só lugar.
                    </p>
                </div>
                <ProcessosClient />
            </div>
        </AuthProvider>
    )
}
