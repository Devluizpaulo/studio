import { AuthProvider } from "@/contexts/AuthContext";
import { ControleInternoClient } from "./ControleInternoClient";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";


export default function ControleInternoPage() {
    return (
        <AuthProvider>
            <ControleInternoClient />
        </AuthProvider>
    )
}
