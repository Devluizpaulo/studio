"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { collection, query, where, onSnapshot, DocumentData, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { PlusCircle, Loader2, UserPlus, Users, FileText } from 'lucide-react'
import { createClientAction } from './actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Client extends DocumentData {
  id: string
  fullName: string
  email: string
  phone: string
  document: string
  address: string
}

const clientFormSchema = z.object({
  fullName: z.string().min(3, "O nome completo é obrigatório."),
  email: z.string().email("Por favor, insira um e-mail válido."),
  phone: z.string().min(10, "O telefone deve ter no mínimo 10 dígitos."),
  nationality: z.string().min(3, "A nacionalidade é obrigatória."),
  maritalStatus: z.enum(["solteiro", "casado", "divorciado", "viuvo", "uniao_estavel"]),
  profession: z.string().min(3, "A profissão é obrigatória."),
  rg: z.string().min(5, "O RG é obrigatório."),
  issuingBody: z.string().min(2, "O órgão emissor é obrigatório."),
  document: z.string().min(11, "O CPF/CNPJ deve ter no mínimo 11 dígitos."),
  street: z.string().min(3, "O logradouro é obrigatório."),
  number: z.string().min(1, "O número é obrigatório."),
  neighborhood: z.string().min(3, "O bairro é obrigatório."),
  city: z.string().min(3, "A cidade é obrigatória."),
  state: z.string().min(2, "O estado é obrigatório."),
  zipCode: z.string().min(8, "O CEP é obrigatório."),
})

type ClientFormValues = z.infer<typeof clientFormSchema>

export function ClientesClient() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userRole, setUserRole] = useState<string|null>(null);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      nationality: 'Brasileiro(a)',
      maritalStatus: 'solteiro',
      profession: '',
      rg: '',
      issuingBody: 'SSP/SP',
      document: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: 'SP',
      zipCode: ''
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
                setUserRole(userData.role);
                const officeId = userData.officeId;

                if (!officeId) {
                  setLoading(false);
                  return;
                }

                const q = query(collection(db, 'clients'), where('officeId', '==', officeId));
                const unsubscribeClients = onSnapshot(q, (snapshot) => {
                    const clientsData: Client[] = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as Client[];
                    setClients(clientsData);
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching clients:", error);
                    setLoading(false);
                });
                return () => unsubscribeClients();
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribeUser();
    }
  }, [user, authLoading, router, toast])

  async function onSubmit(values: ClientFormValues) {
    if (!user) return
    setIsSubmitting(true)
    const result = await createClientAction({ ...values, lawyerId: user.uid })
    if (result.success) {
      toast({ title: 'Cliente cadastrado com sucesso!' })
      setIsFormOpen(false)
      form.reset()
    } else {
      toast({
        title: 'Erro ao cadastrar cliente',
        description: result.error,
        variant: 'destructive',
      })
    }
    setIsSubmitting(false)
  }

  if (authLoading || loading) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-10 w-36" />
            </div>
            <Skeleton className="h-80 w-full" />
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div/>
        {userRole !== 'secretary' && (
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Cliente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                   <h3 className="text-lg font-medium text-primary">Dados Pessoais</h3>
                    <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input placeholder="Nome completo do cliente" {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>E-mail</FormLabel><FormControl><Input placeholder="email@cliente.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                       <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(XX) XXXXX-XXXX" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="nationality" render={({ field }) => (<FormItem><FormLabel>Nacionalidade</FormLabel><FormControl><Input placeholder="Brasileiro(a)" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="maritalStatus" render={({ field }) => (<FormItem><FormLabel>Estado Civil</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="solteiro">Solteiro(a)</SelectItem><SelectItem value="casado">Casado(a)</SelectItem><SelectItem value="divorciado">Divorciado(a)</SelectItem><SelectItem value="viuvo">Viúvo(a)</SelectItem><SelectItem value="uniao_estavel">União Estável</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    </div>
                     <FormField control={form.control} name="profession" render={({ field }) => (<FormItem><FormLabel>Profissão</FormLabel><FormControl><Input placeholder="Profissão do cliente" {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="rg" render={({ field }) => (<FormItem><FormLabel>RG</FormLabel><FormControl><Input placeholder="00.000.000-0" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="issuingBody" render={({ field }) => (<FormItem><FormLabel>Órgão Emissor</FormLabel><FormControl><Input placeholder="SSP/SP" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="document" render={({ field }) => (<FormItem><FormLabel>CPF / CNPJ</FormLabel><FormControl><Input placeholder="000.000.000-00" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>

                    <h3 className="text-lg font-medium text-primary pt-4">Endereço</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="zipCode" render={({ field }) => (<FormItem><FormLabel>CEP</FormLabel><FormControl><Input placeholder="00000-000" {...field} /></FormControl><FormMessage /></FormItem>)} />
                         <FormField control={form.control} name="street" render={({ field }) => (<FormItem className="col-span-2"><FormLabel>Logradouro</FormLabel><FormControl><Input placeholder="Rua, Avenida, etc." {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="number" render={({ field }) => (<FormItem><FormLabel>Número</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="neighborhood" render={({ field }) => (<FormItem className="col-span-2"><FormLabel>Bairro</FormLabel><FormControl><Input placeholder="Centro" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>Cidade</FormLabel><FormControl><Input placeholder="São Paulo" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>Estado</FormLabel><FormControl><Input placeholder="SP" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Cliente
                        </Button>
                    </DialogFooter>
                </form>
                </Form>
            </DialogContent>
            </Dialog>
        )}
      </div>

       <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
             <Users className="mr-3 h-5 w-5 text-accent" />
            Lista de Clientes
          </CardTitle>
           <CardDescription>
            {clients.length > 0 ? `Seu escritório tem ${clients.length} cliente(s) cadastrado(s).` : 'Nenhum cliente cadastrado ainda.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
           {clients.length > 0 ? (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Nome Completo</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Documento</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {clients.map((client) => (
                        <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.fullName}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.phone}</TableCell>
                        <TableCell>{client.document}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
           ) : (
             <div className="flex flex-col items-center justify-center p-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground">Nenhum cliente cadastrado</h3>
                <p className="text-muted-foreground mt-2">Peça para um advogado cadastrar o primeiro cliente.</p>
            </div>
           )}
        </CardContent>
      </Card>

    </div>
  )
}
