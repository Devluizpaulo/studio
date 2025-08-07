"use client"

import { useState, useEffect, useMemo, useTransition } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { format, isPast, isWithinInterval, startOfDay, endOfDay, endOfWeek, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
  DocumentData,
  doc
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import *s z from 'zod'

import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { PlusCircle, Calendar as CalendarIcon, Loader2, Video, Landmark, Users, Handshake, Info, AlertTriangle, ListTodo, FileClock } from 'lucide-react'
import { createEventAction } from './actions'
import { Badge } from '@/components/ui/badge'

interface Event extends DocumentData {
  id: string
  title: string
  date: Timestamp
  type: 'audiencia-presencial' | 'audiencia-virtual' | 'prazo' | 'reuniao' | 'atendimento-presencial' | 'outro'
  description?: string
  status?: string
}

const eventFormSchema = z.object({
  title: z.string().min(3, 'O título é obrigatório.'),
  date: z.date({ required_error: 'A data é obrigatória.' }),
  type: z.enum(['audiencia-presencial', 'audiencia-virtual', 'prazo', 'reuniao', 'atendimento-presencial', 'outro']),
  description: z.string().optional(),
})

type EventFormValues = z.infer<typeof eventFormSchema>

const eventTypeMap = {
    'audiencia-presencial': { label: 'Audiência Presencial', icon: Landmark, color: 'text-red-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/50' },
    'audiencia-virtual': { label: 'Audiência Virtual', icon: Video, color: 'text-red-700', bgColor: 'bg-red-700/10', borderColor: 'border-red-700/50' },
    'prazo': { label: 'Prazo', icon: FileClock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/50' },
    'reuniao': { label: 'Reunião', icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/50' },
    'atendimento-presencial': { label: 'Atendimento', icon: Handshake, color: 'text-green-500', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/50' },
    'outro': { label: 'Outro', icon: Info, color: 'text-gray-500', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/50' },
}

export function AgendaClient() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      type: 'prazo',
      description: '',
    },
  })
   
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeUser = onSnapshot(userDocRef, (userDoc) => {
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const officeId = userData.officeId;

          if (!officeId) {
            setLoading(false);
            return;
          }

          const eventsQuery = query(collection(db, "events"), where("officeId", "==", officeId));
          
          const unsubscribeEvents = onSnapshot(
            eventsQuery,
            (snapshot) => {
              const eventsData: Event[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })) as Event[]
              setEvents(eventsData.sort((a,b) => a.date.toMillis() - b.date.toMillis()));
              setLoading(false)
            },
            (error) => {
              console.error('Error fetching events:', error)
              toast({ title: 'Erro ao buscar eventos', variant: 'destructive' })
              setLoading(false)
            }
          );
           return () => unsubscribeEvents();
        } else {
          setLoading(false);
        }
      });
      return () => unsubscribeUser();
    }
  }, [user, authLoading, router, toast])

  const { pastDueDeadlines, thisWeekDeadlines, thisWeekHearings, upcomingEvents } = useMemo(() => {
    const now = new Date();
    const startOfThisWeek = startOfWeek(now, { locale: ptBR });
    const endOfThisWeek = endOfWeek(now, { locale: ptBR });

    const pastDue = events.filter(e => e.type === 'prazo' && isPast(e.date.toDate()) && e.status !== 'concluido');
    const thisWeek = events.filter(e => isWithinInterval(e.date.toDate(), { start: startOfThisWeek, end: endOfThisWeek }));

    return {
        pastDueDeadlines: pastDue,
        thisWeekDeadlines: thisWeek.filter(e => e.type === 'prazo'),
        thisWeekHearings: thisWeek.filter(e => e.type.startsWith('audiencia')),
        upcomingEvents: events.filter(e => !isPast(e.date.toDate()) || e.type !== 'prazo')
    }
  }, [events]);


  async function onSubmit(values: EventFormValues) {
    if (!user) return
    setIsSubmitting(true)
    const result = await createEventAction({ ...values, lawyerId: user.uid })
    if (result.success) {
      toast({ title: 'Evento criado com sucesso!' })
      setIsFormOpen(false)
      form.reset()
    } else {
      toast({
        title: 'Erro ao criar evento',
        description: result.error,
        variant: 'destructive',
      })
    }
    setIsSubmitting(false)
  }

  if (authLoading || loading) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                 <Skeleton className="h-10 w-72" />
                 <Skeleton className="h-10 w-44" />
            </div>
             <div className="grid gap-6 md:grid-cols-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <Skeleton className="h-80 w-full" />
        </div>
    )
  }
  
  const summaryCards = [
    { title: "Prazos Vencidos", value: pastDueDeadlines.length, icon: AlertTriangle, color: "text-destructive" },
    { title: "Prazos da Semana", value: thisWeekDeadlines.length, icon: FileClock, color: "text-yellow-500" },
    { title: "Audiências da Semana", value: thisWeekHearings.length, icon: Landmark, color: "text-red-500" },
  ];

  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">
                    Agenda do Escritório
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Gerencie seus compromissos, prazos e audiências.
                </p>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }} className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Evento
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Novo Evento na Agenda</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: Audiência de conciliação" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <FormField
                        control={form.control}
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
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Data e Hora do Evento</FormLabel>
                                <FormControl>
                                      <Input 
                                          type="datetime-local"
                                          value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ''}
                                          onChange={e => field.onChange(e.target.valueAsDate)}
                                      />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Descrição (Opcional)</FormLabel>
                        <FormControl>
                            <Input placeholder="Detalhes do evento, link da sala virtual..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                         {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Evento
                    </Button>
                </form>
                </Form>
            </DialogContent>
            </Dialog>
        </div>
        
        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {summaryCards.map(card => (
             <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                </CardHeader>
                <CardContent>
                    <div className={`text-4xl font-bold ${card.color}`}>{card.value}</div>
                </CardContent>
            </Card>
          ))}
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <ListTodo className="mr-3 h-6 w-6 text-accent" />
                    Próximos Compromissos e Prazos
                </CardTitle>
                <CardDescription>
                    Seus próximos eventos agendados, ordenados por data.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {upcomingEvents.length > 0 ? (
                    <div className="space-y-6">
                        {upcomingEvents.map(event => {
                             const config = eventTypeMap[event.type as keyof typeof eventTypeMap] || eventTypeMap.outro;
                             const isEventPastDue = event.type === 'prazo' && isPast(event.date.toDate());
                             const Icon = isEventPastDue ? AlertTriangle : config.icon;
                             const colorClass = isEventPastDue ? 'text-destructive' : config.color;

                             return (
                                <div key={event.id} className="flex items-start gap-4">
                                     <div className={`mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${config.bgColor}`}>
                                        <Icon className={`h-6 w-6 ${colorClass}`} />
                                     </div>
                                     <div className="flex-grow">
                                        <p className={`font-semibold ${colorClass}`}>{event.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                             {format(event.date.toDate(), "eeee, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                        </p>
                                        {event.description && <p className="text-sm text-foreground/80 mt-1">{event.description}</p>}
                                     </div>
                                      <Badge variant={isEventPastDue ? "destructive" : "outline"} className={isEventPastDue ? "" : config.borderColor}>
                                         {isEventPastDue ? "Vencido" : config.label}
                                      </Badge>
                                </div>
                             )
                        })}
                    </div>
                ) : (
                     <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full py-16">
                        <CalendarIcon className="h-20 w-20 mb-4 opacity-30" />
                        <p className="text-lg">Nenhum compromisso futuro.</p>
                        <p className="text-sm mt-1">Sua agenda está limpa. Aproveite para planejar!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  )
}

    