import { AuthProvider } from "@/contexts/AuthContext";
import { ClientesClient } from "./ClientesClient";

export default function ClientesPage() {
    return (
        <AuthProvider>
             <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">
                        Clientes do Escritório
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Visualize e gerencie a sua carteira de clientes.
                    </p>
                </div>
                <ClientesClient />
            </div>
        </AuthProvider>
    )
}
