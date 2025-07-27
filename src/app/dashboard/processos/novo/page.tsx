import { NewProcessForm } from "./NewProcessForm";

export default function NewProcessPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          Cadastrar Novo Processo
        </h1>
        <p className="mt-6 text-lg leading-8 text-foreground/80">
          Preencha as informações abaixo para adicionar um novo caso à sua carteira.
        </p>
      </div>
      <NewProcessForm />
    </div>
  );
}
