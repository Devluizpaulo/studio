"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, DocumentData, Timestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Briefcase, Users, CalendarClock } from "lucide-react";
import Link from "next/link";
import { ProcessList, Process } from "./ProcessList";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      setLoading(true);
      // Fetch Processes
      const processesQuery = query(collection(db, "processes"), where("lawyerId", "==", user.uid));
      const unsubscribeProcesses = onSnapshot(processesQuery, (querySnapshot) => {
        const processesData: Process[] = [];
        querySnapshot.forEach((doc) => {
          processesData.push({ id: doc.id, ...doc.data() } as Process);
        });
        setProcesses(processesData);
        // Defer setting loading to false until both queries have their initial data.
      }, (error) => {
        console.error("Error fetching processes: ", error);
        setLoading(false);
      });

      // Fetch upcoming events for deadline count
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      const eventsQuery = query(
        collection(db, "events"), 
        where("lawyerId", "==", user.uid),
        where("date", ">=", Timestamp.fromDate(today)),
        where("date", "<=", Timestamp.fromDate(nextWeek)),
      );
      const unsubscribeEvents = onSnapshot(eventsQuery, (querySnapshot) => {
        setUpcomingDeadlines(querySnapshot.size);
        setLoading(false); // Set loading to false after the second query completes
      }, (error) => {
        console.error("Error fetching events: ", error);
        setLoading(false);
      });

      // Cleanup subscriptions on unmount
      return () => {
        unsubscribeProcesses();
        unsubscribeEvents();
      };
    }
  }, [user, authLoading, router]);

  if (authLoading || loading || !user) {
    return (
       <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
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
         <div className="mt-4">
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
    { title: "Prazos (7 dias)", value: upcomingDeadlines.toString(), icon: <CalendarClock className="h-8 w-8 text-accent" />, href: "/dashboard/agenda" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">
                Bem-vindo(a), {user.displayName || 'Advogado(a)'}!
            </h2>
            <p className="text-muted-foreground mt-1">
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
        {stats.map((stat) => {
            const CardBody = (
              <CardContent>
                <div className="text-4xl font-bold text-primary">{stat.value}</div>
              </CardContent>
            );

            const CardWrapper = ({ children }: { children: React.ReactNode }) => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium text-foreground/90">{stat.title}</CardTitle>
                        {stat.icon}
                    </CardHeader>
                    {children}
                </Card>
            );

            if (stat.href) {
                return (
                    <Link href={stat.href} key={stat.title}>
                        <CardWrapper>{CardBody}</CardWrapper>
                    </Link>
                );
            }
            return <CardWrapper>{CardBody}</CardWrapper>;
        })}
      </div>

       <div className="mt-4">
        <h3 className="text-xl font-bold tracking-tight mb-4">Processos Recentes</h3>
        <ProcessList processes={processes.slice(0, 5)} />
       </div>
    </div>
  );
}
