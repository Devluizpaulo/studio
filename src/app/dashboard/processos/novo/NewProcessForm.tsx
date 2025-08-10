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
import { Loader2, Briefcase, Users, Scale, Gavel, DollarSign, Plus, X, UserPlus } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { createClientAction } from "../../clientes/actions";

const formSchema = z.object({
  clientId: z.string().min(1, "É obrigatório vincular o processo a um cliente."),
  processNumber: z.string().min(5, "O número do processo é obrigatório."),
  justiceType: z.enum(["civel", "criminal", "trabalhista", "federal", "outra"], { required_error: "Selecione o tipo de justiça."}),
  comarca: z.string().min(3, "A comarca é obrigatória."),
  court: z.string().min(3, "A vara ou fórum é obrigatório."),
  actionType: z.string().min(3, "A 'classe' ou tipo de ação é obrigatório."),
  subject: z.string().min(3, "O 'assunto' é obrigatório."),
  judge: z.string().optional(),
  actionValue: z.coerce.number().optional(),
  plaintiffs: z.array(z.string()).min(1, "Adicione pelo menos um autor."),
  defendants: z.array(z.string()).min(1, "Adicione pelo menos um réu."),
  representation: z.enum(["plaintiff", "defendant"], { required_error: "Selecione a sua representação."}),
  status: z.enum(["a_distribuir", "em_andamento", "em_recurso", "execucao", "arquivado_provisorio", "arquivado_definitivo"]),
  lawyerId: z.string().min(1, "É obrigatório selecionar um advogado responsável."),
});

type FormValues = z.infer<typeof formSchema>;

const clientFormSchema = z.object({
  fullName: z.string().min(3, "O nome completo é obrigatório."),
  email: z.string().email("Por favor, insira um e-mail válido."),
  phone: z.string().min(10, "O telefone deve ter no mínimo 10 dígitos."),
  nationality: z.string().min(3, "A nacionalidade é obrigatória."),
  maritalStatus: z.enum(["solteiro", "casado", "divorciado", "viuvo", "uniao_estavel"]),
  profession: z.string().min(3, "A profissão é obrigatória."),
  rg: z.string().min(5, "O RG é obrigatório."),
  issuingBody: z.string().min(2, "O órgão emissor é obrigatório."),
  document: z.string().min(11, "O CPF/CNPJ deve ter no mínimo 11 dígitos."),
  zipCode: z.string().min(8, "O CEP deve ter 8 dígitos.").max(9, "O CEP deve ter 8 dígitos."),
  street: z.string().min(3, "O logradouro é obrigatório."),
  number: z.string().min(1, "O número é obrigatório."),
  neighborhood: z.string().min(3, "O bairro é obrigatório."),
  city: z.string().min(3, "A cidade é obrigatória."),
  state: z.string().min(2, "O estado é obrigatório."),
})

