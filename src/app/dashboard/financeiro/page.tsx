import { FinanceiroClient } from "./FinanceiroClient";

export default function FinanceiroPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">
                    Controle Financeiro
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Gerencie as finanças e tarefas administrativas do escritório.
                </p>
            </div>
            <FinanceiroClient />
        </div>
    )
}
