"use server";

import { z } from "zod";
import { summarizeLegalBrief } from "@/ai/flows/summarize-legal-brief";
import DocxParser from "docx-parser";

const SummarizeLegalBriefInputSchema = z.object({
  documentText: z.string(),
  tone: z.enum(["formal", "informal", "neutral"]),
  focusAreas: z.string(),
});

type SummarizeResult = 
    | { success: true; data: { summary: string } }
    | { success: false; error: string };

export async function summarizeLegalBriefAction(
  input: z.infer<typeof SummarizeLegalBriefInputSchema>
): Promise<SummarizeResult> {
  const parsedInput = SummarizeLegalBriefInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return { success: false, error: "Invalid input." };
  }

  try {
    const output = await summarizeLegalBrief(parsedInput.data);
    return { success: true, data: output };
  } catch (error) {
    console.error("Error summarizing legal brief:", error);
    return { success: false, error: "Failed to generate summary. Please try again." };
  }
}

// --- Action to parse uploaded document ---

type ParseResult = 
    | { success: true; data: string }
    | { success: false; error: string };

export async function parseDocumentAction(formData: FormData): Promise<ParseResult> {
    const file = formData.get('file') as File;

    if (!file) {
        return { success: false, error: "Nenhum arquivo enviado." };
    }

    try {
        const arrayBuffer = await file.arrayBuffer();

        if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            const parser = new DocxParser();
            const result = await new Promise<any>((resolve, reject) => {
                 parser.parse(arrayBuffer, (err: any, result: any) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            return { success: true, data: result.text };
        } else if (file.type === "text/plain" || file.type === "text/markdown") {
            const text = Buffer.from(arrayBuffer).toString('utf-8');
            return { success: true, data: text };
        } else {
            return { success: false, error: "Tipo de arquivo não suportado." };
        }

    } catch (error) {
        console.error("Error parsing document on server:", error);
        return { success: false, error: "Falha ao ler o conteúdo do arquivo." };
    }
}