import { AuthProvider } from "@/contexts/AuthContext";
import { AgendaClient } from "./AgendaClient";

export default function AgendaPage() {
    return (
        <AuthProvider>
            <AgendaClient />
        </AuthProvider>
    )
}
