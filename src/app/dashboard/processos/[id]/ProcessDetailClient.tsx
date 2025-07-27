"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, DocumentData } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Briefcase, User, Users, Scale, Calendar, FileText, GanttChartSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ProcessDetailClient() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { id } = params
  
  const [process, setProcess] = useState<DocumentData | null>(null)
  const [loading, setLoading] = useState(true)

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

    const fetchProcess = async () => {
      setLoading(true)
      const docRef = doc(db, "processes", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists() && docSnap.data().lawyerId === user.uid) {
        setProcess({ id: docSnap.id, ...docSnap.data() })
      } else {
        // TODO: Handle case where process doesn't exist or user doesn't have access
        console.error("Process not found or access denied")
        router.push("/dashboard/processos")
      }
      setLoading(false)
    }

    fetchProcess()
  }, [id, user, authLoading, router])

  if (loading || authLoading) {
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

  if (!process) {
    return <p>Processo não encontrado.</p>
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


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center">
            <Briefcase className="mr-3 h-6 w-6 text-accent" />
            Processo: {process.processNumber}
        </h2>
        <p className="text-muted-foreground mt-1">
          {process.actionType}
        </p>
      </div>
      
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cliente Principal</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl font-bold">{process.clientName}</div>
                    <p className="text-xs text-muted-foreground">{process.clientDocument}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Status</CardTitle>
                    <GanttChartSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Badge variant={process.status === 'active' ? 'default' : (process.status === 'pending' ? 'secondary' : 'outline')}>{statusTextMap[process.status]}</Badge>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sua Representação</CardTitle>
                    <Scale className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl font-bold">{representationTextMap[process.representation]}</div>
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
                    <div><span className="font-semibold">Autor(es):</span> {process.plaintiff}</div>
                    <div><span className="font-semibold">Réu(s):</span> {process.defendant}</div>
                    <div><span className="font-semibold">Vara e Comarca:</span> {process.court}</div>
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
               <Button variant="outline">
                Atualizar Andamento
              </Button>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground py-12">
              <p>Funcionalidade de acompanhamento de andamentos em desenvolvimento.</p>
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
