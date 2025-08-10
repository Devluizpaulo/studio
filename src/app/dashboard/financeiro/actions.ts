'use server';

import {z} from 'zod';
import {db} from '@/lib/firebase-admin';
import {FieldValue} from 'firebase-admin/firestore';

const createFinancialTaskSchema = z.object({
  title: z.string().min(3, 'O título é obrigatório.'),
  processId: z.string().optional(),
  processNumber: z.string().optional(),
  clientId: z.string().optional(),
  type: z.enum(['honorarios', 'custas', 'reembolso', 'guia', 'outro']),
  dueDate: z.date(),
  value: z.number(),
  status: z.enum(['pendente', 'pago']),
  officeId: z.string(),
  createdBy: z.string(),
});

type Result =
  | {success: true; data: {taskId: string}}
  | {success: false; error: string};

export async function createFinancialTaskAction(
  input: z.infer<typeof createFinancialTaskSchema>
): Promise<Result> {
  const parsedInput = createFinancialTaskSchema.safeParse(input);

  if (!parsedInput.success) {
    return {success: false, error: 'Input inválido.'};
  }

  if (!db) {
    return {
      success: false,
      error: 'O serviço de banco de dados não está disponível.',
    };
  }

  try {
    const {...taskData} = parsedInput.data;

    const docRef = await db.collection('financial_tasks').add({
      ...taskData,
      createdAt: FieldValue.serverTimestamp(),
    });

    return {success: true, data: {taskId: docRef.id}};
  } catch (error) {
    console.error('Erro ao criar tarefa financeira:', error);
    return {success: false, error: 'Falha ao criar tarefa. Tente novamente.'};
  }
}

// --- Update Financial Task Status ---
const updateStatusSchema = z.object({
  taskId: z.string(),
  status: z.enum(['pendente', 'pago']),
});

type UpdateResult = {success: true} | {success: false; error: string};

export async function updateFinancialTaskStatusAction(
  input: z.infer<typeof updateStatusSchema>
): Promise<UpdateResult> {
  const parsedInput = updateStatusSchema.safeParse(input);
  if (!parsedInput.success) {
    return {success: false, error: 'Input inválido.'};
  }
  if (!db) {
    return {
      success: false,
      error: 'O serviço de banco de dados não está disponível.',
    };
  }
  try {
    const {taskId, status} = parsedInput.data;
    const taskRef = db.collection('financial_tasks').doc(taskId);
    await taskRef.update({
      status: status,
      paymentDate: status === 'pago' ? FieldValue.serverTimestamp() : FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return {success: true};
  } catch (error) {
    console.error('Erro ao atualizar status da tarefa:', error);
    return {success: false, error: 'Falha ao atualizar o status.'};
  }
}


// --- Get Financial Task Details for Receipt ---
type ReceiptDetails = {
    task: any;
    client: any;
    office: any;
    process?: any;
};

type GetReceiptResult = 
    | { success: true, data: ReceiptDetails }
    | { success: false, error: string };

export async function getFinancialTaskDetailsForReceiptAction(taskId: string): Promise<GetReceiptResult> {
    if (!db) {
        return { success: false, error: 'O serviço de banco de dados não está disponível.'};
    }
    if (!taskId) {
        return { success: false, error: 'ID do lançamento não fornecido.' };
    }

    try {
        const taskRef = db.collection('financial_tasks').doc(taskId);
        const taskSnap = await taskRef.get();

        if (!taskSnap.exists) {
            return { success: false, error: 'Lançamento financeiro não encontrado.' };
        }
        const taskData = taskSnap.data()!;

        if (!taskData.clientId) {
            return { success: false, error: 'Este lançamento não está vinculado a um cliente.' };
        }

        const clientRef = db.collection('clients').doc(taskData.clientId);
        const clientSnap = await clientRef.get();
        if (!clientSnap.exists) {
            return { success: false, error: 'Cliente não encontrado.' };
        }
        const clientData = clientSnap.data()!;


        const officeRef = db.collection('offices').doc(taskData.officeId);
        const officeSnap = await officeRef.get();
        if (!officeSnap.exists) {
            return { success: false, error: 'Escritório não encontrado.' };
        }
        const officeData = officeSnap.data()!;
        
        // Fetch owner details for office contact info
        const ownerRef = db.collection('users').doc(officeData.ownerId);
        const ownerSnap = await ownerRef.get();
        const ownerData = ownerSnap.exists() ? ownerSnap.data() : {};


        let processData = undefined;
        if (taskData.processId) {
            const processRef = db.collection('processes').doc(taskData.processId);
            const processSnap = await processRef.get();
            if (processSnap.exists) {
                processData = processSnap.data();
            }
        }
        
        return {
            success: true,
            data: {
                task: { id: taskSnap.id, ...taskData },
                client: { id: clientSnap.id, ...clientData },
                office: { id: officeSnap.id, ...officeData, ...ownerData },
                process: processData ? { ...processData } : undefined
            }
        };

    } catch (error) {
        console.error('Erro ao buscar detalhes para o recibo:', error);
        return { success: false, error: 'Falha ao carregar os dados do recibo.' };
    }
}
    