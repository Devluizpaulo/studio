"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

import { Skeleton } from '@/components/ui/skeleton'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ProcessList, Process } from '../ProcessList'

export function ProcessosClient() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [processes, setProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string|null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (userDoc) => {
             if(userDoc.exists()) {
                const userData = userDoc.data();
                setUserRole(userData.role);
                const officeId = userData.officeId;
                if (!officeId) {
                    setLoading(false);
                    return;
                }
                let q;

                if (userData.role === 'master' || userData.role === 'secretary') {
                    // Master and Secretary see all processes in the office
                    q = query(collection(db, 'processes'), where('officeId', '==', officeId));
                } else {
                    // Regular lawyer sees processes they are part of
                    q = query(collection(db, 'processes'), where('collaboratorIds', 'array-contains', user.uid));
                }

                const unsubscribeProcesses = onSnapshot(
                    q,
                    (snapshot) => {
                    const processesData: Process[] = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as Process[]
                    setProcesses(processesData)
                    setLoading(false)
                    },
                    (error) => {
                    console.error('Error fetching processes:', error)
                    setLoading(false)
                    }
                )
                return () => unsubscribeProcesses();
             } else {
                 setLoading(false);
             }
        })
        return () => unsubscribeUser();
    }
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Meus Processos</h2>
            <p className="text-muted-foreground">Gerencie todos os seus casos em um só lugar.</p>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div/>
         {userRole !== 'secretary' && (
            <Button asChild>
                <Link href="/dashboard/processos/novo">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Novo Processo
                </Link>
            </Button>
         )}
      </div>
      
      <ProcessList processes={processes} />
    </div>
  )
}
