
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendPasswordResetEmailAction } from "./actions";

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
import { Loader2, ArrowLeft } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Por favor, insira um e-mail válido."),
});

type FormValues = z.infer<typeof formSchema>;

export function ResetPasswordForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    const result = await sendPasswordResetEmailAction(values.email);

    if (result.success) {
      toast({
        title: "E-mail Enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      setIsSuccess(true);
    } else {
      toast({
        title: "Erro ao Enviar E-mail",
        description: result.error,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }

  return (
    <Card className="mx-auto max-w-sm border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl">Recuperar Senha</CardTitle>
        <CardDescription>
          {isSuccess
            ? "O link de recuperação foi enviado para seu e-mail."
            : "Insira seu e-mail para receber um link de recuperação."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isSuccess ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar E-mail de Recuperação
              </Button>
            </form>
          </Form>
        ) : (
          <div className="text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              Siga as instruções no e-mail para criar uma nova senha.
            </p>
          </div>
        )}
        <div className="mt-6 text-center">
          <Button variant="ghost" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o Login
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
