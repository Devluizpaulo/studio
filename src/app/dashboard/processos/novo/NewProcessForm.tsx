"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createProcessAction } from "./actions";
import { collection, query, where, onSnapshot, DocumentData, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";


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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Briefcase, Users, Scale } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  clientId: z.string().min(1, "É obrigatório vincular o processo a um cliente."),
  processNumber: z.string().min(5, "O número do processo é obrigatório."),
  justiceType: z.enum(["civel", "criminal", "trabalhista", "federal", "outra"], { required_error: "Selecione o tipo de justiça."}),
  comarca: z.string().min(3, "A comarca é obrigatória."),
  court: z.string().min(3, "A vara ou fórum é obrigatório."),
  actionType: z.string().min(3, "O tipo de ação é obrigatório."),
  plaintiff: z.string().min(3, "O nome do autor é obrigatório. Para múltiplos autores, separe por vírgula."),
  defendant: z.string().min(3, "O nome do réu é obrigatório. Para múltiplos réus, separe por vírgula."),
  representation: z.enum(["plaintiff", "defendant"], { required_error: "Selecione a sua representação."}),
  status: z.enum(["a_distribuir", "em_andamento", "em_recurso", "execucao", "arquivado_provisorio", "arquivado_definitivo"]),
  lawyerId: z.string().min(1, "É obrigatório selecionar um advogado responsável."),
});

type FormValues = z.infer<typeof formSchema>;

interface ClientOption {
    id: string;
    fullName: string;
}
interface LawyerOption {
    uid: string;
    fullName: string;
}

export function NewProcessForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [lawyers, setLawyers] =useState<LawyerOption[]>([]);
  const [officeId, setOfficeId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const unsubUser = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const currentOfficeId = docSnap.data().officeId;
                setOfficeId(currentOfficeId);
            }
        });
        return () => unsubUser();
    }
  }, [user]);


  useEffect(() => {
      if (!officeId) return;
      
      // Fetch Clients
      const clientQuery = query(collection(db, 'clients'), where('officeId', '==', officeId));
      const unsubClients = onSnapshot(clientQuery, (snapshot) => {
          const clientList = snapshot.docs.map(doc => ({ id: doc.id, fullName: doc.data().fullName }));
          setClients(clientList);
      });

      // Fetch Lawyers
      const lawyerQuery = query(collection(db, 'users'), where('officeId', '==', officeId), where('role', 'in', ['master', 'lawyer']));
      const unsubLawyers = onSnapshot(lawyerQuery, (snapshot) => {
          const lawyerList = snapshot.docs.map(doc => ({ uid: doc.id, fullName: doc.data().fullName }));
          setLawyers(lawyerList);
      });

      return () => {
          unsubClients();
          unsubLawyers();
      }

  }, [officeId]);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      processNumber: "",
      justiceType: "civel",
      comarca: "",
      court: "",
      actionType: "",
      plaintiff: "",
      defendant: "",
      status: "a_distribuir",
      lawyerId: user?.uid || "",
    },
  });

  async function onSubmit(values: FormValues) {
    if (!user || !officeId) {
        toast({ title: "Erro", description: "Você precisa estar logado e associado a um escritório.", variant: "destructive" });
        return;
    }
    
    setIsLoading(true);
    const clientName = clients.find(c => c.id === values.clientId)?.fullName || "Cliente não encontrado";

    const result = await createProcessAction({ 
        ...values, 
        officeId: officeId,
        clientName, // Pass the client name for storage
    });
    
    if (result.success) {
      toast({
        title: "Processo Criado!",
        description: "O novo processo foi adicionado com sucesso.",
      });
      router.push("/dashboard/processos");
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
        <CardTitle className="font-headline text-xl flex items-center">
            <Briefcase className="mr-3 h-5 w-5 text-accent" />
            Detalhes do Processo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Cliente Principal</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o cliente deste processo" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {clients.map(client => (
                                    <SelectItem key={client.id} value={client.id}>{client.fullName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="lawyerId"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Advogado Responsável</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o advogado responsável" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                               {lawyers.map(lawyer => (
                                    <SelectItem key={lawyer.uid} value={lawyer.uid}>{lawyer.fullName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                    <FormLabel>Número do Processo (CNJ)</FormLabel>
                    <FormControl>
                    <Input placeholder="XXXXXXX-XX.XXXX.X.XX.XXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <FormField
                    control={form.control}
                    name="justiceType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tipo de Justiça</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="civel">Cível</SelectItem>
                                <SelectItem value="criminal">Criminal</SelectItem>
                                <SelectItem value="trabalhista">Trabalhista</SelectItem>
                                <SelectItem value="federal">Federal</SelectItem>
                                <SelectItem value="outra">Outra</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                  <FormField
                    control={form.control}
                    name="comarca"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Comarca</FormLabel>
                        <FormControl>
                        <Input placeholder="Ex: São Paulo" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="court"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Vara / Fórum</FormLabel>
                        <FormControl>
                        <Input placeholder="Ex: 1ª Vara Cível" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

            <Card className="bg-background/50">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                        <Users className="mr-3 h-5 w-5 text-accent" />
                        Partes Envolvidas e Representação
                    </CardTitle>
                     <CardDescription>
                        Para múltiplas partes, separe os nomes por vírgula.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="plaintiff"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Autor(es)</FormLabel>
                                <FormControl>
                                <Textarea placeholder="Nome da parte autora" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="defendant"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Réu(s)</FormLabel>
                                <FormControl>
                                <Textarea placeholder="Nome da parte ré" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="representation"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                            <FormLabel>Sua Representação</FormLabel>
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex items-center gap-x-6"
                                >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="plaintiff" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    Pelo Autor
                                    </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="defendant" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    Pelo Réu
                                    </FormLabel>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </CardContent>
            </Card>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="actionType"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tipo de Ação</FormLabel>
                        <FormControl>
                        <Input placeholder="Ex: Ação de Indenização por Danos Morais" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
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
                          <SelectItem value="a_distribuir">A Distribuir</SelectItem>
                          <SelectItem value="em_andamento">Em Andamento</SelectItem>
                          <SelectItem value="em_recurso">Em Grau de Recurso</SelectItem>
                          <SelectItem value="execucao">Execução</SelectItem>
                          <SelectItem value="arquivado_provisorio">Arquivado Provisoriamente</SelectItem>
                          <SelectItem value="arquivado_definitivo">Arquivado Definitivamente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
              
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
