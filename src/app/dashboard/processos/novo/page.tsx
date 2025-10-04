import { NewProcessForm } from "./NewProcessForm";

export default function NewProcessPage() {
  return (
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
  );
}
