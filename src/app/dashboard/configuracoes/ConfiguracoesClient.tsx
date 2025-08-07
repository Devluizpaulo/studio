"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Settings, KeyRound, BadgeHelp, Eye, EyeOff, SearchCode, Tag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { updateApiKeyAction, getApiKeyAction, updateSeoSettingsAction, getSeoSettingsAction, updateGtmIdAction, getGtmIdAction } from './actions'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'

const apiKeyFormSchema = z.object({
    googleApiKey: z.string().min(10, "A chave de API parece ser muito curta."),
})
type ApiKeyFormValues = z.infer<typeof apiKeyFormSchema>

const seoFormSchema = z.object({
    metaTitle: z.string().max(60, "O título deve ter no máximo 60 caracteres."),
    metaDescription: z.string().max(160, "A descrição deve ter no máximo 160 caracteres."),
    metaKeywords: z.string().optional(),
})
type SeoFormValues = z.infer<typeof seoFormSchema>

const gtmFormSchema = z.object({
    gtmId: z.string().regex(/^GTM-[A-Z0-9]{7,}$/, "Formato de ID inválido. Ex: GTM-XXXXXXX").optional().or(z.literal('')),
})
type GtmFormValues = z.infer<typeof gtmFormSchema>


export function ConfiguracoesClient() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [officeId, setOfficeId] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  const apiKeyForm = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: { googleApiKey: "" }
  })

  const seoForm = useForm<SeoFormValues>({
      resolver: zodResolver(seoFormSchema),
      defaultValues: { metaTitle: "", metaDescription: "", metaKeywords: "" }
  })

  const gtmForm = useForm<GtmFormValues>({
      resolver: zodResolver(gtmFormSchema),
      defaultValues: { gtmId: "" }
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userDocRef, async (userDoc) => {
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const currentOfficeId = userData.officeId;

                setCurrentUserRole(userData.role);
                setOfficeId(currentOfficeId);
                
                if (userData.role !== 'master') {
                    setLoading(false);
                    return;
                }
                
                // Fetch all settings
                const [apiKeyResult, seoSettingsResult, gtmIdResult] = await Promise.all([
                    getApiKeyAction(currentOfficeId),
                    getSeoSettingsAction(currentOfficeId),
                    getGtmIdAction(currentOfficeId)
                ]);

                if (apiKeyResult.success && apiKeyResult.data) {
                    apiKeyForm.setValue('googleApiKey', apiKeyResult.data);
                }

                if (seoSettingsResult.success && seoSettingsResult.data) {
                    seoForm.reset(seoSettingsResult.data);
                }
                
                if (gtmIdResult.success && gtmIdResult.data) {
                    gtmForm.setValue('gtmId', gtmIdResult.data);
                }

            }
            setLoading(false);
        });
        return () => unsubscribe();
    }
  }, [user, authLoading, router, apiKeyForm, seoForm, gtmForm])

  async function onApiKeySubmit(values: ApiKeyFormValues) {
    if (!user || !officeId) return
    setIsSubmitting(true)
    const result = await updateApiKeyAction({ ...values, officeId: officeId })
    if (result.success) {
      toast({ title: 'Chave de API atualizada com sucesso!' })
    } else {
      toast({ title: 'Erro ao atualizar a chave', description: result.error, variant: 'destructive'})
    }
    setIsSubmitting(false)
  }

  async function onSeoSubmit(values: SeoFormValues) {
    if (!user || !officeId) return
    setIsSubmitting(true)
    const result = await updateSeoSettingsAction({ ...values, officeId: officeId })
    if (result.success) {
      toast({ title: 'Configurações de SEO atualizadas!' })
    } else {
      toast({ title: 'Erro ao salvar SEO', description: result.error, variant: 'destructive'})
    }
    setIsSubmitting(false)
  }

  async function onGtmSubmit(values: GtmFormValues) {
    if (!user || !officeId) return
    setIsSubmitting(true)
    const result = await updateGtmIdAction({ ...values, officeId: officeId })
    if (result.success) {
      toast({ title: 'ID do Google Tag Manager atualizado!' })
    } else {
      toast({ title: 'Erro ao salvar ID do GTM', description: result.error, variant: 'destructive'})
    }
    setIsSubmitting(false)
  }

  if (authLoading || loading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-80 w-full" />
        </div>
    )
  }

  if (currentUserRole !== 'master') {
    return (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
            <BadgeHelp className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-xl font-semibold text-foreground">Acesso Negado</h3>
            <p className="text-muted-foreground mt-2">Apenas o Administrador do escritório pode acessar esta página.</p>
        </Card>
    );
  }


  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <KeyRound className="mr-3 h-5 w-5 text-accent" />
                    Chave de API do Google
                </CardTitle>
                <CardDescription>
                    Esta chave é utilizada para todas as funcionalidades de Inteligência Artificial da plataforma.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Alert variant="destructive" className="mb-6">
                    <Settings className="h-4 w-4" />
                    <AlertTitle>Aviso Importante</AlertTitle>
                    <AlertDescription>
                        Alterar esta chave pode impactar o funcionamento de todas as ferramentas de IA. Tenha certeza de que a chave inserida é válida e possui acesso às APIs da Vertex AI (Google AI).
                    </AlertDescription>
                </Alert>

                <Form {...apiKeyForm}>
                <form onSubmit={apiKeyForm.handleSubmit(onApiKeySubmit)} className="space-y-6">
                     <FormField
                        control={apiKeyForm.control}
                        name="googleApiKey"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Google API Key</FormLabel>
                                <div className="flex items-center gap-2">
                                    <FormControl>
                                        <Input 
                                            placeholder="Cole sua chave de API aqui" 
                                            type={showApiKey ? 'text' : 'password'}
                                            {...field} 
                                        />
                                    </FormControl>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => setShowApiKey(!showApiKey)}>
                                        {showApiKey ? <EyeOff /> : <Eye />}
                                    </Button>
                                </div>
                                 <FormDescription>
                                    A sua chave é armazenada de forma segura e usada apenas para se comunicar com os serviços do Google.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                   
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Chave de API
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <SearchCode className="mr-3 h-5 w-5 text-accent" />
                    Configurações de SEO
                </CardTitle>
                <CardDescription>
                    Otimize como seu site aparece em mecanismos de busca como o Google.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...seoForm}>
                <form onSubmit={seoForm.handleSubmit(onSeoSubmit)} className="space-y-6">
                     <FormField
                        control={seoForm.control}
                        name="metaTitle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Título do Site (Meta Title)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: RGMJ Advocacia - Especialistas em Direito Cível" {...field} />
                                </FormControl>
                                <FormDescription>O título que aparece na aba do navegador e nos resultados de busca.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={seoForm.control}
                        name="metaDescription"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descrição do Site (Meta Description)</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Descreva seu escritório e serviços em até 160 caracteres." {...field} />
                                </FormControl>
                                <FormDescription>Um resumo que aparece sob o título nos resultados de busca.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={seoForm.control}
                        name="metaKeywords"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Palavras-chave</FormLabel>
                                <FormControl>
                                    <Input placeholder="advogado, direito cível, são paulo..." {...field} />
                                </FormControl>
                                <FormDescription>Termos relevantes separados por vírgula.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                   
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Configurações de SEO
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Tag className="mr-3 h-5 w-5 text-accent" />
                    Google Tag Manager
                </CardTitle>
                <CardDescription>
                    Integre o Google Tag Manager para gerenciar scripts de marketing e análise.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...gtmForm}>
                <form onSubmit={gtmForm.handleSubmit(onGtmSubmit)} className="space-y-6">
                     <FormField
                        control={gtmForm.control}
                        name="gtmId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ID do Contêiner do GTM</FormLabel>
                                <FormControl>
                                    <Input placeholder="GTM-XXXXXXX" {...field} />
                                </FormControl>
                                <FormDescription>Seu ID pode ser encontrado no painel do Google Tag Manager.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                   
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar ID do GTM
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  )
}
