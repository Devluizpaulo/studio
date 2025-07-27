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
import { PlusCircle, Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { createEventAction } from './actions'

interface Event extends DocumentData {
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
      form.setValue('date', date)
    }
  }, [date, form])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      const q = query(
        collection(db, 'events'),
        where('lawyerId', '==', user.uid)
      )
      const unsubscribe = onSnapshot(
        q,
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
      )
      return () => unsubscribe()
    }
  }, [user, authLoading, router, toast])

  const selectedDayEvents = useMemo(() => {
    if (!date) return []
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return events.filter((event) => {
      const eventDate = event.date.toDate()
      return eventDate >= startOfDay && eventDate <= endOfDay
    })
  }, [date, events])

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
        <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-[350px]" />
            <Skeleton className="h-[350px]" />
        </div>
    )
  }

  const eventTypeMap = {
    audiencia: { label: 'Audiência', color: 'bg-red-500' },
    prazo: { label: 'Prazo', color: 'bg-yellow-500' },
    reuniao: { label: 'Reunião', color: 'bg-blue-500' },
    outro: { label: 'Outro', color: 'bg-gray-500' },
  }

  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Agenda</h2>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Evento
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Novo Evento</DialogTitle>
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
                                        <SelectItem key={key} value={key}>{value.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                            <Input placeholder="Detalhes do evento" {...field} />
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
        <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardContent className="p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
              locale={ptBR}
              modifiers={{
                hasEvent: events.map((event) => event.date.toDate()),
              }}
              modifiersStyles={{
                hasEvent: {
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  textDecorationColor: 'hsl(var(--accent))',
                  textUnderlineOffset: '0.2em'
                },
              }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="mr-3 h-6 w-6 text-accent" />
              {date ? format(date, "d 'de' MMMM", { locale: ptBR }) : 'Selecione uma data'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayEvents.length > 0 ? (
              <ul className="space-y-4">
                {selectedDayEvents.map((event) => (
                  <li key={event.id} className="flex items-start space-x-3">
                    <div className={`mt-1.5 h-3 w-3 rounded-full ${eventTypeMap[event.type]?.color || 'bg-gray-500'}`} />
                    <div>
                        <p className="font-semibold">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{eventTypeMap[event.type].label}</p>
                        {event.description && <p className="text-sm text-foreground/80">{event.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum compromisso para este dia.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
