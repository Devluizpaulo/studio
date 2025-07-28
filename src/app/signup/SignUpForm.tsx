"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDocs, collection, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";


import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const formSchema = z.object({
  fullName: z.string().min(3, "O nome completo deve ter pelo menos 3 caracteres."),
  oab: z.string().min(2, "O número da OAB é obrigatório."),
  legalSpecialty: z.string().min(3, "A especialidade é obrigatória."),
  office: z.string().min(2, "O nome do escritório é obrigatório."),
  email: z.string().email("Por favor, insira um e-mail válido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export function SignUpForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      oab: "",
      legalSpecialty: "",
      office: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    
    try {
      // An office can only be created if there are no other users/offices yet.
      const usersQuery = query(collection(db, "users"), where("role", "==", "master"));
      const masterUsersSnapshot = await getDocs(usersQuery);

      if(!masterUsersSnapshot.empty) {
        toast({
          title: "Cadastro não permitido",
          description: "Um escritório já foi criado. Novos usuários devem ser convidados pelo administrador.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      const userRole = 'master';
      const officeId = `office_${Date.now()}`;

      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: values.fullName
      });

      // Save additional lawyer data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: values.fullName,
        email: values.email,
        oab: values.oab,
        legalSpecialty: values.legalSpecialty,
        office: values.office,
        role: userRole,
        officeId: officeId,
        createdAt: new Date(),
      });

      toast({
        title: "Cadastro Realizado com Sucesso!",
        description: `Seu escritório foi criado e seu cargo é: ${userRole}. Você será redirecionado.`,
      });

      router.push('/dashboard');

    } catch (error: any) {
      console.error("Error during sign up:", error);
      toast({
        title: "Erro no Cadastro",
        description: error.message || "Ocorreu um erro. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
      <Card className="mx-auto max-w-lg border-0 shadow-none sm:border sm:shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Crie a Conta do seu Escritório</CardTitle>
          <CardDescription>
            Preencha os campos para criar a conta de Administrador (Master). Futuros usuários serão convidados por você.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seu Nome Completo (Administrador)</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="office"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Escritório</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do seu escritório" {...field} />
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
                      <FormLabel>Sua OAB</FormLabel>
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
                      <FormLabel>Sua Especialidade</FormLabel>
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seu E-mail de Login</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sua Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Atenção!</AlertTitle>
                <AlertDescription>
                  Este formulário é apenas para criar o primeiro administrador do escritório. Outros advogados e secretárias deverão ser convidados através do painel de equipe após o login.
                </AlertDescription>
              </Alert>


              <Button type="submit" disabled={isLoading} className="w-full" size="lg" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Conta do Escritório
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            Já tem uma conta?{" "}
            <Link href="/login" className="underline text-accent font-semibold">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
  );
}
