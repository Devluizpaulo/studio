"use server"

import { db } from "@/lib/firebase-admin";

type ClientDetails = {
    client: any;
    processes: any[];
    financialTasks: any[];
    events: any[];
}

type GetResult = 
    | { success: true, data: ClientDetails }
    | { success: false, error: string };

export async function getClientDetailsAction(clientId: string, officeId: string): Promise<GetResult> {
    if (!db) {
        return { success: false, error: "Serviço de banco de dados indisponível." };
    }
    if (!clientId || !officeId) {
        return { success: false, error: "ID do cliente ou do escritório não fornecido." };
    }

    try {
        const clientRef = db.collection("clients").doc(clientId);
        const clientSnap = await clientRef.get();

        if (!clientSnap.exists || clientSnap.data()?.officeId !== officeId) {
            return { success: false, error: "Cliente não encontrado ou não pertence a este escritório." };
        }

        const clientData = { id: clientSnap.id, ...clientSnap.data() };

        // Fetch related data in parallel
        const processesQuery = db.collection("processes").where("clientId", "==", clientId).get();
        const financialTasksQuery = db.collection("financial_tasks").where("clientId", "==", clientId).get();
        const eventsQuery = db.collection("events").where("clientId", "==", clientId).get();
        
        const [processesSnap, financialTasksSnap, eventsSnap] = await Promise.all([
            processesQuery,
            financialTasksQuery,
            eventsQuery
        ]);

        const processes = processesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const financialTasks = financialTasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return {
            success: true,
            data: {
                client: clientData,
                processes,
                financialTasks,
                events,
            }
        };

    } catch (error) {
        console.error("Erro ao buscar detalhes do cliente:", error);
        return { success: false, error: "Falha ao carregar os dados completos do cliente." };
    }
}
