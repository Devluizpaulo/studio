"use client"

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
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
import * as z from 'zod'

import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { PlusCircle, Calendar as CalendarIcon, Loader2, Video, Landmark, Users, Handshake, Info } from 'lucide-react'
import { createEventAction } from './actions'
import { Badge } from '@/components/ui/badge'

interface Event extends DocumentData {
  id: string
  title: string
  date: Timestamp
  type: 'audiencia-presencial' | 'audiencia-virtual' | 'prazo' | 'reuniao' | 'atendimento-presencial' | 'outro'
  description?: string
}

const eventFormSchema = z.object({
  title: z.string().min(3, 'O título é obrigatório.'),
  date: z.date({ required_error: 'A data é obrigatória.' }),
  type: z.enum(['audiencia-presencial', 'audiencia-virtual', 'prazo', 'reuniao', 'atendimento-presencial', 'outro']),
  description: z.string().optional(),
})

type EventFormValues = z.infer<typeof eventFormSchema>

const eventTypeMap = {
    'audiencia-presencial': { label: 'Audiência Presencial', icon: Landmark, color: 'bg-red-500', borderColor: 'border-red-500', varColor: 'hsl(var(--destructive))' },
    'audiencia-virtual': { label: 'Audiência Virtual', icon: Video, color: 'bg-red-700', borderColor: 'border-red-700', varColor: 'hsl(0 72% 30%)' },
    'prazo': { label: 'Prazo', icon: CalendarIcon, color: 'bg-yellow-500', borderColor: 'border-yellow-500', varColor: 'hsl(var(--accent))' },
    'reuniao': { label: 'Reunião', icon: Users, color: 'bg-blue-500', borderColor: 'border-blue-500', varColor: 'hsl(217 91% 60%)' },
    'atendimento-presencial': { label: 'Atendimento Presencial', icon: Handshake, color: 'bg-green-500', borderColor: 'border-green-500', varColor: 'hsl(142 76% 36%)' },
    'outro': { label: 'Outro', icon: Info, color: 'bg-gray-500', borderColor: 'border-gray-500', varColor: 'hsl(var(--muted-foreground))' },
}

export function AgendaClient() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [date, setDate] = useState<Date | undefined>(new Date())
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
    if (date) {
        const newDate = new Date(date);
        newDate.setHours(9,0,0,0);
        form.setValue('date', newDate);
    }
  }, [date, form])

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
              setEvents(eventsData)
              setLoading(false)
            },
            (error) => {
              console.error('Error fetching events:', error)
              toast({
                title: 'Erro ao buscar eventos',
                variant: 'destructive',
              })
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

  const selectedDayEvents = useMemo(() => {
    if (!date) return []
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return events
    .filter((event) => {
      const eventDate = event.date.toDate()
      return eventDate >= startOfDay && eventDate <= endOfDay
    })
    .sort((a,b) => a.date.toDate().getTime() - b.date.toDate().getTime());

  }, [date, events])

  async function onSubmit(values: EventFormValues) {
    if (!user) return
    setIsSubmitting(true)
    const result = await createEventAction({ ...values, lawyerId: user.uid })
    if (result.success) {
      toast({ title: 'Evento criado com sucesso!' })
      setIsFormOpen(false)
      form.reset()
      setDate(values.date); // Select the new event's date
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
        <div className="grid md:grid-cols-[400px_1fr] gap-8">
            <Skeleton className="h-[550px]" />
            <Skeleton className="h-[550px]" />
        </div>
    )
  }

  const modifiers = useMemo(() => {
      const eventModifiers: Record<string, Date[]> = {};
      events.forEach(event => {
          const type = event.type as keyof typeof eventTypeMap;
          if (!eventModifiers[type]) {
              eventModifiers[type] = [];
          }
          eventModifiers[type].push(event.date.toDate());
      });
      return eventModifiers;
  }, [events]);

  return (
    <div className="space-y-4">
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
        <div className="grid gap-8 md:grid-cols-[400px_1fr]">
        <Card className="flex flex-col">
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="p-3"
              locale={ptBR}
              modifiers={modifiers}
              modifiersClassNames={{
                  ...Object.fromEntries(Object.keys(eventTypeMap).map(type => [type, `event-indicator--${type}`]))
              }}
            />
             <style jsx global>{`
                ${Object.entries(eventTypeMap).map(([key, value]) => `
                    .event-indicator--${key}:not([aria-selected]) .rdp-button::after {
                        content: '';
                        position: absolute;
                        bottom: 4px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background-color: ${value.varColor};
                    }
                `).join('\n')}
            `}</style>
             <div className="border-t p-4 mt-auto">
                <h4 className="text-sm font-semibold mb-3">Legenda:</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {Object.entries(eventTypeMap).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${value.color}`}></span>
                            <span>{value.label}</span>
                        </div>
                    ))}
                </div>
              </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="mr-3 h-6 w-6 text-accent" />
              {date ? format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione uma data'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayEvents.length > 0 ? (
              <ul className="space-y-4">
                {selectedDayEvents.map((event) => {
                  const eventConfig = eventTypeMap[event.type as keyof typeof eventTypeMap] || eventTypeMap.outro;
                  const Icon = eventConfig.icon;
                  return (
                     <li key={event.id} className={`flex items-start space-x-4 border-l-4 p-4 rounded-r-md bg-card/50 ${eventConfig.borderColor}`}>
                      <Icon className={`mt-1 h-6 w-6 flex-shrink-0 ${eventConfig.color.replace('bg-', 'text-')}`} />
                      <div className="flex-grow">
                          <p className="font-semibold text-base leading-tight">{event.title}</p>
                           <p className="text-sm text-muted-foreground mt-1">
                              <Badge variant="outline" className="mr-2 border-primary/50 text-primary/90 font-mono">
                                {format(event.date.toDate(), 'HH:mm')}
                              </Badge>
                              {eventConfig.label}
                            </p>
                          {event.description && <p className="text-sm text-foreground/80 mt-2">{event.description}</p>}
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full py-16">
                 <CalendarIcon className="h-20 w-20 mb-4 opacity-30" />
                <p className="text-lg">Nenhum compromisso para este dia.</p>
                <p className="text-sm mt-1">Selecione outra data ou adicione um novo evento.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
