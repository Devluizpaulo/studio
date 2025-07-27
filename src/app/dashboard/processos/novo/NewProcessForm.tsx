"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createProcessAction } from "./actions";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Briefcase } from "lucide-react";

const formSchema = z.object({
  clientName: z.string().min(3, "O nome do cliente é obrigatório."),
  clientDocument: z.string().min(11, "O CPF/CNPJ do cliente é obrigatório."),
  processNumber: z.string().min(5, "O número do processo é obrigatório."),
  court: z.string().min(3, "A vara e comarca são obrigatórias."),
  actionType: z.string().min(3, "O tipo de ação é obrigatório."),
  status: z.enum(["active", "pending", "archived"]),
});

type FormValues = z.infer<typeof formSchema>;

export function NewProcessForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientDocument: "",
      processNumber: "",
      court: "",
      actionType: "",
      status: "active",
    },
  });

  async function onSubmit(values: FormValues) {
    if (!user) {
        toast({ title: "Erro", description: "Você precisa estar logado para criar um processo.", variant: "destructive" });
        return;
    }
    
    setIsLoading(true);
    const result = await createProcessAction({ ...values, lawyerId: user.uid });
    
    if (result.success) {
      toast({
        title: "Processo Criado!",
        description: "O novo processo foi adicionado com sucesso.",
      });
      router.push("/dashboard");
    } else {
      toast({
        title: "Erro ao Criar Processo",
        description: result.error || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
            <Briefcase className="mr-3 h-6 w-6 text-accent" />
            Detalhes do Processo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome do Cliente</FormLabel>
                        <FormControl>
                        <Input placeholder="Nome completo do cliente" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="clientDocument"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>CPF ou CNPJ do Cliente</FormLabel>
                        <FormControl>
                        <Input placeholder="XXX.XXX.XXX-XX" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
             <FormField
                control={form.control}
                name="processNumber"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Número do Processo</FormLabel>
                    <FormControl>
                    <Input placeholder="XXXXXXX-XX.XXXX.X.XX.XXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="court"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Vara e Comarca</FormLabel>
                        <FormControl>
                        <Input placeholder="Ex: 1ª Vara Cível de São Paulo" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="actionType"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tipo de Ação</FormLabel>
                        <FormControl>
                        <Input placeholder="Ex: Ação de Indenização" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
              <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Inicial</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status do processo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Em Andamento</SelectItem>
                          <SelectItem value="pending">Aguardando Audiência</SelectItem>
                          <SelectItem value="archived">Arquivado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

            <Button type="submit" disabled={isLoading} className="w-full" size="lg" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cadastrar Processo
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
