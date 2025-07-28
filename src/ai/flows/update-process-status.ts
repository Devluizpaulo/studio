'use server';
/**
 * @fileOverview Um agente de IA para simular a atualização do andamento de um processo judicial.
 * 
 * - updateProcessStatus - Simula a busca por um novo andamento para um processo judicial.
 * - UpdateProcessStatusInput - O tipo de entrada para a função updateProcessStatus.
 * - UpdateProcessStatusOutput - O tipo de retorno para a função updateProcessStatus.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UpdateProcessStatusInputSchema = z.object({
  processNumber: z.string().describe('O número do processo.'),
  court: z.string().describe('A vara e comarca do processo.'),
  currentStatus: z.string().describe('O status atual do processo.'),
  lastUpdate: z.string().describe('A descrição do último andamento registrado.'),
});
export type UpdateProcessStatusInput = z.infer<typeof UpdateProcessStatusInputSchema>;

const UpdateProcessStatusOutputSchema = z.object({
    date: z.string().describe('A data do novo andamento no formato ISO 8601.'),
    description: z.string().describe('Uma descrição curta e objetiva do novo andamento (ex: "Juntada de Petição", "Ato Ordinatório Praticado").'),
    details: z.string().describe('O texto completo ou os detalhes do novo andamento, conforme seria exibido no sistema do tribunal.'),
});
export type UpdateProcessStatusOutput = z.infer<typeof UpdateProcessStatusOutputSchema>;

export async function updateProcessStatus(input: UpdateProcessStatusInput): Promise<UpdateProcessStatusOutput> {
  return updateProcessStatusFlow(input);
}

const prompt = ai.definePrompt({
  name: 'updateProcessStatusPrompt',
  input: {schema: UpdateProcessStatusInputSchema},
  output: {schema: UpdateProcessStatusOutputSchema},
  prompt: `Você é um sistema simulador de tribunal de justiça. Sua tarefa é gerar o próximo andamento processual *realista* para um processo judicial, com base nas informações fornecidas.

Processo: {{{processNumber}}}
Tribunal: {{{court}}}
Status Atual: {{{currentStatus}}}
Último Andamento: "{{{lastUpdate}}}"

Gere o próximo andamento que faria sentido no fluxo de um processo judicial. A data deve ser um ou dois dias após a data atual. A descrição deve ser curta e técnica, e os detalhes devem ser um texto típico de publicações oficiais.

Seja criativo e tecnicamente preciso dentro do jargão jurídico brasileiro. Não repita o último andamento. Crie uma progressão lógica. Por exemplo, se o último andamento foi uma "Conclusão para Despacho", o próximo poderia ser um "Despacho de Mero Expediente". Se foi uma "Juntada de Petição", o próximo pode ser uma "Conclusão para Decisão".

Gere apenas o próximo andamento.
  `,
});

const updateProcessStatusFlow = ai.defineFlow(
  {
    name: 'updateProcessStatusFlow',
    inputSchema: UpdateProcessStatusInputSchema,
    outputSchema: UpdateProcessStatusOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    