'use server';

import {z} from 'zod';
import {db} from '@/lib/firebase-admin';
import {FieldValue} from 'firebase-admin/firestore';

const createClientSchema = z.object({
  fullName: z.string().min(3, "O nome completo é obrigatório."),
  email: z.string().email("Por favor, insira um e-mail válido."),
  phone: z.string().min(10, "O telefone deve ter no mínimo 10 dígitos."),
  nationality: z.string().min(3, "A nacionalidade é obrigatória."),
  maritalStatus: z.enum(["solteiro", "casado", "divorciado", "viuvo", "uniao_estavel"]),
  profession: z.string().min(3, "A profissão é obrigatória."),
  rg: z.string().min(5, "O RG é obrigatório."),
  issuingBody: z.string().min(2, "O órgão emissor é obrigatório."),
  document: z.string().min(11, "O CPF/CNPJ é obrigatório."),
  street: z.string().min(3, "O logradouro é obrigatório."),
  number: z.string().min(1, "O número é obrigatório."),
  neighborhood: z.string().min(3, "O bairro é obrigatório."),
  city: z.string().min(3, "A cidade é obrigatória."),
  state: z.string().min(2, "O estado é obrigatório."),
  zipCode: z.string().min(8, "O CEP é obrigatório."),
  lawyerId: z.string(), // ID of the lawyer creating the client
});

type Result =
  | {success: true; data: {clientId: string}}
  | {success: false; error: string};

export async function createClientAction(
  input: z.infer<typeof createClientSchema>
): Promise<Result> {
  const parsedInput = createClientSchema.safeParse(input);

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
    const {lawyerId, ...clientData} = parsedInput.data;

    // Get user's officeId
    const userDocRef = db.collection('users').doc(lawyerId);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      return {success: false, error: 'Usuário não encontrado.'};
    }
    const officeId = userDoc.data()?.officeId;
    if (!officeId) {
      return {success: false, error: 'Escritório do usuário não encontrado.'};
    }
    
    // Combine address fields into a single string for backwards compatibility or specific views
    const addressString = `${clientData.street}, ${clientData.number} - ${clientData.neighborhood}, ${clientData.city} - ${clientData.state}, ${clientData.zipCode}`;

    const docRef = await db.collection('clients').add({
      ...clientData,
      address: addressString,
      createdBy: lawyerId,
      officeId: officeId, // Associate client with the office
      createdAt: FieldValue.serverTimestamp(),
    });

    return {success: true, data: {clientId: docRef.id}};
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return {
      success: false,
      error: 'Falha ao criar cliente. Tente novamente.',
    };
  }
}
