import { AuthProvider } from "@/contexts/AuthContext";
import { ControleInternoClient } from "./ControleInternoClient";

export default function ControleInternoPage() {
    return (
        <AuthProvider>
            <ControleInternoClient />
        </AuthProvider>
    )
}
