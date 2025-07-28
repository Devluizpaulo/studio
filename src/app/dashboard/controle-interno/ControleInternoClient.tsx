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
import { BellRing, Check, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PendingAudience extends DocumentData {
  id: string;
  title: string;
  date: any;
  processNumber: string;
  clientName: string;
  status: string;
}

export function ControleInternoClient() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [pendingAudiences, setPendingAudiences] = useState<PendingAudience[]>([])
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
                if (userData.role !== 'master' && userData.role !== 'secretary') {
                    router.push('/dashboard');
                    return;
                }
                const officeId = userData.officeId;

                const q = query(
                    collection(db, 'events'), 
                    where('officeId', '==', officeId),
                    where('type', '==', 'audiencia'),
                    where('status', '==', 'pendente')
                );

                const unsubscribeAudiences = onSnapshot(q, async (snapshot) => {
                    const audiencesData: PendingAudience[] = [];
                    for(const eventDoc of snapshot.docs) {
                        const eventData = eventDoc.data();
                        let processData: DocumentData = {};
                        if (eventData.processId) {
                            const processDoc = await onSnapshot(doc(db, 'processes', eventData.processId), (doc) => {
                                if (doc.exists()) {
                                    processData = doc.data();
                                }
                            });
                        }
                        audiencesData.push({
                            id: eventDoc.id,
                            title: eventData.title,
                            date: eventData.date.toDate(),
                            status: eventData.status,
                            processNumber: processData.processNumber || 'N/A',
                            clientName: processData.clientName || 'Sem cliente vinculado',
                        });
                    };
                    setPendingAudiences(audiencesData.sort((a,b) => a.date - b.date));
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching pending audiences:", error);
                    setLoading(false);
                });
                return () => unsubscribeAudiences();
            } else {
                router.push('/login');
            }
        });
        return () => unsubscribeUser();
    }
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-64" />
            </div>
             <Skeleton className="h-80 w-full" />
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Controle Interno</h2>
        <p className="text-muted-foreground">Gerencie as tarefas administrativas do escritório.</p>
      </div>

       <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
             <BellRing className="mr-3 h-5 w-5 text-accent" />
            Audiências Pendentes de Confirmação
          </CardTitle>
           <CardDescription>
            Lembre-se de contatar o cliente para confirmar a presença na audiência.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {pendingAudiences.length > 0 ? (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Data da Audiência</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Processo</TableHead>
                        <TableHead className="text-center">Ação</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {pendingAudiences.map((audience) => (
                        <TableRow key={audience.id}>
                            <TableCell className="font-medium">{format(audience.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</TableCell>
                            <TableCell>{audience.title}</TableCell>
                            <TableCell>{audience.clientName}</TableCell>
                            <TableCell>{audience.processNumber}</TableCell>
                            <TableCell className="text-center">
                                <Button variant="outline" size="sm" disabled>
                                    <Check className="mr-2 h-4 w-4"/>
                                    Confirmar
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
           ) : (
             <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <Clock className="h-16 w-16 mb-4" />
                <h3 className="text-xl font-semibold text-foreground">Nenhuma audiência pendente</h3>
                <p className="mt-2">Todas as audiências foram confirmadas ou não há nenhuma agendada.</p>
            </div>
           )}
        </CardContent>
      </Card>

    </div>
  )
}
