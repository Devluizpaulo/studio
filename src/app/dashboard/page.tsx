import { DashboardClient } from "./DashboardClient";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">
                Visão Geral
            </h1>
            <p className="mt-2 text-muted-foreground">
                Seu centro de comando para gestão jurídica inteligente.
            </p>
        </div>
        <DashboardClient />
    </div>
  );
}
