"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getClientDetailsAction } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { User, Briefcase, DollarSign, Calendar, Mail, Phone, FileText, ChevronRight } from "lucide-react"

type ClientDetailsData = {
    client: any;
    processes: any[];
    financialTasks: any[];
    events: any[];
}

const statusVariantMap: { [key: string]: "default" | "secondary" | "outline" | "destructive" } = {
    a_distribuir: "secondary",
    em_andamento: "default",
    em_recurso: "default",
    execucao: "default",
    arquivado_provisorio: "outline",
    arquivado_definitivo: "destructive",
};

const statusTextMap: { [key: string]: string } = {
    a_distribuir: "A Distribuir",
    em_andamento: "Em Andamento",
    em_recurso: "Em Recurso",
    execucao: "Execução",
    arq_provisorio: "Arq. Provisório",
    arq_definitivo: "Arq. Definitivo",
}

export function ClienteDetailClient({ clientId }: { clientId: string }) {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    const [details, setDetails] = useState<ClientDetailsData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push("/login");
            return;
        }

        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, async (docSnap) => {
            if (docSnap.exists()) {
                const officeId = docSnap.data().officeId;
                if (!officeId) {
                    toast({ title: "Erro", description: "Usuário não associado a um escritório.", variant: "destructive" });
                    setLoading(false);
                    return;
                }
                const result = await getClientDetailsAction(clientId, officeId);
                if (result.success) {
                    setDetails(result.data);
                } else {
                    toast({ title: "Erro ao carregar cliente", description: result.error, variant: "destructive" });
                    router.push("/dashboard/clientes");
                }
                setLoading(false);
            } else {
                router.push("/login");
            }
        });

        return () => unsubscribeUser();
    }, [user, authLoading, router, clientId, toast]);
    
    const handleProcessRowClick = (processId: string) => {
        router.push(`/dashboard/processos/${processId}`);
    };


    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-3/4" />
                <div className="grid md:grid-cols-2 gap-6">
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!details) {
        return <p>Não foi possível carregar os detalhes do cliente.</p>;
    }

    const { client, processes, financialTasks, events } = details;
    
    const maritalStatusMap: { [key: string]: string } = {
        solteiro: "Solteiro(a)",
        casado: "Casado(a)",
        divorciado: "Divorciado(a)",
        viuvo: "Viúvo(a)",
        uniao_estavel: "União Estável"
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary font-headline flex items-center">
                    <User className="mr-3 h-7 w-7" />
                    {client.fullName}
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Visão completa das informações e atividades do cliente.
                </p>
            </div>
            
             <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="info"><User className="mr-2 h-4 w-4"/>Dados Cadastrais</TabsTrigger>
                    <TabsTrigger value="processes"><Briefcase className="mr-2 h-4 w-4"/>Processos ({processes.length})</TabsTrigger>
                    <TabsTrigger value="financial"><DollarSign className="mr-2 h-4 w-4"/>Financeiro ({financialTasks.length})</TabsTrigger>
                    <TabsTrigger value="events"><Calendar className="mr-2 h-4 w-4"/>Agenda ({events.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="info">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações de Contato e Pessoais</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                                <div><p className="font-semibold text-muted-foreground">Nome Completo</p><p>{client.fullName}</p></div>
                                <div><p className="font-semibold text-muted-foreground">CPF/CNPJ</p><p>{client.document}</p></div>
                                <div><p className="font-semibold text-muted-foreground">RG</p><p>{client.rg}</p></div>
                                <div><p className="font-semibold text-muted-foreground">Email</p><p className="flex items-center gap-2"><Mail className="h-4 w-4"/>{client.email}</p></div>
                                <div><p className="font-semibold text-muted-foreground">Telefone</p><p className="flex items-center gap-2"><Phone className="h-4 w-4"/>{client.phone}</p></div>
                                <div><p className="font-semibold text-muted-foreground">Nacionalidade</p><p>{client.nationality}</p></div>
                                <div><p className="font-semibold text-muted-foreground">Estado Civil</p><p>{maritalStatusMap[client.maritalStatus]}</p></div>
                                <div><p className="font-semibold text-muted-foreground">Profissão</p><p>{client.profession}</p></div>
                                <div className="md:col-span-3"><p className="font-semibold text-muted-foreground">Endereço</p><p>{client.address}</p></div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="processes">
                    <Card>
                        <CardHeader><CardTitle>Processos Vinculados</CardTitle></CardHeader>
                        <CardContent>
                           {processes.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Número do Processo</TableHead>
                                            <TableHead>Tipo de Ação</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                            <TableHead className="text-right"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {processes.map((p) => (
                                            <TableRow key={p.id} onClick={() => handleProcessRowClick(p.id)} className="cursor-pointer">
                                                <TableCell className="font-medium">{p.processNumber}</TableCell>
                                                <TableCell>{p.actionType}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={statusVariantMap[p.status] || 'default'}>
                                                        {statusTextMap[p.status] || p.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right"><ChevronRight className="h-4 w-4" /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                           ) : (
                               <p className="text-muted-foreground text-center py-8">Nenhum processo encontrado para este cliente.</p>
                           )}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                 <TabsContent value="financial">
                    <Card>
                        <CardHeader><CardTitle>Histórico Financeiro</CardTitle></CardHeader>
                        <CardContent>
                           {financialTasks.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead>Processo</TableHead>
                                            <TableHead>Vencimento</TableHead>
                                            <TableHead>Valor</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {financialTasks.map((task) => (
                                            <TableRow key={task.id}>
                                                <TableCell className="font-medium">{task.title}</TableCell>
                                                <TableCell>{task.processNumber || 'N/A'}</TableCell>
                                                <TableCell>{format(task.dueDate.toDate(), 'dd/MM/yyyy')}</TableCell>
                                                <TableCell>R$ {task.value.toFixed(2)}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={task.status === 'pago' ? 'secondary' : 'default'}>
                                                        {task.status === 'pago' ? 'Pago' : 'Pendente'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                           ) : (
                                <p className="text-muted-foreground text-center py-8">Nenhum lançamento financeiro encontrado.</p>
                           )}
                        </CardContent>
                    </Card>
                </TabsContent>

                 <TabsContent value="events">
                    <Card>
                        <CardHeader><CardTitle>Agenda de Eventos e Prazos</CardTitle></CardHeader>
                        <CardContent>
                           {events.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Evento</TableHead>
                                            <TableHead>Processo</TableHead>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Tipo</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {events.map((event) => (
                                            <TableRow key={event.id}>
                                                <TableCell className="font-medium">{event.title}</TableCell>
                                                <TableCell>{processes.find(p => p.id === event.processId)?.processNumber || 'N/A'}</TableCell>
                                                <TableCell>{format(event.date.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</TableCell>
                                                <TableCell>{event.type}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                           ) : (
                                <p className="text-muted-foreground text-center py-8">Nenhum evento na agenda para este cliente.</p>
                           )}
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}
