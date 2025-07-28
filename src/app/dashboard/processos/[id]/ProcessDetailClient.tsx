"use client"

import { useEffect, useState, useTransition } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, DocumentData, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import { updateProcessStatusAction } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';


import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Briefcase, User, Users, Scale, Calendar, FileText, GanttChartSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Movement {
    date: Timestamp;
    description: string;
    details: string;
}
export function ProcessDetailClient() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const { toast } = useToast();
  
  const [processData, setProcessData] = useState<DocumentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdating, startTransition] = useTransition();

  const fetchProcess = async (processId: string) => {
    if (!user) return;
    setLoading(true)
    const docRef = doc(db, "processes", processId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists() && docSnap.data().lawyerId === user.uid) {
      setProcessData({ id: docSnap.id, ...docSnap.data() })
    } else {
      toast({ title: "Erro", description: "Processo não encontrado ou acesso negado.", variant: "destructive" });
      router.push("/dashboard/processos")
    }
    setLoading(false)
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/login")
      return
    }

    if (typeof id !== 'string') {
        router.push("/dashboard/processos");
        return;
    }

    fetchProcess(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, authLoading, router])

  const handleUpdateStatus = () => {
    if (!processData || typeof id !== 'string') return;

    startTransition(async () => {
        const result = await updateProcessStatusAction({
            processId: id,
            processNumber: processData.processNumber,
            court: processData.court,
            currentStatus: processData.status,
            lastUpdate: processData.movements.at(-1)?.description || 'Processo iniciado.'
        });

        if (result.success) {
            toast({
                title: "Andamento Atualizado!",
                description: "Um novo andamento foi adicionado ao processo."
            })
            // Refetch data to show the new movement
            await fetchProcess(id);
        } else {
            toast({
                title: "Erro ao Atualizar",
                description: result.error,
                variant: "destructive"
            })
        }
    })
  }


  if (loading || authLoading || !processData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }
    
  const statusTextMap: { [key: string]: string } = {
    active: "Em Andamento",
    pending: "Aguardando",
    archived: "Arquivado",
  }

  const representationTextMap: { [key: string]: string } = {
    plaintiff: "Pelo Autor",
    defendant: "Pelo Réu",
  }

  const movements: Movement[] = processData.movements || [];


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center">
            <Briefcase className="mr-3 h-6 w-6 text-accent" />
            Processo: {processData.processNumber}
        </h2>
        <p className="text-muted-foreground mt-1">
          {processData.actionType}
        </p>
      </div>
      
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cliente Principal</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl font-bold">{processData.clientName}</div>
                    <p className="text-xs text-muted-foreground">{processData.clientDocument}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Status</CardTitle>
                    <GanttChartSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Badge variant={processData.status === 'active' ? 'default' : (processData.status === 'pending' ? 'secondary' : 'outline')}>{statusTextMap[processData.status]}</Badge>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sua Representação</CardTitle>
                    <Scale className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl font-bold">{representationTextMap[processData.representation]}</div>
                </CardContent>
            </Card>
        </div>


        <Card>
            <CardHeader>
                 <CardTitle className="text-lg flex items-center">
                     <Users className="mr-3 h-5 w-5 text-accent" />
                    Partes e Informações Gerais
                 </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><span className="font-semibold">Autor(es):</span> {processData.plaintiff}</div>
                    <div><span className="font-semibold">Réu(s):</span> {processData.defendant}</div>
                    <div><span className="font-semibold">Vara e Comarca:</span> {processData.court}</div>
                </div>
            </CardContent>
        </Card>


      <Tabs defaultValue="updates" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="updates">
            <Calendar className="mr-2 h-4 w-4"/>
            Andamentos
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="mr-2 h-4 w-4"/>
            Documentos
          </TabsTrigger>
          <TabsTrigger value="deadlines">
            <Calendar className="mr-2 h-4 w-4"/>
            Prazos e Agenda
          </TabsTrigger>
        </TabsList>
        <TabsContent value="updates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Últimos Andamentos</CardTitle>
                <CardDescription>Histórico de movimentações do processo.</CardDescription>
              </div>
               <Button variant="outline" onClick={handleUpdateStatus} disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Atualizar Andamento
              </Button>
            </CardHeader>
            <CardContent>
                {movements.length > 0 ? (
                    <div className="space-y-6">
                        {movements.sort((a, b) => b.date.toMillis() - a.date.toMillis()).map((mov, index) => (
                            <div key={index} className="flex space-x-4">
                               <div className="flex flex-col items-center">
                                    <div className="w-4 h-4 rounded-full bg-accent mt-1"></div>
                                    <div className="flex-grow w-px bg-border"></div>
                                </div>
                                <div>
                                    <p className="font-semibold">{mov.description}</p>
                                    <p className="text-sm text-muted-foreground">{format(mov.date.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                                    <p className="text-sm mt-1">{mov.details}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-12">
                        <p>Nenhum andamento registrado para este processo.</p>
                        <p className="text-sm mt-2">Clique em "Atualizar Andamento" para buscar a primeira movimentação.</p>
                    </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents">
          <Card>
             <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Documentos do Processo</CardTitle>
                <CardDescription>Faça upload e gerencie os arquivos do caso.</CardDescription>
              </div>
              <Button variant="outline">
                Adicionar Documento
              </Button>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground py-12">
                <p>Funcionalidade de gestão de documentos em desenvolvimento.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="deadlines">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Prazos e Eventos</CardTitle>
                    <CardDescription>Agenda de compromissos e prazos vinculados a este processo.</CardDescription>
                </div>
                 <Button variant="outline">
                    Adicionar Evento
                </Button>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground py-12">
              <p>Funcionalidade de agenda do processo em desenvolvimento.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

    