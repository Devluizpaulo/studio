
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { DocumentData } from "firebase/firestore";

export interface Process extends DocumentData {
    id: string;
    clientName: string;
    processNumber: string;
    actionType: string;
    status: "active" | "pending" | "archived";
}

interface ProcessListProps {
  processes: Process[];
}

const statusVariantMap = {
    active: "default",
    pending: "secondary",
    archived: "outline",
} as const;

const statusTextMap = {
    active: "Em Andamento",
    pending: "Aguardando",
    archived: "Arquivado",
}

export function ProcessList({ processes }: ProcessListProps) {
  if (processes.length === 0) {
    return (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground">Nenhum processo cadastrado</h3>
            <p className="text-muted-foreground mt-2">Comece adicionando seu primeiro processo no botão "Novo Processo".</p>
        </Card>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número do Processo</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Tipo de Ação</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {processes.map((process) => (
            <TableRow key={process.id}>
              <TableCell className="font-medium">{process.processNumber}</TableCell>
              <TableCell>{process.clientName}</TableCell>
              <TableCell>{process.actionType}</TableCell>
              <TableCell className="text-center">
                 <Badge variant={statusVariantMap[process.status] || 'default'}>
                    {statusTextMap[process.status] || process.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
