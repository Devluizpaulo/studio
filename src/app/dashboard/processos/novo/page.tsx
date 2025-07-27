import { NewProcessForm } from "./NewProcessForm";
import { AuthProvider } from "@/contexts/AuthContext";

export default function NewProcessPage() {
  return (
    <AuthProvider>
        <div className="space-y-6">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">
            Cadastrar Novo Processo
            </h1>
            <p className="mt-2 text-muted-foreground">
            Preencha as informações abaixo para adicionar um novo caso à sua carteira.
            </p>
        </div>
        <NewProcessForm />
        </div>
    </AuthProvider>
  );
}