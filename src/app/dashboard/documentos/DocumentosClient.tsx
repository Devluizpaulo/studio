"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { collection, query, where, onSnapshot, DocumentData, getDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
  FormDescription as FormDescriptionComponent,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { PlusCircle, Loader2, FileText, BadgeHelp, ClipboardList } from 'lucide-react'
import { createDocumentTemplateAction } from './actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'


interface DocumentTemplate extends DocumentData {
  id: string
  title: string
  content: string
}

const templateFormSchema = z.object({
    title: z.string().min(3, "O título é obrigatório."),
    content: z.string().min(20, "O conteúdo do modelo deve ter pelo menos 20 caracteres."),
})

type TemplateFormValues = z.infer<typeof templateFormSchema>

export function DocumentosClient() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      title: '',
      content: '',
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
                setCurrentUserRole(userData.role);
                const officeId = userData.officeId;

                if (userData.role !== 'master') {
                    setLoading(false);
                    return;
                }
                
                // Fetch all templates from the same office
                const q = query(collection(db, 'document_templates'), where('officeId', '==', officeId));
                const unsubscribeTemplates = onSnapshot(q, (snapshot) => {
                    const templatesData: DocumentTemplate[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                    })) as DocumentTemplate[];
                    setTemplates(templatesData);
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching templates: ", error);
                    toast({ title: "Erro ao buscar modelos", variant: "destructive" });
                    setLoading(false);
                });
                return () => unsubscribeTemplates();
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribeUser();
    }
  }, [user, authLoading, router, toast])

  async function onSubmit(values: TemplateFormValues) {
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

    const result = await createDocumentTemplateAction({ ...values, officeId, createdBy: user.uid })
    if (result.success) {
      toast({ title: 'Modelo de documento salvo!' })
      setIsFormOpen(false)
      form.reset()
    } else {
      toast({
        title: 'Erro ao salvar modelo',
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
                <Skeleton className="h-10 w-40" />
            </div>
            <Skeleton className="h-80 w-full" />
        </div>
    )
  }

  if (currentUserRole !== 'master') {
    return (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
            <BadgeHelp className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-xl font-semibold text-foreground">Acesso Negado</h3>
            <p className="text-muted-foreground mt-2">Apenas o Administrador do escritório pode gerenciar modelos de documentos.</p>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Modelos de Documentos</h2>
            <p className="text-muted-foreground">Crie e gerencie modelos de documentos para sua equipe.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Modelo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Modelo de Documento</DialogTitle>
              <DialogDescription>
                Este modelo ficará disponível para todos os membros do seu escritório.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do Modelo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Procuração Ad Judicia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo do Modelo</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Cole ou digite o texto do seu modelo aqui..." {...field} className="min-h-[300px]" />
                      </FormControl>
                       <FormDescriptionComponent>
                        Você pode usar Markdown para formatação. Ex: `**negrito**`, `*itálico*`, `- Item de lista`.
                      </FormDescriptionComponent>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Modelo
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
             <ClipboardList className="mr-3 h-5 w-5 text-accent" />
            Lista de Modelos
          </CardTitle>
           <CardDescription>
            {templates.length > 0 ? `Você tem ${templates.length} modelo(s) cadastrado(s).` : 'Nenhum modelo cadastrado ainda.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
           {templates.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                    {templates.map((template) => (
                        <AccordionItem value={template.id} key={template.id}>
                            <AccordionTrigger>{template.title}</AccordionTrigger>
                            <AccordionContent>
                                <div className="prose prose-invert max-w-none rounded-md bg-muted/50 p-4">
                                     <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {template.content}
                                    </ReactMarkdown>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
           ) : (
             <div className="flex flex-col items-center justify-center p-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground">Nenhum modelo cadastrado</h3>
                <p className="text-muted-foreground mt-2">Crie seu primeiro modelo de documento no botão "Novo Modelo".</p>
            </div>
           )}
        </CardContent>
      </Card>

    </div>
  )
}
