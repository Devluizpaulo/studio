"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, storage } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Image from 'next/image'


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
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, User, BadgeHelp, Upload, Camera } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { updateProfileAction, updateProfilePhotoAction } from './actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'


const profileFormSchema = z.object({
    fullName: z.string().min(3, "O nome completo é obrigatório."),
    oab: z.string().min(2, "O número da OAB é obrigatório.").optional(),
    legalSpecialty: z.string().min(3, "A especialidade é obrigatória.").optional(),
    office: z.string().min(2, "O nome do escritório é obrigatório.").optional(),
    bio: z.string().optional(),
    photoFile: z.instanceof(File).optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileClient() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userRole, setUserRole] = useState<string|null>(null)
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);


  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userDocRef, (userDoc) => {
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setUserRole(userData.role);
                setPhotoUrl(userData.photoUrl || "");
                form.reset({
                    fullName: userData.fullName,
                    oab: userData.oab,
                    legalSpecialty: userData.legalSpecialty,
                    office: userData.office,
                    bio: userData.bio,
                })
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }
  }, [user, authLoading, router, form])

  async function onSubmit(values: ProfileFormValues) {
    if (!user) return
    setIsSubmitting(true)

    try {
        // First, handle file upload if a new photo is provided
        if (values.photoFile) {
            const file = values.photoFile;
            const storageRef = ref(storage, `profile_photos/${user.uid}/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            
            // Update the photo URL in the database
            await updateProfilePhotoAction({ uid: user.uid, photoUrl: downloadURL });
            setPhotoUrl(downloadURL); // Update state to show new photo immediately
        }

        // Then, update the rest of the profile information
        const result = await updateProfileAction({ 
            uid: user.uid,
            fullName: values.fullName,
            oab: values.oab,
            legalSpecialty: values.legalSpecialty,
            office: values.office,
            bio: values.bio,
        })
        if (result.success) {
          toast({ title: 'Perfil atualizado com sucesso!' })
        } else {
          toast({
            title: 'Erro ao atualizar perfil',
            description: result.error,
            variant: 'destructive',
          })
        }
    } catch(error) {
         toast({
            title: 'Erro no Upload',
            description: 'Não foi possível enviar a foto.',
            variant: 'destructive',
          })
    } finally {
        setIsSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-80 w-full" />
        </div>
    )
  }

  if (userRole === 'secretary') {
     return (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
            <BadgeHelp className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground">Página de Perfil</h3>
            <p className="text-muted-foreground mt-2">As informações de perfil são gerenciadas pelo administrador.</p>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Meu Perfil</h2>
            <p className="text-muted-foreground">Gerencie suas informações profissionais e biografia.</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <User className="mr-3 h-5 w-5 text-accent" />
                    Informações Profissionais
                </CardTitle>
                <CardDescription>
                    Estes dados poderão ser utilizados na página inicial do site para apresentar a equipe.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="flex flex-col md:flex-row items-start gap-8">
                         <div className="flex-shrink-0 w-full md:w-48 text-center">
                            <FormField
                                control={form.control}
                                name="photoFile"
                                render={({ field: { onChange, value, ...rest } }) => (
                                <FormItem>
                                    <FormLabel>Foto de Perfil</FormLabel>
                                    <FormControl>
                                    <div className="flex flex-col items-center gap-4">
                                         <Avatar className="w-40 h-40 border-4 border-accent/20">
                                            <AvatarImage src={photoPreview || photoUrl} alt="Foto de Perfil" />
                                            <AvatarFallback>
                                                <User className="h-20 w-20" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <Button asChild variant="outline">
                                            <label htmlFor="photo-upload" className="cursor-pointer flex items-center">
                                                <Camera className="mr-2 h-4 w-4" />
                                                Trocar Foto
                                            </label>
                                        </Button>
                                        <Input
                                            id="photo-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    onChange(file);
                                                    setPhotoPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                            {...rest}
                                        />
                                    </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex-grow space-y-6">
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
                        </div>
                    </div>
                    
                    <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Biografia Curta</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Escreva um breve parágrafo sobre sua carreira, foco e filosofia de trabalho..."
                                        className="min-h-[120px]"
                                        {...field}
                                    />
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
