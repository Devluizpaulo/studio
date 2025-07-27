import { AuthProvider } from "@/contexts/AuthContext";
import { ProcessosClient } from "./ProcessosClient";

export default function ProcessosPage() {
    return (
        <AuthProvider>
            <ProcessosClient />
        </AuthProvider>
    )
}
