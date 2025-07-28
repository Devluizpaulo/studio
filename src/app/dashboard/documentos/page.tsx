import { AuthProvider } from "@/contexts/AuthContext";
import { DocumentosClient } from "./DocumentosClient";

export default function DocumentosPage() {
    return (
        <AuthProvider>
            <DocumentosClient />
        </AuthProvider>
    )
}
