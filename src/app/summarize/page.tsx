import { SummarizeForm } from "./SummarizeForm";

export default function SummarizePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          AI-Powered Legal Summary Tool
        </h1>
        <p className="mt-6 text-lg leading-8 text-foreground/80">
          Streamline your case preparation. Upload a legal brief, and our AI will generate a concise summary tailored to your needs. Specify the tone and focus areas to get a personalized draft for clients or opposing counsel.
        </p>
      </div>
      <SummarizeForm />
    </div>
  );
}
