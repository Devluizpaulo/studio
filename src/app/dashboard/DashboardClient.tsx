"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, DocumentData } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Briefcase, Users } from "lucide-react";
import Link from "next/link";
import { ProcessList, Process } from "./ProcessList";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      const q = query(collection(db, "processes"), where("lawyerId", "==", user.uid));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const processesData: Process[] = [];
        querySnapshot.forEach((doc) => {
          processesData.push({ id: doc.id, ...doc.data() } as Process);
        });
        setProcesses(processesData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching processes: ", error);
        setLoading(false);
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading || !user) {
    return (
       <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div className="space-y-2">
                <Skeleton className="h-9 w-72" />
                <Skeleton className="h-6 w-96" />
            </div>
            <Skeleton className="h-12 w-48 mt-4 sm:mt-0" />
        </div>
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
         </div>
         <div className="mt-12">
             <Skeleton className="h-8 w-64 mb-4" />
             <Skeleton className="h-48 w-full" />
         </div>
      </div>
    );
  }

  const activeProcessesCount = processes.filter(p => p.status === 'active').length;
  const clientCount = new Set(processes.map(p => p.clientName)).size;

  const stats = [
    { title: "Processos Ativos", value: activeProcessesCount.toString(), icon: <Briefcase className="h-8 w-8 text-accent" /> },
    { title: "Clientes", value: clientCount.toString(), icon: <Users className="h-8 w-8 text-accent" /> },
  ];

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
        <Button asChild size="lg" className="mt-4 sm:mt-0" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
          <Link href="/dashboard/processos/novo">
            <PlusCircle className="mr-2 h-5 w-5" />
            Novo Processo
          </Link>
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
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium text-foreground/90">Próximos Prazos</CardTitle>
              <Briefcase className="h-8 w-8 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">0</div>
               <p className="text-xs text-muted-foreground">Funcionalidade em breve</p>
            </CardContent>
          </Card>
      </div>

       <div className="mt-12">
        <h2 className="font-headline text-2xl font-bold text-primary mb-4">Processos Recentes</h2>
        <ProcessList processes={processes} />
       </div>
    </div>
  );
}
