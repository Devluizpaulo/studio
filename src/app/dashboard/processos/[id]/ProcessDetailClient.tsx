"use client"

import { useEffect, useState, useTransition } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, getDocs, collection, query, where, DocumentData, Timestamp, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import { updateProcessStatusAction, addCollaboratorAction, findUserByEmailAction } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createEventAction } from "../../agenda/actions"


import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Briefcase, User, Users, Scale, Calendar, FileText, GanttChartSquare, Loader2, UserPlus, Shield, Search, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarIcon } from 'lucide-react'


interface Movement {
    date: Timestamp;
    description: string;
    details: string;
}

interface Collaborator {
    uid: string;
    fullName: string;
    email: string;
}

interface ProcessEvent extends DocumentData {
  id: string
  title: string
  date: Timestamp
  type: 'audiencia' | 'prazo' | 'reuniao' | 'outro'
  description?: string
}

const eventFormSchema = z.object({
  title: z.string().min(3, 'O título é obrigatório.'),
  date: z.date({ required_error: 'A data é obrigatória.' }),
  type: z.enum(['audiencia', 'prazo', 'reuniao', 'outro']),
  description: z.string().optional(),
})

type EventFormValues = z.infer<typeof eventFormSchema>


export function ProcessDetailClient() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const { toast } = useToast();
  
  const [processData, setProcessData] = useState<DocumentData | null>(null)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [processEvents, setProcessEvents] = useState<ProcessEvent[]>([]);
  const [loading, setLoading] = useState(true)
  const [isUpdating, startUpdateTransition] = useTransition();
  const [isAddingCollaborator, startAddCollaboratorTransition] = useTransition();

  const [isAddCollaboratorDialogOpen, setAddCollaboratorDialogOpen] = useState(false);
  const [isAddEventDialogOpen, setAddEventDialogOpen] = useState(false);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [foundUser, setFoundUser] = useState<Collaborator | null>(null);
  const [searchError, setSearchError] = useState("");

  const eventForm = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      type: 'prazo',
      description: '',
      date: new Date(),
    },
  })


  const fetchProcessAndCollaborators = async (processId: string) => {
    if (!user) return;
    setLoading(true);

    try {
        const docRef = doc(db, "processes", processId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            const userData = userDocSnap.data();

            if ( (userData?.role === 'master' && userData?.officeId === data.officeId) || (data.collaboratorIds && data.collaboratorIds.includes(user.uid))) {
                setProcessData({ id: docSnap.id, ...data });

                if (data.collaboratorIds && data.collaboratorIds.length > 0) {
                    const usersQuery = query(collection(db, 'users'), where('uid', 'in', data.collaboratorIds));
                    const usersSnap = await getDocs(usersQuery);
                    const collaboratorsData = usersSnap.docs.map(doc => doc.data() as Collaborator);
                    setCollaborators(collaboratorsData);
                }

            } else {
                toast({ title: "Erro", description: "Acesso negado.", variant: "destructive" });
                router.push("/dashboard/processos");
            }
        } else {
            toast({ title: "Erro", description: "Processo não encontrado.", variant: "destructive" });
            router.push("/dashboard/processos");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        toast({ title: "Erro", description: "Falha ao carregar os dados do processo.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };


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

    fetchProcessAndCollaborators(id)

    // Subscribe to process events
    const eventsQuery = query(collection(db, "events"), where("processId", "==", id));
    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
        const eventsData: ProcessEvent[] = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as ProcessEvent);
        setProcessEvents(eventsData.sort((a, b) => a.date.toMillis() - b.date.toMillis()));
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, authLoading, router])

  const handleUpdateStatus = () => {
    if (!processData || typeof id !== 'string') return;

    startUpdateTransition(async () => {
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
            // No need to refetch, onSnapshot will update movements
        } else {
            toast({
                title: "Erro ao Atualizar",
                description: result.error,
                variant: "destructive"
            })
        }
    })
  }

  const handleSearchUser = async () => {
    setSearchError("");
    setFoundUser(null);
    if (!collaboratorEmail) {
        setSearchError("Por favor, insira um e-mail.");
        return;
    }
    const result = await findUserByEmailAction(collaboratorEmail);
    if (result.success && result.data) {
        if (collaborators.some(c => c.uid === result.data?.uid)) {
            setSearchError("Este advogado já é um colaborador.");
            return;
        }
        setFoundUser(result.data);
    } else {
        setSearchError(result.error || "Nenhum advogado encontrado com este e-mail.");
    }
  }

  const handleAddCollaborator = async () => {
    if (!foundUser || typeof id !== 'string') return;

    startAddCollaboratorTransition(async () => {
        const result = await addCollaboratorAction({ processId: id, collaboratorId: foundUser.uid });
        if (result.success) {
            toast({ title: "Colaborador Adicionado!", description: `${foundUser.fullName} agora faz parte da equipe deste processo.`});
            setAddCollaboratorDialogOpen(false);
            setCollaboratorEmail("");
            setFoundUser(null);
            await fetchProcessAndCollaborators(id);
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" });
        }
    });
  }

  const handleEventSubmit = async (values: EventFormValues) => {
    if (!user || typeof id !== 'string') return;
    setIsSubmittingEvent(true);
    const result = await createEventAction({ ...values, lawyerId: user.uid, processId: id });
    if (result.success) {
        toast({ title: "Evento criado com sucesso!" });
        setAddEventDialogOpen(false);
        eventForm.reset();
    } else {
        toast({
            title: 'Erro ao criar evento',
            description: result.error,
            variant: 'destructive',
        });
    }
    setIsSubmittingEvent(false);
  }


  if (loading || authLoading || !processData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
        </div>
         <div className="grid md:grid-cols-2 gap-6">
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

  const eventTypeMap = {
    audiencia: { label: 'Audiência', color: 'bg-red-500' },
    prazo: { label: 'Prazo', color: 'bg-yellow-500' },
    reuniao: { label: 'Reunião', color: 'bg-blue-500' },
    outro: { label: 'Outro', color: 'bg-gray-500' },
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

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                 <CardTitle className="text-lg flex items-center">
                     <Shield className="mr-3 h-5 w-5 text-accent" />
                    Equipe Jurídica
                 </CardTitle>
                 {user?.uid === processData.lawyerId && (
                     <Dialog open={isAddCollaboratorDialogOpen} onOpenChange={setAddCollaboratorDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <UserPlus className="mr-2 h-4 w-4"/>
                                Adicionar
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Adicionar Advogado ao Processo</DialogTitle>
                                <DialogDescription>
                                    Procure por um advogado cadastrado na plataforma pelo e-mail para adicioná-lo como colaborador.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex gap-2">
                                <Input 
                                    value={collaboratorEmail}
                                    onChange={(e) => setCollaboratorEmail(e.target.value)}
                                    placeholder="email.do.advogado@exemplo.com"
                                />
                                <Button variant="secondary" onClick={handleSearchUser}><Search className="h-4 w-4"/></Button>
                            </div>
                            {searchError && <p className="text-sm text-destructive">{searchError}</p>}
                            {foundUser && (
                                <Card className="mt-4 p-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback>{foundUser.fullName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{foundUser.fullName}</p>
                                            <p className="text-sm text-muted-foreground">{foundUser.email}</p>
                                        </div>
                                    </div>
                                </Card>
                            )}
                            <DialogFooter>
                                <Button 
                                    onClick={handleAddCollaborator} 
                                    disabled={!foundUser || isAddingCollaborator}
                                >
                                     {isAddingCollaborator && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Adicionar à Equipe
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                     </Dialog>
                 )}
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                {collaborators.length > 0 ? (
                    collaborators.map(collab => (
                        <div key={collab.uid} className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback>{collab.fullName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{collab.fullName} {collab.uid === processData.lawyerId && <span className="text-xs text-accent font-normal">(Dono)</span>}</p>
                                <p className="text-xs text-muted-foreground">{collab.email}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground">Nenhum colaborador neste processo.</p>
                )}
            </CardContent>
        </Card>
    </div>


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
            <CalendarIcon className="mr-2 h-4 w-4"/>
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
                                    {index < movements.length - 1 && <div className="flex-grow w-px bg-border"></div>}
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
                 <Dialog open={isAddEventDialogOpen} onOpenChange={setAddEventDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Adicionar Evento
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Novo Evento para o Processo</DialogTitle>
                        </DialogHeader>
                        <Form {...eventForm}>
                            <form onSubmit={eventForm.handleSubmit(handleEventSubmit)} className="space-y-4">
                                <FormField
                                    control={eventForm.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Título</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Prazo para contestação" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={eventForm.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Data do Evento</FormLabel>
                                            <FormControl>
                                                 <Input type="date" {...field} onChange={e => field.onChange(e.target.valueAsDate)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={eventForm.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Tipo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o tipo" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.entries(eventTypeMap).map(([key, value]) => (
                                                    <SelectItem key={key} value={key}>{value.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={eventForm.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Descrição (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Detalhes do evento" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isSubmittingEvent} className="w-full">
                                    {isSubmittingEvent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Salvar Evento
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                 </Dialog>
            </CardHeader>
            <CardContent>
              {processEvents.length > 0 ? (
                <ul className="space-y-4 pt-4">
                    {processEvents.map((event) => (
                    <li key={event.id} className="flex items-start space-x-3">
                        <div className={`mt-1.5 h-3 w-3 rounded-full ${eventTypeMap[event.type]?.color || 'bg-gray-500'}`} />
                        <div>
                            <p className="font-semibold">{event.title}</p>
                             <p className="text-sm text-muted-foreground">
                                {format(event.date.toDate(), "dd 'de' MMMM, yyyy", { locale: ptBR })} - {eventTypeMap[event.type].label}
                            </p>
                            {event.description && <p className="text-sm text-foreground/80 mt-1">{event.description}</p>}
                        </div>
                    </li>
                    ))}
                </ul>
                ) : (
                <div className="text-center text-muted-foreground py-12">
                    <p>Nenhum prazo ou evento agendado para este processo.</p>
                </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
