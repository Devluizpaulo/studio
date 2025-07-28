import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileClient } from "./ProfileClient";

export default function ProfilePage() {
    return (
        <AuthProvider>
            <ProfileClient />
        </AuthProvider>
    )
}
