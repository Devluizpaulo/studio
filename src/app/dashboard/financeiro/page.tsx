import { AuthProvider } from "@/contexts/AuthContext";
import { FinanceiroClient } from "./FinanceiroClient";

export default function FinanceiroPage() {
    return (
        <AuthProvider>
            <FinanceiroClient />
        </AuthProvider>
    )
}
