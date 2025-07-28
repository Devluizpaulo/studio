"use client"

import { useState, useEffect, useTransition } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { collection, query, where, onSnapshot, DocumentData, doc, getDocs, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { PlusCircle, Loader2, DollarSign, Check, X, FileText } from 'lucide-react'
import { createFinancialTaskAction, updateFinancialTaskStatusAction } from './actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface FinancialTask extends DocumentData {
  id: string;
  title: string;
  processId?: string;
  processNumber?: string;
  type: 'honorarios' | 'custas' | 'reembolso' | 'guia' | 'outro';
  status: 'pendente' | 'pago';
  dueDate: any;
  value: number;
}

interface ProcessOption {
    id: string;
    processNumber: string;
    clientName: string;
}

const taskFormSchema = z.object({
    title: z.string().min(3, "O título é obrigatório."),
    processId: z.string().optional(),
    type: z.enum(['honorarios', 'custas', 'reembolso', 'guia', 'outro'], { required_error: "O tipo é obrigatório."}),
    dueDate: z.date({ required_error: "A data de vencimento é obrigatória." }),
    value: z.coerce.number().positive("O valor deve ser positivo."),
    status: z.enum(['pendente', 'pago']),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

export function FinanceiroClient() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [tasks, setTasks] = useState<FinancialTask[]>([])
  const [processes, setProcesses] = useState<ProcessOption[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdating, startUpdateTransition] = useTransition()
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      type: 'honorarios',
      status: 'pendente',
    },
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                if (userData.role !== 'master' && userData.role !== 'secretary') {
                    router.push('/dashboard');
                    return;
                }
                const officeId = userData.officeId;

                const tasksQuery = query(collection(db, 'financial_tasks'), where('officeId', '==', officeId));
                const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
                    const tasksData: FinancialTask[] = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as FinancialTask[];
                    setTasks(tasksData.sort((a,b) => a.dueDate.toMillis() - b.dueDate.toMillis()));
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching tasks:", error);
                    setLoading(false);
                });

                const processesQuery = query(collection(db, 'processes'), where('officeId', '==', officeId));
                const unsubscribeProcesses = onSnapshot(processesQuery, (snapshot) => {
                    const processOptions: ProcessOption[] = snapshot.docs.map(doc => ({
                        id: doc.id,
                        processNumber: doc.data().processNumber,
                        clientName: doc.data().clientName,
                    }));
                    setProcesses(processOptions);
                });

                return () => {
                  unsubscribeTasks();
                  unsubscribeProcesses();
                }
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribeUser();
    }
  }, [user, authLoading, router, toast])

  async function onSubmit(values: TaskFormValues) {
    if (!user) return
    setIsSubmitting(true)

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    const officeId = userDoc.data()?.officeId;

    if (!officeId) {
        toast({ title: 'Erro', description: 'Escritório não encontrado.', variant: 'destructive'});
        setIsSubmitting(false);
        return;
    }

    const processNumber = values.processId ? processes.find(p => p.id === values.processId)?.processNumber : undefined;

    const result = await createFinancialTaskAction({ ...values, officeId, createdBy: user.uid, processNumber })
    if (result.success) {
      toast({ title: 'Lançamento adicionado!' })
      setIsFormOpen(false)
      form.reset()
    } else {
      toast({
        title: 'Erro ao adicionar lançamento',
        description: result.error,
        variant: 'destructive',
      })
    }
    setIsSubmitting(false)
  }

  const handleUpdateStatus = (taskId: string, newStatus: 'pago' | 'pendente') => {
    setUpdatingId(taskId);
    startUpdateTransition(async () => {
      const result = await updateFinancialTaskStatusAction({ taskId, status: newStatus });
      if (!result.success) {
        toast({ title: "Erro", description: result.error, variant: 'destructive' });
      }
      setUpdatingId(null);
    });
  }

  if (authLoading || loading) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-10 w-40" />
            </div>
            <Skeleton className="h-80 w-full" />
        </div>
    )
  }

  const typeMap = {
    honorarios: 'Honorários',
    custas: 'Custas Processuais',
    reembolso: 'Reembolso',
    guia: 'Emissão de Guia',
    outro: 'Outro',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Controle Financeiro</h2>
            <p className="text-muted-foreground">Gerencie as finanças e tarefas administrativas do escritório.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Lançamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Novo Lançamento Financeiro</DialogTitle>
              <DialogDescription>
                Adicione uma nova tarefa ou registro financeiro.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Pagamento de custas iniciais" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="processId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vincular a um Processo (Opcional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um processo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           <SelectItem value="nao-vincular">Não Vincular</SelectItem>
                           {processes.map(p => (
                             <SelectItem key={p.id} value={p.id}>
                               {p.processNumber} ({p.clientName})
                            </SelectItem>
                           ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    {Object.entries(typeMap).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>{value}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Valor (R$)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="150.00" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Data de Vencimento</FormLabel>
                            <FormControl>
                                 <Input type="date" {...field} 
                                    onChange={e => field.onChange(e.target.valueAsDate)}
                                    value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                 />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Lançamento
                    </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

       <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
             <DollarSign className="mr-3 h-5 w-5 text-accent" />
            Lançamentos Financeiros
          </CardTitle>
           <CardDescription>
            {tasks.length > 0 ? `Existem ${tasks.length} lançamentos registrados.` : 'Nenhum lançamento cadastrado ainda.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
           {tasks.length > 0 ? (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Processo</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {tasks.map((task) => (
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
                        <TableCell className="text-right">
                           {isUpdating && updatingId === task.id ? (
                             <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                           ) : (
                            task.status === 'pendente' ? (
                                <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(task.id, 'pago')}>
                                    <Check className="mr-2 h-4 w-4"/> Marcar como Pago
                                </Button>
                            ) : (
                                <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(task.id, 'pendente')}>
                                    <X className="mr-2 h-4 w-4"/> Marcar como Pendente
                                </Button>
                            )
                           )}
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
           ) : (
             <div className="flex flex-col items-center justify-center p-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground">Nenhum lançamento</h3>
                <p className="text-muted-foreground mt-2">Adicione a primeira tarefa no botão "Adicionar Lançamento".</p>
            </div>
           )}
        </CardContent>
      </Card>

    </div>
  )
}
