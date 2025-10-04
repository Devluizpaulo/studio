"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const petitionFormSchema = z.object({
    petitionType: z.string().min(3, "O tipo de petição é obrigatório."),
    legalThesis: z.string().min(20, "A tese jurídica deve ter pelo menos 20 caracteres."),
    toneAndStyle: z.string().min(10, "Descreva o tom e estilo desejado."),
});

export type PetitionFormValues = z.infer<typeof petitionFormSchema>;

interface PetitionGeneratorProps {
    representation: 'plaintiff' | 'defendant';
    isDrafting: boolean;
    onDraftPetition: (values: PetitionFormValues) => void;
}

export function PetitionGenerator({ representation, isDrafting, onDraftPetition }: PetitionGeneratorProps) {
    const form = useForm<PetitionFormValues>({
        resolver: zodResolver(petitionFormSchema),
        defaultValues: {
            petitionType: representation === 'plaintiff' ? "Petição Inicial" : "Contestação",
            legalThesis: "",
            toneAndStyle: "Tom formal e combativo. Citar jurisprudência relevante do TJSP.",
        }
    });
    
    useEffect(() => {
        form.reset({
            petitionType: representation === 'plaintiff' ? "Petição Inicial" : "Contestação",
            legalThesis: "",
            toneAndStyle: "Tom formal e combativo. Citar jurisprudência relevante do TJSP.",
        })
    }, [representation, form]);


    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-primary">Diretrizes para a IA</h3>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onDraftPetition)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="petitionType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Petição</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Contestação, Recurso de Apelação" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="legalThesis"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tese Jurídica Central</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Qual é o principal argumento que a petição deve defender? Ex: 'A prescrição do débito impede a cobrança...'" {...field} className="min-h-[100px]" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="toneAndStyle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tom e Estilo da Escrita</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Ex: 'Tom formal e combativo. Citar jurisprudência do TJSP sobre o tema...'" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isDrafting} className="w-full" size="lg">
                        {isDrafting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Gerar Rascunho com IA
                    </Button>
                </form>
            </Form>
        </div>
    );
}
