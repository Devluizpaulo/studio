import { AuthProvider } from "@/contexts/AuthContext";
import { ProcessosClient } from "./ProcessosClient";

export default function ProcessosPage() {
    return (
        <AuthProvider>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Meus Processos</h2>
                    <p className="text-muted-foreground">Gerencie todos os seus casos em um só lugar.</p>
                </div>
                <ProcessosClient />
            </div>
        </AuthProvider>
    )
}
