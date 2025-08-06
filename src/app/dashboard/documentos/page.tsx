import { DocumentosClient } from "./DocumentosClient";

export default function DocumentosPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">
                    Modelos de Documentos
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Crie e gerencie modelos de documentos para sua equipe.
                </p>
            </div>
            <DocumentosClient />
        </div>
    )
}
