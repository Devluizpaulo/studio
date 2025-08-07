"use client"

import { useEffect, useState, useTransition, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, getDocs, collection, query, where, DocumentData, Timestamp, onSnapshot, orderBy } from "firebase/firestore"
import { db, storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useAuth } from "@/contexts/AuthContext"
import { updateProcessStatusAction, addCollaboratorAction, findUserByEmailAction, addDocumentAction, addChatMessageAction, draftPetitionAction } from "./actions"
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
import { Briefcase, User, Users, Scale, Calendar, FileText, GanttChartSquare, Loader2, UserPlus, Shield, Search, PlusCircle, Paperclip, Download, MessageSquare, Send, Sparkles, Video, Landmark, Handshake, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarIcon } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"


interface Movement {
    date: Timestamp;
    description: string;
    details: string;
}

interface Collaborator {
    uid: string;
    fullName: string;
    email: string;
    role: string;
    photoUrl?: string;
}

interface ProcessEvent extends DocumentData {
  id: string
  title: string
  date: Timestamp
  type: 'audiencia-presencial' | 'audiencia-virtual' | 'prazo' | 'reuniao' | 'atendimento-presencial' | 'outro'
  description?: string
}

interface ProcessDocument extends DocumentData {
    id: string;
    title: string;
    url: string;
    fileName: string;
    createdAt: Timestamp;
}

interface ChatMessage extends DocumentData {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    senderPhotoUrl?: string;
    timestamp: Timestamp;
}

const eventFormSchema = z.object({
  title: z.string().min(3, 'O título é obrigatório.'),
  date: z.date({ required_error: 'A data é obrigatória.' }),
  type: z.enum(['audiencia-presencial', 'audiencia-virtual', 'prazo', 'reuniao', 'atendimento-presencial', 'outro']),
  description: z.string().optional(),
})

type EventFormValues = z.infer<typeof eventFormSchema>

const documentFormSchema = z.object({
    title: z.string().min(3, 'O título é obrigatório.'),
    file: z.instanceof(File).refine(file => file.size > 0, 'O arquivo é obrigatório.'),
})

type DocumentFormValues = z.infer<typeof documentFormSchema>;

const chatFormSchema = z.object({
    text: z.string().min(1, "A mensagem não pode estar em branco."),
})
type ChatFormValues = z.infer<typeof chatFormSchema>;

const petitionFormSchema = z.object({
    petitionType: z.string().min(3, "O tipo de petição é obrigatório."),
    legalThesis: z.string().min(20, "A tese jurídica deve ter pelo menos 20 caracteres."),
    toneAndStyle: z.string().min(10, "Descreva o tom e estilo desejado."),
})

type PetitionFormValues = z.infer<typeof petitionFormSchema>;


