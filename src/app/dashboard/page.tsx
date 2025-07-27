import { DashboardClient } from "./DashboardClient";
import { AuthProvider } from "@/contexts/AuthContext";

export default function DashboardPage() {
  return (
    <AuthProvider>
        <DashboardClient />
    </AuthProvider>
  );
}