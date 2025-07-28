'use server';
/**
 * @fileOverview Um agente de IA para gerar rascunhos de petições com base em uma tese jurídica.
 *
 * - draftPetition - Gera um rascunho de petição alinhado com a estratégia do advogado.
 * - DraftPetitionInput - O tipo de entrada para a função draftPetition.
 * - DraftPetitionOutput - O tipo de retorno para a função draftPetition.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DraftPetitionInputSchema = z.object({
  caseFacts: z.string().describe('Um resumo claro e objetivo dos fatos relevantes do caso.'),
  petitionType: z.string().describe('O tipo específico de petição a ser gerada (ex: "Contestação", "Recurso de Apelação", "Petição Inicial").'),
  legalThesis: z.string().describe('A tese jurídica central ou o principal argumento estratégico que a petição deve desenvolver e defender. Este é o guia mestre para a IA.'),
  toneAndStyle: z.string().describe('Instruções sobre o tom (ex: "formal", "combativo", "conciliador") e o estilo da escrita, incluindo jurisprudências ou doutrinas a serem enfatizadas.'),
  clientInfo: z.string().describe('Informações do cliente (nome, qualificação).'),
  opponentInfo: z.string().describe('Informações da parte contrária (nome, qualificação).'),
});
export type DraftPetitionInput = z.infer<typeof DraftPetitionInputSchema>;

const DraftPetitionOutputSchema = z.object({
  draftContent: z.string().describe('O rascunho completo da petição gerada pela IA, estruturada e pronta para revisão.'),
});
export type DraftPetitionOutput = z.infer<typeof DraftPetitionOutputSchema>;

export async function draftPetition(input: DraftPetitionInput): Promise<DraftPetitionOutput> {
  return draftPetitionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'draftPetitionPrompt',
  input: {schema: DraftPetitionInputSchema},
  output: {schema: DraftPetitionOutputSchema},
  prompt: `Você é um advogado assistente sênior altamente competente. Sua tarefa é elaborar o rascunho de uma petição com base nas diretrizes estratégicas fornecidas pelo advogado responsável.

Sua prioridade máxima é seguir a TESE JURÍDICA definida. Todos os argumentos, fatos e pedidos devem ser construídos para apoiar e provar essa tese. Não desvie da estratégia definida.

Diretrizes para a Petição:

1.  **Tipo de Petição**: {{{petitionType}}}
2.  **Tese Jurídica Central (Guia Mestre)**: {{{legalThesis}}}
3.  **Fatos do Caso**: Utilize estes fatos para construir a narrativa.
    {{{caseFacts}}}
4.  **Tom e Estilo**: Siga estritamente estas instruções de tom e estilo.
    {{{toneAndStyle}}}
5.  **Partes**:
    - Cliente: {{{clientInfo}}}
    - Parte Contrária: {{{opponentInfo}}}

Estruture a petição de forma lógica, com endereçamento, qualificação das partes, exposição dos fatos, fundamentação jurídica (alinhada à tese) e pedidos. Use uma linguagem técnica e persuasiva. Gere apenas o conteúdo do rascunho da petição.
  `,
});

const draftPetitionFlow = ai.defineFlow(
  {
    name: 'draftPetitionFlow',
    inputSchema: DraftPetitionInputSchema,
    outputSchema: DraftPetitionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
