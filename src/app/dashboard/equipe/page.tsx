import { AuthProvider } from "@/contexts/AuthContext";
import { EquipeClient } from "./EquipeClient";

export default function EquipePage() {
    return (
        <AuthProvider>
            <EquipeClient />
        </AuthProvider>
    )
}
