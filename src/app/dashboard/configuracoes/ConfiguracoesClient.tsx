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
import { Loader2, Settings, KeyRound, BadgeHelp, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { updateApiKeyAction, getApiKeyAction } from './actions'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

const settingsFormSchema = z.object({
    googleApiKey: z.string().min(10, "A chave de API parece ser muito curta."),
})

type SettingsFormValues = z.infer<typeof settingsFormSchema>

export function ConfiguracoesClient() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [officeId, setOfficeId] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
        googleApiKey: ""
    }
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
                setCurrentUserRole(userData.role);
                setOfficeId(userData.officeId);
                if (userData.role !== 'master') {
                    setLoading(false);
                    return;
                }
                
                // Fetch API Key
                const apiKeyResult = await getApiKeyAction(userData.officeId);
                if (apiKeyResult.success && apiKeyResult.data) {
                    form.setValue('googleApiKey', apiKeyResult.data);
                }

            }
            setLoading(false);
        });
        return () => unsubscribe();
    }
  }, [user, authLoading, router, form])

  async function onSubmit(values: SettingsFormValues) {
    if (!user || !officeId) return
    setIsSubmitting(true)
    const result = await updateApiKeyAction({ ...values, officeId: officeId })
    if (result.success) {
      toast({ title: 'Chave de API atualizada com sucesso!' })
    } else {
      toast({
        title: 'Erro ao atualizar a chave',
        description: result.error,
        variant: 'destructive',
      })
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

                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                     <FormField
                        control={form.control}
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
    </div>
  )
}
