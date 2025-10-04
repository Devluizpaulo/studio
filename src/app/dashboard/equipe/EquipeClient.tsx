"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { collection, query, where, onSnapshot, DocumentData, getDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useToast } from '@/hooks/use-toast'

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { UserPlus, Users, BadgeHelp, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { inviteMemberAction } from './actions'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Terminal } from 'lucide-react'

interface TeamMember extends DocumentData {
  id: string;
  fullName: string;
  email: string;
  oab: string;
  role: 'master' | 'lawyer' | 'secretary';
}

const roleMap = {
    master: 'Admin',
    lawyer: 'Advogado(a)',
    secretary: 'Secretária(o)'
}

const inviteFormSchema = z.object({
    fullName: z.string().min(3, "O nome completo é obrigatório."),
    email: z.string().email("Por favor, insira um e-mail válido."),
    role: z.enum(['lawyer', 'secretary'], { required_error: "O cargo é obrigatório."}),
})

type InviteFormValues = z.infer<typeof inviteFormSchema>

export function EquipeClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [currentUserData, setCurrentUserData] = useState<DocumentData | null>(null);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      role: 'lawyer',
    },
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setCurrentUserData(userData);
          const officeId = userData.officeId;

          if (userData.role !== 'master') {
            setLoading(false);
            return;
          }

          // Fetch all users from the same office
          const q = query(collection(db, 'users'), where('officeId', '==', officeId));
          const unsubscribeTeam = onSnapshot(q, (snapshot) => {
            const membersData: TeamMember[] = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as TeamMember[];
            setTeamMembers(membersData);
            setLoading(false);
          }, (error) => {
            console.error("Error fetching team members: ", error);
            setLoading(false);
          });

          return () => unsubscribeTeam();
        } else {
            setLoading(false);
        }
      });
      return () => unsubscribeUser();
    }
  }, [user, authLoading, router]);
  
  async function onInviteSubmit(values: InviteFormValues) {
    if (!user || !currentUserData || currentUserData.role !== 'master') {
      toast({ title: 'Erro de Permissão', description: 'Apenas o administrador pode convidar membros.', variant: 'destructive'})
      return
    }
    
    setIsSubmitting(true)
    const result = await inviteMemberAction({ ...values, officeId: currentUserData.officeId, invitingUserId: user.uid })
    
    if (result.success && result.data?.tempPassword) {
      toast({
        title: 'Membro Convidado!',
        description: (
          <div>
            <p className="mb-2">{`${values.fullName} foi adicionado(a).`}</p>
            <p className="font-semibold">Senha Temporária:</p>
            <p className="font-mono text-sm bg-muted p-2 rounded-md">{result.data.tempPassword}</p>
            <p className="mt-2 text-xs">Por favor, copie e envie esta senha para o novo membro por um canal seguro.</p>
          </div>
        ),
        duration: 20000, // Show for 20 seconds
      })
      setInviteDialogOpen(false)
      form.reset()
    } else if (!result.success) {
      toast({
        title: 'Erro ao Convidar',
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
  
  if (currentUserData?.role !== 'master') {
    return (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
            <BadgeHelp className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-xl font-semibold text-foreground">Acesso Negado</h3>
            <p className="text-muted-foreground mt-2">Você não tem permissão para gerenciar a equipe.</p>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Users className="mr-3 h-5 w-5 text-accent" />
              Membros do Escritório
            </CardTitle>
            <CardDescription>
              {teamMembers.length > 0 ? `Seu escritório tem ${teamMembers.length} membro(s).` : 'Nenhum membro na equipe ainda.'}
            </CardDescription>
          </div>
          <Dialog open={isInviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Convidar Membro
                </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convidar Novo Membro</DialogTitle>
                <DialogDescription>
                  Uma senha temporária será gerada para o primeiro acesso.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onInviteSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do novo membro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input placeholder="email@dominio.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cargo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o cargo do membro" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="lawyer">Advogado(a)</SelectItem>
                            <SelectItem value="secretary">Secretária(o)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Alert>
                      <Terminal className="h-4 w-4" />
                      <AlertTitle>Importante!</AlertTitle>
                      <AlertDescription>
                          Após o convite, envie a senha temporária para o novo membro e instrua-o a usar a função "Esqueci minha senha" na tela de login caso deseje definir uma senha pessoal antes do primeiro acesso.
                      </AlertDescription>
                  </Alert>

                  <DialogFooter>
                      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Adicionar Membro
                      </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
           {teamMembers.length > 0 ? (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Nome Completo</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>OAB</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {teamMembers.map((member) => (
                        <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.fullName}</TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>
                                <Badge variant={member.role === 'master' ? 'default' : 'secondary'}>
                                    {roleMap[member.role] || member.role}
                                </Badge>
                            </TableCell>
                            <TableCell>{member.oab || 'N/A'}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
           ) : (
             <div className="flex flex-col items-center justify-center p-12 text-center">
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground">Nenhum membro na equipe</h3>
                <p className="text-muted-foreground mt-2">Comece convidando o primeiro membro do seu escritório.</p>
            </div>
           )}
        </CardContent>
      </Card>

    </div>
  )
}
