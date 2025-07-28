import { AuthProvider } from "@/contexts/AuthContext";
import { AgendaClient } from "./AgendaClient";

export default function AgendaPage() {
    return (
        <AuthProvider>
             <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">
                        Agenda
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                       Gerencie seus compromissos, prazos e audiências.
                    </p>
                </div>
                <AgendaClient />
            </div>
        </AuthProvider>
    )
}
