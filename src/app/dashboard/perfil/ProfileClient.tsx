"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
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
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { updateProfileAction } from './actions'

const profileFormSchema = z.object({
    fullName: z.string().min(3, "O nome completo é obrigatório."),
    oab: z.string().min(2, "O número da OAB é obrigatório."),
    legalSpecialty: z.string().min(3, "A especialidade é obrigatória."),
    office: z.string().min(2, "O nome do escritório é obrigatório."),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileClient() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      const fetchUserData = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            form.reset({
                fullName: userData.fullName,
                oab: userData.oab,
                legalSpecialty: userData.legalSpecialty,
                office: userData.office,
            })
        }
        setLoading(false);
      }
      fetchUserData();
    }
  }, [user, authLoading, router, form])

  async function onSubmit(values: ProfileFormValues) {
    if (!user) return
    setIsSubmitting(true)
    const result = await updateProfileAction({ ...values, uid: user.uid })
    if (result.success) {
      toast({ title: 'Perfil atualizado com sucesso!' })
    } else {
      toast({
        title: 'Erro ao atualizar perfil',
        description: result.error,
        variant: 'destructive',
      })
    }
    setIsSubmitting(false)
  }

  if (authLoading || loading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-80 w-full" />
        </div>
    )
  }

  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Meu Perfil</h2>
            <p className="text-muted-foreground">Gerencie suas informações profissionais.</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <User className="mr-3 h-5 w-5 text-accent" />
                    Informações do Advogado
                </CardTitle>
                <CardDescription>
                    Mantenha seus dados sempre atualizados.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                     <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                                <Input placeholder="Seu nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
                        name="oab"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Nº da OAB</FormLabel>
                            <FormControl>
                                <Input placeholder="UF 123456" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="legalSpecialty"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Especialidade Jurídica</FormLabel>
                            <FormControl>
                                <Input placeholder="Direito Civil" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="office"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Escritório</FormLabel>
                            <FormControl>
                                <Input placeholder="Nome do seu escritório" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Alterações
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  )
}