type ClientFormValues = z.infer<typeof clientFormSchema>

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

  const [currentPlaintiff, setCurrentPlaintiff] = useState("");
  const [plaintiffsList, setPlaintiffsList] = useState<string[]>([]);
  const [currentDefendant, setCurrentDefendant] = useState("");
  const [defendantsList, setDefendantsList] = useState<string[]>([]);
  
  const [isClientDialogOpen, setClientDialogOpen] = useState(false);
  const [isSubmittingClient, setSubmittingClient] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);


  const processForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      processNumber: "",
      justiceType: "civel",
      comarca: "",
      court: "",
      actionType: "",
      subject: "",
      status: "a_distribuir",
      lawyerId: user?.uid || "",
      plaintiffs: [],
      defendants: [],
    },
  });

  const clientForm = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      nationality: 'Brasileiro(a)',
      maritalStatus: 'solteiro',
      profession: '',
      rg: '',
      issuingBody: 'SSP/SP',
      document: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    },
  });

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) {
      return;
    }
    setIsFetchingCep(true);
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (data.erro) {
            toast({ title: "CEP não encontrado", variant: 'destructive'});
            return;
        }
        clientForm.setValue('street', data.logradouro);
        clientForm.setValue('neighborhood', data.bairro);
        clientForm.setValue('city', data.localidade);
        clientForm.setValue('state', data.uf);
        toast({ title: "Endereço preenchido!"});
    } catch (error) {
        toast({ title: "Erro ao buscar CEP", variant: 'destructive'});
    } finally {
        setIsFetchingCep(false);
    }
  }

  useEffect(() => {
    processForm.setValue("plaintiffs", plaintiffsList);
  }, [plaintiffsList, processForm]);

  useEffect(() => {
    processForm.setValue("defendants", defendantsList);
  }, [defendantsList, processForm]);


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
      
      const clientQuery = query(collection(db, 'clients'), where('officeId', '==', officeId));
      const unsubClients = onSnapshot(clientQuery, (snapshot) => {
          const clientList = snapshot.docs.map(doc => ({ id: doc.id, fullName: doc.data().fullName }));
          setClients(clientList);
      });

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

  const handleAddPlaintiff = () => {
    if (currentPlaintiff.trim() !== "") {
        setPlaintiffsList(prev => [...prev, currentPlaintiff.trim()]);
        setCurrentPlaintiff("");
    }
  }
  const handleRemovePlaintiff = (index: number) => {
    setPlaintiffsList(prev => prev.filter((_, i) => i !== index));
  }

  const handleAddDefendant = () => {
    if (currentDefendant.trim() !== "") {
        setDefendantsList(prev => [...prev, currentDefendant.trim()]);
        setCurrentDefendant("");
    }
  }
  const handleRemoveDefendant = (index: number) => {
    setDefendantsList(prev => prev.filter((_, i) => i !== index));
  }

  async function handleClientSubmit(values: ClientFormValues) {
    if (!user) return;
    setSubmittingClient(true);
    const result = await createClientAction({ ...values, lawyerId: user.uid });
    if (result.success) {
      toast({ title: "Cliente cadastrado com sucesso!" });
      setClientDialogOpen(false);
      clientForm.reset();
      // Wait for the new client to be available in the list via snapshot, then select it.
      // This is a simple way, a more robust way could involve re-fetching or optimistic updates.
      setTimeout(() => processForm.setValue('clientId', result.data.clientId), 500);
    } else {
      toast({
        title: "Erro ao cadastrar cliente",
        description: result.error,
        variant: "destructive",
      });
    }
    setSubmittingClient(false);
  }

  async function onProcessSubmit(values: FormValues) {
    if (!user || !officeId) {
        toast({ title: "Erro", description: "Você precisa estar logado e associado a um escritório.", variant: "destructive" });
        return;
    }
    
    setIsLoading(true);
    const clientName = clients.find(c => c.id === values.clientId)?.fullName || "Cliente não encontrado";

    const result = await createProcessAction({ 
        ...values, 
        officeId: officeId,
        clientName,
    });
    
    if (result.success) {
      toast({
        title: "Processo Criado!",
        description: "O novo processo foi adicionado com sucesso.",
      });
      router.push(`/dashboard/processos/${result.data.processId}`);
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
            Dados Fundamentais do Processo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...processForm}>
          <form onSubmit={processForm.handleSubmit(onProcessSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                    control={processForm.control}
                    name="clientId"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Cliente Principal</FormLabel>
                        <div className="flex gap-2">
                            <Select onValueChange={field.onChange} value={field.value}>
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
                            
                             <Dialog open={isClientDialogOpen} onOpenChange={setClientDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button type="button" variant="outline" size="icon">
                                        <UserPlus className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[800px]">
                                     <DialogHeader>
                                        <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
                                    </DialogHeader>
                                     <Form {...clientForm}>
                                        <form onSubmit={clientForm.handleSubmit(handleClientSubmit)} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-6">
                                            <h3 className="text-lg font-medium text-primary">Dados Pessoais</h3>
                                            <FormField control={clientForm.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input placeholder="Nome completo do cliente" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField control={clientForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>E-mail</FormLabel><FormControl><Input placeholder="email@cliente.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={clientForm.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(XX) XXXXX-XXXX" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField control={clientForm.control} name="nationality" render={({ field }) => (<FormItem><FormLabel>Nacionalidade</FormLabel><FormControl><Input placeholder="Brasileiro(a)" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={clientForm.control} name="maritalStatus" render={({ field }) => (<FormItem><FormLabel>Estado Civil</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="solteiro">Solteiro(a)</SelectItem><SelectItem value="casado">Casado(a)</SelectItem><SelectItem value="divorciado">Divorciado(a)</SelectItem><SelectItem value="viuvo">Viúvo(a)</SelectItem><SelectItem value="uniao_estavel">União Estável</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                            </div>
                                            <FormField control={clientForm.control} name="profession" render={({ field }) => (<FormItem><FormLabel>Profissão</FormLabel><FormControl><Input placeholder="Profissão do cliente" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <FormField control={clientForm.control} name="rg" render={({ field }) => (<FormItem><FormLabel>RG</FormLabel><FormControl><Input placeholder="00.000.000-0" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={clientForm.control} name="issuingBody" render={({ field }) => (<FormItem><FormLabel>Órgão Emissor</FormLabel><FormControl><Input placeholder="SSP/SP" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={clientForm.control} name="document" render={({ field }) => (<FormItem><FormLabel>CPF / CNPJ</FormLabel><FormControl><Input placeholder="000.000.000-00" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            </div>

                                            <h3 className="text-lg font-medium text-primary pt-4">Endereço</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <FormField
                                                  control={clientForm.control}
                                                  name="zipCode"
                                                  render={({ field }) => (
                                                  <FormItem>
                                                      <FormLabel>CEP</FormLabel>
                                                      <div className="flex items-center">
                                                          <FormControl>
                                                              <Input placeholder="00000-000" {...field} onBlur={handleCepBlur} />
                                                          </FormControl>
                                                          {isFetchingCep && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                                      </div>
                                                      <FormMessage />
                                                  </FormItem>
                                                  )}
                                                />
                                                <FormField control={clientForm.control} name="street" render={({ field }) => (<FormItem className="col-span-2"><FormLabel>Logradouro</FormLabel><FormControl><Input placeholder="Rua, Avenida, etc." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <FormField control={clientForm.control} name="number" render={({ field }) => (<FormItem><FormLabel>Número</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={clientForm.control} name="neighborhood" render={({ field }) => (<FormItem className="col-span-2"><FormLabel>Bairro</FormLabel><FormControl><Input placeholder="Centro" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField control={clientForm.control} name="city" render={({ field }) => (<FormItem><FormLabel>Cidade</FormLabel><FormControl><Input placeholder="São Paulo" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={clientForm.control} name="state" render={({ field }) => (<FormItem><FormLabel>Estado</FormLabel><FormControl><Input placeholder="SP" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            </div>
                                            <DialogFooter className="pt-4">
                                                <Button type="submit" disabled={isSubmittingClient}>
                                                    {isSubmittingClient && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Salvar Cliente
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={processForm.control}
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
                control={processForm.control}
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

            <Card className="bg-background/50">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                        <Gavel className="mr-3 h-5 w-5 text-accent" />
                        Informações do Juízo
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={processForm.control}
                            name="justiceType"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Área do Direito</FormLabel>
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
                            control={processForm.control}
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
                            control={processForm.control}
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
                        <FormField
                            control={processForm.control}
                            name="judge"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Juiz(a) (Opcional)</FormLabel>
                                <FormControl>
                                <Input placeholder="Nome do(a) magistrado(a)" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>
            
            <Card className="bg-background/50">
                <CardHeader>
                     <CardTitle className="text-lg flex items-center">
                        <DollarSign className="mr-3 h-5 w-5 text-accent" />
                        Detalhes da Ação
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <FormField
                            control={processForm.control}
                            name="actionType"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Classe (Tipo de Ação)</FormLabel>
                                <FormControl>
                                <Input placeholder="Ex: Execução Fiscal" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={processForm.control}
                            name="subject"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Assunto</FormLabel>
                                <FormControl>
                                <Input placeholder="Ex: Dívida Ativa" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                        control={processForm.control}
                        name="actionValue"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Valor da Ação (Opcional)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="1500.00" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card className="bg-background/50">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                        <Users className="mr-3 h-5 w-5 text-accent" />
                        Partes Envolvidas e Representação
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Plaintiff section */}
                        <div className="space-y-2">
                           <FormField
                                control={processForm.control}
                                name="plaintiffs"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Autor(es)</FormLabel>
                                        <div className="flex gap-2">
                                            <Input
                                                value={currentPlaintiff}
                                                onChange={(e) => setCurrentPlaintiff(e.target.value)}
                                                placeholder="Nome da parte autora"
                                            />
                                            <Button type="button" size="icon" onClick={handleAddPlaintiff}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                           />
                           <div className="space-y-2 pt-2">
                                {plaintiffsList.map((plaintiff, index) => (
                                    <Badge key={index} variant="secondary" className="flex justify-between items-center text-base">
                                        <span>{plaintiff}</span>
                                        <Button type="button" variant="ghost" size="icon" className="h-5 w-5 ml-2" onClick={() => handleRemovePlaintiff(index)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </Badge>
                                ))}
                           </div>
                        </div>

                        {/* Defendant section */}
                        <div className="space-y-2">
                           <FormField
                                control={processForm.control}
                                name="defendants"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Réu(s)</FormLabel>
                                        <div className="flex gap-2">
                                            <Input
                                                value={currentDefendant}
                                                onChange={(e) => setCurrentDefendant(e.target.value)}
                                                placeholder="Nome da parte ré"
                                            />
                                            <Button type="button" size="icon" onClick={handleAddDefendant}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                           />
                           <div className="space-y-2 pt-2">
                                {defendantsList.map((defendant, index) => (
                                    <Badge key={index} variant="secondary" className="flex justify-between items-center text-base">
                                        <span>{defendant}</span>
                                        <Button type="button" variant="ghost" size="icon" className="h-5 w-5 ml-2" onClick={() => handleRemoveDefendant(index)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </Badge>
                                ))}
                           </div>
                        </div>

                    </div>
                     <FormField
                        control={processForm.control}
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
                                    Pelo Autor (Exequente)
                                    </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="defendant" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    Pelo Réu (Executado)
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
            
             <FormField
              control={processForm.control}
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
