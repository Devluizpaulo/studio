import { AuthProvider } from "@/contexts/AuthContext";
import { ProcessDetailClient } from "./ProcessDetailClient";

export default function ProcessDetailPage() {
    return (
        <AuthProvider>
            <ProcessDetailClient />
        </AuthProvider>
    )
}
