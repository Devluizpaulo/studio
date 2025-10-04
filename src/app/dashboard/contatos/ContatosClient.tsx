"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { collection, query, where, onSnapshot, DocumentData, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Mail } from 'lucide-react'


interface ContactRequest extends DocumentData {
  id: string
  name: string
  email: string
  phone: string
  message: string
  createdAt: any
}

export function ContatosClient() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [requests, setRequests] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                const officeId = userData.officeId;

                if (!officeId) {
                  setLoading(false);
                  return;
                }

                const q = query(collection(db, 'contact_requests'), where('officeId', '==', officeId));
                const unsubscribeRequests = onSnapshot(q, (snapshot) => {
                    const requestsData: ContactRequest[] = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as ContactRequest[];
                    setRequests(requestsData.sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching contact requests:", error);
                    setLoading(false);
                });
                return () => unsubscribeRequests();
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribeUser();
    }
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
        <div className="space-y-4">
             <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">
                    Contatos Recebidos do Site
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Gerencie os pedidos de contato enviados através do seu site.
                </p>
            </div>
            <Skeleton className="h-80 w-full" />
        </div>
    )
  }

  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">
                Contatos Recebidos do Site
            </h1>
            <p className="mt-2 text-muted-foreground">
                Gerencie os pedidos de contato enviados através do seu site.
            </p>
        </div>

       <Card>
        <CardHeader>
            <CardTitle className="flex items-center">
                <Mail className="mr-3 h-5 w-5 text-accent" />
                Caixa de Entrada
            </CardTitle>
            <CardDescription>
                {requests.length > 0 ? `Você tem ${requests.length} mensagem(ns) não lida(s).` : 'Nenhuma mensagem recebida ainda.'}
            </CardDescription>
        </CardHeader>
        <CardContent>
           {requests.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                    {requests.map((req) => (
                        <AccordionItem value={req.id} key={req.id}>
                            <AccordionTrigger>
                                <div className="flex justify-between w-full pr-4">
                                    <span className="font-semibold">{req.name}</span>
                                    <span className="text-muted-foreground text-sm">{format(req.createdAt.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="p-4 bg-muted/50 rounded-md">
                                    <p className="font-semibold">Email: <span className="font-normal text-accent">{req.email}</span></p>
                                    <p className="font-semibold">Telefone: <span className="font-normal">{req.phone}</span></p>
                                    <p className="mt-4 text-base whitespace-pre-wrap">{req.message}</p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
           ) : (
             <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <Mail className="h-16 w-16 mb-4" />
                <h3 className="text-xl font-semibold text-foreground">Sua caixa de entrada está vazia</h3>
                <p className="mt-2">Novos contatos do site aparecerão aqui.</p>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  )
}
