import { AuthProvider } from "@/contexts/AuthContext";
import { ClientesClient } from "./ClientesClient";

export default function ClientesPage() {
    return (
        <AuthProvider>
            <ClientesClient />
        </AuthProvider>
    )
}
