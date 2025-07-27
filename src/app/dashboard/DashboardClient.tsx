"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Briefcase, CalendarClock, Users } from "lucide-react";

const stats = [
  { title: "Processos Ativos", value: "12", icon: <Briefcase className="h-8 w-8 text-accent" /> },
  { title: "Próximos Prazos", value: "3", icon: <CalendarClock className="h-8 w-8 text-accent" /> },
  { title: "Clientes", value: "8", icon: <Users className="h-8 w-8 text-accent" /> },
];

export function DashboardClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    // You can show a loading spinner here
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
            <h1 className="font-headline text-3xl font-bold text-primary">
                Bem-vindo(a), {user.displayName || 'Advogado(a)'}!
            </h1>
            <p className="text-foreground/80 mt-2">
                Aqui está um resumo da sua atividade.
            </p>
        </div>
        <Button size="lg" className="mt-4 sm:mt-0" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Novo Processo
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium text-foreground/90">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

       <div className="mt-12">
        <h2 className="font-headline text-2xl font-bold text-primary mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <Button variant="outline" size="lg" className="justify-start text-base py-8">
                <Briefcase className="mr-4 h-6 w-6" /> Ver Todos os Processos
             </Button>
             <Button variant="outline" size="lg" className="justify-start text-base py-8">
                <CalendarClock className="mr-4 h-6 w-6" /> Gerenciar Agenda
             </Button>
             <Button variant="outline" size="lg" className="justify-start text-base py-8">
                <Users className="mr-4 h-6 w-6" /> Meus Clientes
             </Button>
        </div>
       </div>

    </div>
  );
}
