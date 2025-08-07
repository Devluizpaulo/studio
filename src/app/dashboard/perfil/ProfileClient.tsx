"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, storage, auth } from '@/lib/firebase'
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
import { Loader2, User, BadgeHelp, Upload, Camera, Check, ChevronsUpDown, X, KeyRound, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { updateProfileAction, updateProfilePhotoAction, changePasswordAction, changeEmailAction } from './actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const legalSpecialties = [
  { value: "Direito Civil", label: "Direito Civil" },
  { value: "Direito Penal", label: "Direito Penal" },
  { value: "Direito Trabalhista", label: "Direito Trabalhista" },
  { value: "Direito Tributário", label: "Direito Tributário" },
  { value: "Direito Empresarial", label: "Direito Empresarial" },
  { value: "Direito do Consumidor", label: "Direito do Consumidor" },
  { value: "Direito de Família", label: "Direito de Família" },
  { value: "Direito Previdenciário", label: "Direito Previdenciário" },
  { value: "Direito Ambiental", label: "Direito Ambiental" },
  { value: "Direito Digital", label: "Direito Digital" },
  { value: "Direito Imobiliário", label: "Direito Imobiliário" },
] as const;


const profileFormSchema = z.object({
    fullName: z.string().min(3, "O nome completo é obrigatório."),
    oab: z.string().min(2, "O número da OAB é obrigatório.").optional(),
    legalSpecialty: z.array(z.string()).optional(),
    office: z.string().min(2, "O nome do escritório é obrigatório.").optional(),
    bio: z.string().optional(),
    photoFile: z.instanceof(File).optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "A senha atual é obrigatória."),
  newPassword: z.string().min(8, "A nova senha deve ter pelo menos 8 caracteres."),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "As novas senhas não coincidem.",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const emailFormSchema = z.object({
  newEmail: z.string().email("Por favor, insira um e-mail válido."),
  currentPassword: z.string().min(1, "Sua senha atual é obrigatória para esta alteração."),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;


export function ProfileClient() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false)
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [userRole, setUserRole] = useState<string|null>(null)
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);


  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
        legalSpecialty: []
    }
  })

  const passwordForm = useForm<PasswordFormValues>({
      resolver: zodResolver(passwordFormSchema),
      defaultValues: {
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
      }
  })

   const emailForm = useForm<EmailFormValues>({
      resolver: zodResolver(emailFormSchema),
      defaultValues: {
        newEmail: user?.email || '',
        currentPassword: ''
      }
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
                profileForm.reset({
                    fullName: userData.fullName,
                    oab: userData.oab,
                    legalSpecialty: userData.legalSpecialty || [],
                    office: userData.office,
                    bio: userData.bio,
                })
                 emailForm.reset({
                    newEmail: userData.email,
                    currentPassword: ''
                })
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }
  }, [user, authLoading, router, profileForm, emailForm])

  async function onProfileSubmit(values: ProfileFormValues) {
    if (!user) return
    setIsSubmittingProfile(true)

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
        setIsSubmittingProfile(false)
    }
  }

  async function onPasswordSubmit(values: PasswordFormValues) {
    if (!user) return;
    setIsSubmittingPassword(true);

    const result = await changePasswordAction(values);

    if (result.success) {
        toast({ title: "Senha alterada com sucesso!"});
        passwordForm.reset();
    } else {
        toast({
            title: "Erro ao alterar senha",
            description: result.error,
            variant: "destructive"
        });
    }

    setIsSubmittingPassword(false);
  }

  async function onEmailSubmit(values: EmailFormValues) {
    if (!user) return;
    setIsSubmittingEmail(true);

    const result = await changeEmailAction(values);

    if (result.success) {
        toast({ title: "E-mail alterado com sucesso!", description: "O novo e-mail será usado no seu próximo login."});
        emailForm.reset({
            newEmail: values.newEmail,
            currentPassword: ''
        });
    } else {
        toast({
            title: "Erro ao alterar e-mail",
            description: result.error,
            variant: "destructive"
        });
    }
    setIsSubmittingEmail(false);
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
                <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                    <div className="flex flex-col md:flex-row items-start gap-8">
                         <div className="flex-shrink-0 w-full md:w-48 text-center">
                            <FormField
                                control={profileForm.control}
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
                                control={profileForm.control}
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
                                control={profileForm.control}
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
                                control={profileForm.control}
                                name="legalSpecialty"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Especialidades Jurídicas</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "justify-between h-auto",
                                                            !field.value?.length && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <div className="flex gap-1 flex-wrap">
                                                            {(field.value && field.value.length > 0) ? (
                                                                field.value.map(spec => (
                                                                    <Badge key={spec} variant="secondary" className="mr-1">
                                                                        {spec}
                                                                    </Badge>
                                                                ))
                                                            ) : (
                                                                "Selecione as especialidades"
                                                            )}
                                                        </div>
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Buscar especialidade..." />
                                                    <CommandList>
                                                        <CommandEmpty>Nenhuma especialidade encontrada.</CommandEmpty>
                                                        <CommandGroup>
                                                            {legalSpecialties.map(option => {
                                                                const isSelected = field.value?.includes(option.value);
                                                                return (
                                                                    <CommandItem
                                                                        key={option.value}
                                                                        onSelect={() => {
                                                                            if (isSelected) {
                                                                                field.onChange(field.value?.filter(v => v !== option.value));
                                                                            } else {
                                                                                field.onChange([...(field.value || []), option.value]);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                isSelected ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {option.label}
                                                                    </CommandItem>
                                                                )
                                                            })}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>
                            <FormField
                                control={profileForm.control}
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
                        control={profileForm.control}
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

                    <Button type="submit" disabled={isSubmittingProfile}>
                        {isSubmittingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Alterações
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
        
        <Card>
             <CardHeader>
                <CardTitle className="flex items-center">
                    <KeyRound className="mr-3 h-5 w-5 text-accent" />
                    Segurança da Conta
                </CardTitle>
                <CardDescription>
                    Gerencie seu e-mail de login e sua senha de acesso.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                 <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6 max-w-md">
                        <FormField
                            control={emailForm.control}
                            name="newEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-mail de Login</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="seu@email.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={emailForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Senha Atual para Confirmar</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Sua senha atual" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <Button type="submit" disabled={isSubmittingEmail} variant="outline">
                            {isSubmittingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Alterar E-mail
                        </Button>
                    </form>
                 </Form>

                <Separator />
                
                 <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6 max-w-md">
                         <h3 className="text-base font-semibold">Alterar Senha</h3>
                        <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Senha Atual</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Sua senha atual" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nova Senha</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Mínimo 8 caracteres" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmar Nova Senha</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Repita a nova senha" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <Button type="submit" disabled={isSubmittingPassword}>
                            {isSubmittingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Alterar Senha
                        </Button>
                    </form>
                 </Form>
            </CardContent>
        </Card>
    </div>
  )
}
