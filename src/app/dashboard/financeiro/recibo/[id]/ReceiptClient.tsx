"use client"

import { useEffect, useState } from "react";
import { getFinancialTaskDetailsForReceiptAction } from "../../actions";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import numero from 'numero-por-extenso';

type ReceiptData = {
    task: any;
    client: any;
    office: any;
    process?: any;
}

export function ReceiptClient({ receiptId }: { receiptId: string }) {
    const { toast } = useToast();
    const [data, setData] = useState<ReceiptData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReceiptData = async () => {
            setLoading(true);
            const result = await getFinancialTaskDetailsForReceiptAction(receiptId);
            if (result.success) {
                setData(result.data);
            } else {
                toast({
                    title: "Erro ao carregar dados do recibo",
                    description: result.error,
                    variant: "destructive"
                });
            }
            setLoading(false);
        };
        fetchReceiptData();
    }, [receiptId, toast]);

    if (loading) {
        return (
             <div className="flex h-screen items-center justify-center bg-gray-100">
                <Loader2 className="h-12 w-12 animate-spin text-accent"/>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <p className="text-destructive">Não foi possível carregar os dados para este recibo.</p>
            </div>
        )
    }

    const { task, client, office, process } = data;
    const valueInWords = numero.porExtenso(task.value, numero.estilo.monetario);

    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-lg print:shadow-none">
                <header className="flex justify-between items-start pb-8 border-b-2 border-gray-800">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{office.office || 'Escritório de Advocacia'}</h1>
                        <p className="text-sm text-gray-600">Dr(a). {office.fullName}</p>
                        <p className="text-sm text-gray-600">OAB: {office.oab || 'Não informado'}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-bold text-gray-800">RECIBO</h2>
                        <p className="text-lg font-semibold text-gray-600">Nº {task.id.substring(0,8).toUpperCase()}</p>
                    </div>
                </header>

                <section className="my-8">
                    <p className="text-lg leading-relaxed text-gray-700">
                        Recebi de <strong className="font-semibold text-gray-900">{client.fullName}</strong>, 
                        portador(a) do CPF/CNPJ nº <strong className="font-semibold text-gray-900">{client.document}</strong>, 
                        a importância de <strong className="font-semibold text-gray-900">R$ {task.value.toFixed(2)}</strong> 
                        &nbsp;(<span className="italic">{valueInWords}</span>), referente a {task.title.toLowerCase()}.
                    </p>
                    {process && (
                        <p className="mt-4 text-md text-gray-600">
                            Serviços prestados no âmbito do processo nº <strong className="font-semibold">{process.processNumber}</strong>.
                        </p>
                    )}
                </section>

                <section className="my-8">
                     <p className="text-lg text-gray-700">
                        Para clareza, firmo o presente recibo.
                    </p>
                </section>

                <footer className="mt-12 pt-8 text-center">
                    <p className="text-gray-700">
                        {office.city || "Cidade"}, {format(task.paymentDate?.toDate() || new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.
                    </p>
                    <div className="mt-16 border-t-2 border-gray-400 w-80 mx-auto">
                        <p className="mt-2 text-sm font-semibold text-gray-800">{office.fullName}</p>
                        <p className="text-sm text-gray-600">OAB: {office.oab}</p>
                    </div>
                </footer>
            </div>
            
            <div className="max-w-4xl mx-auto mt-6 text-center print:hidden">
                <Button onClick={() => window.print()} size="lg">
                    <Printer className="mr-2 h-5 w-5"/>
                    Imprimir Recibo
                </Button>
            </div>
        </div>
    );
}
