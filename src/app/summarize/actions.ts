"use server";

import { z } from "zod";
import { summarizeLegalBrief } from "@/ai/flows/summarize-legal-brief";

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
