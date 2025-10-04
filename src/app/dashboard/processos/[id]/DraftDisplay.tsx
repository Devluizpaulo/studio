"use client"

import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface DraftDisplayProps {
    draftContent: string;
    isDrafting: boolean;
}

export function DraftDisplay({ draftContent, isDrafting }: DraftDisplayProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Rascunho Gerado</h3>
            <div className="w-full h-[500px] bg-muted/50 rounded-md p-4 overflow-y-auto">
                {isDrafting && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-accent" />
                        <p className="mt-4 text-muted-foreground">Aguarde, a IA está redigindo a petição...</p>
                    </div>
                )}
                {draftContent ? (
                    <Textarea
                        readOnly
                        value={draftContent}
                        className="w-full h-full text-base whitespace-pre-wrap bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                    />
                ) : (
                    !isDrafting && <p className="text-center text-muted-foreground pt-20">O rascunho da sua petição aparecerá aqui.</p>
                )}
            </div>
        </div>
    );
}
