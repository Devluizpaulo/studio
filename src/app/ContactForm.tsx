"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { createContactRequestAction } from "./actions";

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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, "O nome completo é obrigatório."),
  email: z.string().email("Por favor, insira um e-mail válido."),
  phone: z.string().min(10, "O telefone deve ter no mínimo 10 dígitos."),
  message: z.string().min(10, "Sua mensagem deve ter pelo menos 10 caracteres.").max(500, "A mensagem não pode exceder 500 caracteres."),
});

type FormValues = z.infer<typeof formSchema>;

export function ContactForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    const result = await createContactRequestAction(values);
    if (result.success) {
      toast({
        title: "Mensagem Enviada!",
        description: "Agradecemos seu contato. Retornaremos em breve.",
      });
      form.reset();
    } else {
      toast({
        title: "Erro ao Enviar",
        description: result.error,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }

  return (
      <Card className="shadow-2xl bg-card">
        <CardHeader>
          <CardTitle>Envie sua Mensagem</CardTitle>
          <CardDescription>Preencha o formulário e nossa equipe entrará em contato.</CardDescription>
        </CardHeader>
        <CardContent>
           <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                 <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Telefone / WhatsApp</FormLabel>
                        <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
               </div>
               <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sua Mensagem</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Descreva brevemente seu caso ou dúvida..." className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Enviar Mensagem
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
  );
}