export function ProcessDetailClient() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const { toast } = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const [processData, setProcessData] = useState<DocumentData | null>(null)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [processEvents, setProcessEvents] = useState<ProcessEvent[]>([]);
  const [documents, setDocuments] = useState<ProcessDocument[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true)
  const [isUpdating, startUpdateTransition] = useTransition();
  const [isAddingCollaborator, startAddCollaboratorTransition] = useTransition();

  const [isAddCollaboratorDialogOpen, setAddCollaboratorDialogOpen] = useState(false);
  const [isAddEventDialogOpen, setAddEventDialogOpen] = useState(false);
  const [isAddDocumentDialogOpen, setAddDocumentDialogOpen] = useState(false);

  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [isSubmittingDocument, setIsSubmittingDocument] = useState(false);
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const [isDraftingPetition, setIsDraftingPetition] = useState(false);
  const [draftContent, setDraftContent] = useState("");

  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [foundUser, setFoundUser] = useState<Collaborator | null>(null);
  const [searchError, setSearchError] = useState("");
  const [userRole, setUserRole] = useState<string|null>(null);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string>('');


  const eventForm = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      type: 'prazo',
      description: '',
      date: new Date(),
    },
  })

  const documentForm = useForm<DocumentFormValues>({
      resolver: zodResolver(documentFormSchema),
  })

  const chatForm = useForm<ChatFormValues>({
      resolver: zodResolver(chatFormSchema),
      defaultValues: { text: "" }
  })
    
  const petitionForm = useForm<PetitionFormValues>({
    resolver: zodResolver(petitionFormSchema),
    defaultValues: {
        petitionType: "Petição Inicial",
        legalThesis: "",
        toneAndStyle: "Tom formal e combativo. Citar jurisprudência relevante do TJSP.",
    }
  })

  useEffect(() => {
    if(chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages])


  const fetchProcessAndCollaborators = async (processId: string, currentUserData: DocumentData) => {
    setLoading(true);
    try {
        const processDocRef = doc(db, "processes", processId);
        const unsubscribeProcess = onSnapshot(processDocRef, async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                
                // Permission Check
                const canView = (currentUserData.role === 'master' || currentUserData.role === 'secretary' || (data.collaboratorIds && data.collaboratorIds.includes(currentUserData.uid)));
                
                if (!canView || currentUserData.officeId !== data.officeId) {
                    toast({ title: "Erro", description: "Acesso negado.", variant: "destructive" });
                    router.push("/dashboard/processos");
                    return;
                }
                
                setProcessData({ id: docSnap.id, ...data });

                if (data.collaboratorIds && data.collaboratorIds.length > 0) {
                    const usersQuery = query(collection(db, 'users'), where('uid', 'in', data.collaboratorIds));
                    const usersSnap = await getDocs(usersQuery);
                    const collaboratorsData = usersSnap.docs.map(doc => doc.data() as Collaborator);
                    setCollaborators(collaboratorsData);
                }
                 setLoading(false);
            } else {
                toast({ title: "Erro", description: "Processo não encontrado.", variant: "destructive" });
                router.push("/dashboard/processos");
                setLoading(false);
            }
        });

        // Subscribe to process events
        const eventsQuery = query(collection(db, "events"), where("processId", "==", processId));
        const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
            const eventsData: ProcessEvent[] = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as ProcessEvent);
            setProcessEvents(eventsData.sort((a, b) => a.date.toMillis() - b.date.toMillis()));
        });
        
        // Subscribe to process documents
        const documentsQuery = query(collection(db, "processes", processId, "documents"));
        const unsubscribeDocuments = onSnapshot(documentsQuery, (snapshot) => {
            const docsData: ProcessDocument[] = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as ProcessDocument);
            setDocuments(docsData.sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
        })

         // Subscribe to chat messages
        const chatQuery = query(collection(db, "processes", processId, "chatMessages"), orderBy("timestamp", "asc"));
        const unsubscribeChat = onSnapshot(chatQuery, (snapshot) => {
            const messagesData: ChatMessage[] = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as ChatMessage);
            setChatMessages(messagesData);
        });

        return () => {
            unsubscribeProcess();
            unsubscribeEvents();
            unsubscribeDocuments();
            unsubscribeChat();
        };

    } catch (error) {
        console.error("Error fetching data:", error);
        toast({ title: "Erro", description: "Falha ao carregar os dados do processo.", variant: "destructive" });
        setLoading(false);
    }
  };


  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (typeof id !== 'string') {
        router.push("/dashboard/processos");
        return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserRole(userData.role);
            setUserPhotoUrl(userData.photoUrl || '');
            fetchProcessAndCollaborators(id, userData);
        } else {
             router.push("/login");
        }
    });

    return () => unsubscribeUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, authLoading, router]);

  const handleUpdateStatus = () => {
    if (!processData || typeof id !== 'string' || !user) return;

    startUpdateTransition(async () => {
        const result = await updateProcessStatusAction({
            processId: id,
            processNumber: processData.processNumber,
            court: processData.court,
            currentStatus: processData.status,
            lastUpdate: processData.movements.at(-1)?.description || 'Processo iniciado.',
            userId: user.uid
        });

        if (result.success) {
            toast({
                title: "Andamento Atualizado!",
                description: "Um novo andamento foi adicionado ao processo."
            })
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
        if (result.data.role === 'secretary') {
             setSearchError("Não é possível adicionar secretárias como colaboradoras diretas do processo.");
            return;
        }
        setFoundUser(result.data);
    } else if (!result.success) {
        setSearchError(result.error || "Nenhum advogado encontrado com este e-mail.");
    }
  }

  const handleAddCollaborator = async () => {
    if (!foundUser || typeof id !== 'string' || !user) return;

    startAddCollaboratorTransition(async () => {
        const result = await addCollaboratorAction({ processId: id, collaboratorId: foundUser.uid, currentUserId: user.uid });
        if (result.success) {
            toast({ title: "Colaborador Adicionado!", description: `${foundUser.fullName} agora faz parte da equipe deste processo.`});
            setAddCollaboratorDialogOpen(false);
            setCollaboratorEmail("");
            setFoundUser(null);
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

  async function handleDocumentSubmit(values: DocumentFormValues) {
    if (!user || typeof id !== 'string' || !values.file) return;
    setIsSubmittingDocument(true);

    try {
        const file = values.file;
        const storageRef = ref(storage, `processes/${id}/documents/${Date.now()}_${file.name}`);
        
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        const result = await addDocumentAction({
            processId: id,
            title: values.title,
            url: downloadURL,
            fileName: file.name,
            uploadedBy: user.uid,
        });

        if (result.success) {
            toast({ title: 'Documento Anexado!', description: 'O arquivo foi salvo no processo.' });
            setAddDocumentDialogOpen(false);
            documentForm.reset();
        } else {
            toast({ title: 'Erro ao salvar informações', description: result.error, variant: 'destructive' });
        }

    } catch (error) {
        console.error("Error uploading document:", error);
        toast({ title: 'Erro no Upload', description: 'Não foi possível enviar o arquivo.', variant: 'destructive' });
    } finally {
        setIsSubmittingDocument(false);
    }
  }

  async function handleMessageSubmit(values: ChatFormValues) {
    if (!user || typeof id !== 'string' || !user.displayName) return;
    setIsSubmittingMessage(true);

    try {
        const result = await addChatMessageAction({
            processId: id,
            text: values.text,
            senderId: user.uid,
            senderName: user.displayName,
            senderPhotoUrl: userPhotoUrl,
        });

        if (result.success) {
            chatForm.reset();
        } else {
             toast({ title: 'Erro ao enviar mensagem', description: result.error, variant: 'destructive' });
        }
    } catch (error) {
        toast({ title: 'Erro', description: 'Não foi possível enviar a mensagem.', variant: 'destructive' });
    } finally {
        setIsSubmittingMessage(false);
    }
  }
    
  async function handlePetitionSubmit(values: PetitionFormValues) {
    if (!processData || !user) return;
    setIsDraftingPetition(true);
    setDraftContent("");

    const caseFacts = `Processo No: ${processData.processNumber}. Ação de ${processData.actionType}. Vara: ${processData.court}. Autor: ${processData.plaintiff}. Réu: ${processData.defendant}. Cliente: ${processData.clientName}.`;
    
    const result = await draftPetitionAction({
        ...values,
        caseFacts,
        clientInfo: `${processData.clientName}, CPF/CNPJ: ${processData.clientDocument}`,
        opponentInfo: processData.representation === 'plaintiff' ? processData.defendant : processData.plaintiff,
        userId: user.uid
    });
    
    if (result.success && result.data) {
        setDraftContent(result.data.draftContent);
        toast({ title: "Rascunho gerado!", description: "A IA concluiu o rascunho da sua petição." });
    } else if (!result.success) {
        toast({ title: "Erro da IA", description: result.error, variant: "destructive" });
    }

    setIsDraftingPetition(false);
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
        'audiencia-presencial': { label: 'Audiência Presencial', icon: Landmark, color: 'bg-red-500' },
        'audiencia-virtual': { label: 'Audiência Virtual', icon: Video, color: 'bg-red-700' },
        'prazo': { label: 'Prazo', icon: CalendarIcon, color: 'bg-yellow-500' },
        'reuniao': { label: 'Reunião', icon: Users, color: 'bg-blue-500' },
        'atendimento-presencial': { label: 'Atendimento', icon: Handshake, color: 'bg-green-500' },
        'outro': { label: 'Outro', icon: Info, color: 'bg-gray-500' },
    }

  const movements: Movement[] = processData.movements || [];


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary font-headline flex items-center">
            <Briefcase className="mr-3 h-7 w-7 text-accent" />
            Processo: {processData.processNumber}
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
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
                 {(userRole === 'master' || user?.uid === processData.lawyerId) && (
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
                                    Procure por um advogado do seu escritório pelo e-mail para adicioná-lo como colaborador.
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
                                            <AvatarImage src={foundUser.photoUrl} />
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
                                <AvatarImage src={collab.photoUrl} />
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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
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
          <TabsTrigger value="chat">
            <MessageSquare className="mr-2 h-4 w-4"/>
            Chat
          </TabsTrigger>
          <TabsTrigger value="ai_assistant">
            <Sparkles className="mr-2 h-4 w-4"/>
            Assistente IA
          </TabsTrigger>
        </TabsList>
        <TabsContent value="updates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Últimos Andamentos</CardTitle>
                <CardDescription>Histórico de movimentações do processo.</CardDescription>
              </div>
              {userRole !== 'secretary' && (
                <Button variant="outline" onClick={handleUpdateStatus} disabled={isUpdating}>
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Atualizar Andamento
                </Button>
              )}
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
                         {userRole !== 'secretary' && <p className="text-sm mt-2">Clique em "Atualizar Andamento" para buscar a primeira movimentação.</p>}
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
              {userRole !== 'secretary' && (
                <Dialog open={isAddDocumentDialogOpen} onOpenChange={setAddDocumentDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Adicionar Documento
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                         <DialogHeader>
                            <DialogTitle>Anexar Novo Documento</DialogTitle>
                        </DialogHeader>
                        <Form {...documentForm}>
                             <form onSubmit={documentForm.handleSubmit(handleDocumentSubmit)} className="space-y-4">
                                <FormField
                                    control={documentForm.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Título do Documento</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Petição Inicial, Comprovante..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={documentForm.control}
                                    name="file"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Arquivo</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="file" 
                                                onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isSubmittingDocument} className="w-full">
                                    {isSubmittingDocument && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Anexar
                                </Button>
                             </form>
                        </Form>
                    </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
                {documents.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Título</TableHead>
                                <TableHead>Arquivo</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead className="text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents.map(doc => (
                                <TableRow key={doc.id}>
                                    <TableCell className="font-medium">{doc.title}</TableCell>
                                    <TableCell className="text-muted-foreground">{doc.fileName}</TableCell>
                                    <TableCell>{format(doc.createdAt.toDate(), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="ghost" size="icon">
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center text-muted-foreground py-12 flex flex-col items-center">
                        <Paperclip className="h-12 w-12 mb-4" />
                        <p>Nenhum documento foi anexado a este processo.</p>
                         {userRole !== 'secretary' && <p className="text-sm mt-2">Clique em "Adicionar Documento" para começar.</p>}
                    </div>
                )}
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
                                                 <Input type="datetime-local" value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ''} onChange={e => field.onChange(e.target.valueAsDate)} />
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
                                                    <SelectItem key={key} value={key}>
                                                        <div className="flex items-center gap-2">
                                                            <value.icon className="h-4 w-4" />
                                                            {value.label}
                                                        </div>
                                                    </SelectItem>
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
                    {processEvents.map((event) => {
                        const config = eventTypeMap[event.type as keyof typeof eventTypeMap] || eventTypeMap.outro;
                        return (
                            <li key={event.id} className="flex items-start space-x-3">
                                <div className={`mt-1.5 h-3 w-3 rounded-full flex-shrink-0 ${config.color}`} />
                                <div>
                                    <p className="font-semibold">{event.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(event.date.toDate(), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })} - {config.label}
                                    </p>
                                    {event.description && <p className="text-sm text-foreground/80 mt-1">{event.description}</p>}
                                </div>
                            </li>
                        )
                    })}
                </ul>
                ) : (
                <div className="text-center text-muted-foreground py-12">
                    <p>Nenhum prazo ou evento agendado para este processo.</p>
                </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="chat">
            <Card>
                <CardHeader>
                    <CardTitle>Chat da Equipe</CardTitle>
                    <CardDescription>Converse com os colaboradores deste processo.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col h-[500px]">
                    <div ref={chatContainerRef} className="flex-grow space-y-4 overflow-y-auto p-4 bg-muted/50 rounded-md mb-4">
                        {chatMessages.length > 0 ? (
                            chatMessages.map(msg => (
                                <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
                                    {msg.senderId !== user?.uid && (
                                         <Avatar className="h-8 w-8">
                                            <AvatarImage src={collaborators.find(c => c.uid === msg.senderId)?.photoUrl} />
                                            <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.senderId === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                                        <p className="text-sm font-semibold mb-1">{msg.senderName}</p>
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                        <p className="text-xs text-right mt-2 opacity-70">{format(msg.timestamp.toDate(), 'HH:mm')}</p>
                                    </div>
                                    {msg.senderId === user?.uid && (
                                         <Avatar className="h-8 w-8">
                                            <AvatarImage src={userPhotoUrl} />
                                            <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-12">
                                <p>Nenhuma mensagem ainda. Inicie a conversa!</p>
                            </div>
                        )}
                    </div>
                    {userRole !== 'secretary' && (
                        <Form {...chatForm}>
                            <form onSubmit={chatForm.handleSubmit(handleMessageSubmit)} className="flex items-center gap-2">
                                <FormField 
                                    control={chatForm.control}
                                    name="text"
                                    render={({ field}) => (
                                        <FormItem className="flex-grow">
                                            <FormControl>
                                                <Textarea 
                                                    placeholder="Digite sua mensagem..." 
                                                    {...field}
                                                    className="min-h-0"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            chatForm.handleSubmit(handleMessageSubmit)();
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isSubmittingMessage} size="icon">
                                    {isSubmittingMessage ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                                </Button>
                            </form>
                        </Form>
                     )}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="ai_assistant">
            <Card>
                <CardHeader>
                    <CardTitle>Assistente de IA para Petições</CardTitle>
                    <CardDescription>Gere rascunhos de petições com base na estratégia do caso.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 lg:grid-cols-2">
                   <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-primary">Diretrizes para a IA</h3>
                        <Form {...petitionForm}>
                            <form onSubmit={petitionForm.handleSubmit(handlePetitionSubmit)} className="space-y-4">
                               <FormField
                                    control={petitionForm.control}
                                    name="petitionType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo de Petição</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Contestação, Recurso de Apelação" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={petitionForm.control}
                                    name="legalThesis"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tese Jurídica Central</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Qual é o principal argumento que a petição deve defender? Ex: 'A prescrição do débito impede a cobrança...'" {...field} className="min-h-[100px]" />
                                            </FormControl>
                                             <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={petitionForm.control}
                                    name="toneAndStyle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tom e Estilo da Escrita</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Ex: 'Tom formal e combativo. Citar jurisprudência do TJSP sobre o tema...'" {...field} />
                                            </FormControl>
                                             <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isDraftingPetition} className="w-full" size="lg" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                                    {isDraftingPetition && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Gerar Rascunho
                                </Button>
                            </form>
                        </Form>
                   </div>
                   <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-primary">Rascunho Gerado</h3>
                        <div className="w-full h-[500px] bg-muted/50 rounded-md p-4 overflow-y-auto">
                           {isDraftingPetition && (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                                    <p className="mt-4 text-muted-foreground">Aguarde, a IA está redigindo a petição...</p>
                                </div>
                           )}
                           {draftContent ? (
                             <Textarea 
                                readOnly
                                value={draftContent}
                                className="w-full h-full text-base whitespace-pre-wrap bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                             />
                           ) : (
                             !isDraftingPetition && <p className="text-center text-muted-foreground pt-20">O rascunho da sua petição aparecerá aqui.</p>
                           )}
                        </div>
                   </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
