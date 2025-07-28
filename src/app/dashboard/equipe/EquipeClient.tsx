"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { collection, query, where, onSnapshot, DocumentData, getDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { UserPlus, Users, BadgeHelp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface TeamMember extends DocumentData {
  id: string;
  fullName: string;
  email: string;
  oab: string;
  role: 'master' | 'lawyer' | 'secretary';
}

const roleMap = {
    master: 'Admin',
    lawyer: 'Advogado(a)',
    secretary: 'Secretária(o)'
}

export function EquipeClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setCurrentUserRole(userData.role);
          const officeId = userData.officeId;

          if (userData.role !== 'master') {
            // If not master, redirect or show an unauthorized message
            router.push('/dashboard');
            return;
          }

          // Fetch all users from the same office
          const q = query(collection(db, 'users'), where('officeId', '==', officeId));
          const unsubscribeTeam = onSnapshot(q, (snapshot) => {
            const membersData: TeamMember[] = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as TeamMember[];
            setTeamMembers(membersData);
            setLoading(false);
          }, (error) => {
            console.error("Error fetching team members: ", error);
            setLoading(false);
          });

          return () => unsubscribeTeam();
        } else {
            setLoading(false);
        }
      });
      return () => unsubscribeUser();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-10 w-36" />
            </div>
            <Skeleton className="h-80 w-full" />
        </div>
    )
  }
  
  if (currentUserRole !== 'master') {
    return (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
            <BadgeHelp className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-xl font-semibold text-foreground">Acesso Negado</h3>
            <p className="text-muted-foreground mt-2">Você não tem permissão para acessar esta página.</p>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestão de Equipe</h2>
            <p className="text-muted-foreground">Gerencie os membros do seu escritório.</p>
        </div>
        <Button style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
          <UserPlus className="mr-2 h-4 w-4" />
          Convidar Membro
        </Button>
      </div>

       <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
             <Users className="mr-3 h-5 w-5 text-accent" />
            Membros do Escritório
          </CardTitle>
           <CardDescription>
            {teamMembers.length > 0 ? `Seu escritório tem ${teamMembers.length} membro(s).` : 'Nenhum membro na equipe ainda.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
           {teamMembers.length > 0 ? (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Nome Completo</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>OAB</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {teamMembers.map((member) => (
                        <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.fullName}</TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>
                                <Badge variant={member.role === 'master' ? 'default' : 'secondary'}>
                                    {roleMap[member.role] || member.role}
                                </Badge>
                            </TableCell>
                            <TableCell>{member.oab || 'N/A'}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
           ) : (
             <div className="flex flex-col items-center justify-center p-12 text-center">
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground">Nenhum membro na equipe</h3>
                <p className="text-muted-foreground mt-2">Comece convidando o primeiro membro do seu escritório.</p>
            </div>
           )}
        </CardContent>
      </Card>

    </div>
  )
}
