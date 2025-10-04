"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { summarizeLegalBriefAction, parseDocumentAction } from "./actions";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, Sparkles, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  documentText: z.string().min(100, "Document text must be at least 100 characters."),
  tone: z.enum(["formal", "informal", "neutral"]),
  focusAreas: z.string().min(3, "Please specify at least one focus area."),
});

type FormValues = z.infer<typeof formSchema>;

export function SummarizeForm() {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentText: "",
      tone: "formal",
      focusAreas: "Key arguments, precedents cited, and conclusion.",
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    toast({
        title: "Processando arquivo...",
        description: `Aguarde enquanto lemos o arquivo ${file.name}.`,
    });

    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const result = await parseDocumentAction(formData);

        if (result.success && result.data) {
            form.setValue("documentText", result.data);
            toast({
                title: "Arquivo Carregado",
                description: `${file.name} foi processado e o texto inserido no campo abaixo.`,
            });
        } else {
             toast({
                title: "Erro ao Processar Arquivo",
                description: result.error || "Não foi possível ler o conteúdo do arquivo.",
                variant: "destructive"
            });
        }

    } catch (error: any) {
        console.error("Error parsing file:", error);
        toast({
            title: "Erro Inesperado",
            description: "Ocorreu um erro ao processar o arquivo.",
            variant: "destructive"
        });
    } finally {
        setIsParsing(false);
        // Clear the file input
        event.target.value = '';
    }
  };

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setSummary(null);
    const result = await summarizeLegalBriefAction(values);
    if (result.success && result.data) {
      setSummary(result.data.summary);
      toast({
        title: "Summary Generated!",
        description: "Your legal brief has been successfully summarized.",
        variant: "default",
      })
    } else if (!result.success) {
      toast({
        title: "Error",
        description: result.error || "An unknown error occurred.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <FileText className="mr-3 h-6 w-6 text-accent" />
            Submit Your Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="documentText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Upload or Paste Document</FormLabel>
                    <FormControl>
                      <>
                        <div className="flex flex-col items-center justify-center w-full">
                            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {isParsing ? (
                                        <Loader2 className="w-8 h-8 mb-4 text-accent animate-spin" />
                                    ) : (
                                        <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                    )}
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Clique para enviar</span> ou arraste e solte</p>
                                    <p className="text-xs text-muted-foreground">DOCX, TXT, ou MD (MAX. 5MB)</p>
                                </div>
                                <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".txt,.md,.docx" />
                            </label>
                        </div> 
                        <Textarea
                          placeholder="O texto do seu arquivo aparecerá aqui..."
                          className="min-h-[250px] resize-y"
                          {...field}
                        />
                      </>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Summary Tone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a tone for the summary" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="informal">Informal</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the tone for the generated summary.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="focusAreas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Focus Areas</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., key arguments, precedents" {...field} />
                      </FormControl>
                      <FormDescription>
                        Specific topics to emphasize in the summary.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isLoading || isParsing} size="lg" className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Summary
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {(isLoading || summary) && (
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center">
              <Sparkles className="mr-3 h-6 w-6 text-accent" />
              Generated Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none text-foreground/90">
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
                <p className="ml-4 text-lg">AI is analyzing your document...</p>
              </div>
            )}
            {summary && <p className="whitespace-pre-wrap">{summary}</p>}
          </CardContent>
        </Card>
      )}
    </>
  );
}