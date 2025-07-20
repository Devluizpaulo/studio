import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Gavel, Scale, ShieldCheck, Briefcase, Landmark, Users, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const practiceAreas = [
  {
    icon: <Gavel className="h-10 w-10 text-accent" />,
    title: "Criminal Law",
    description: "Expert defense for a wide range of criminal charges, ensuring your rights are protected.",
  },
  {
    icon: <Scale className="h-10 w-10 text-accent" />,
    title: "Civil Litigation",
    description: "Representing clients in complex disputes, from business conflicts to personal injury claims.",
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-accent" />,
    title: "Insurance Defense",
    description: "Decades of experience defending insurers and their policyholders against claims.",
  },
  {
    icon: <Briefcase className="h-10 w-10 text-accent" />,
    title: "Corporate Law",
    description: "Comprehensive legal solutions for businesses, from formation to mergers and acquisitions.",
  },
  {
    icon: <Landmark className="h-10 w-10 text-accent" />,
    title: "Real Estate",
    description: "Handling all aspects of real estate transactions and litigation with precision and care.",
  },
  {
    icon: <Users className="h-10 w-10 text-accent" />,
    title: "Family Law",
    description: "Compassionate and skilled guidance through sensitive family matters.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="bg-primary/5 py-24 sm:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-6xl">
            Excellence in Legal Representation
          </h1>
          <p className="mt-6 text-lg leading-8 text-foreground/80">
            RGMJ delivers unparalleled legal expertise with a commitment to integrity and client success.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
              <Link href="/summarize">
                Try Our AI Legal Summary Tool
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#contact">Request a Consultation</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="about" className="py-24 sm:py-32">
        <div className="container mx-auto grid grid-cols-1 gap-12 px-4 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">About RGMJ</h2>
            <p className="mt-6 text-lg leading-relaxed text-foreground/80">
              Founded on the principles of justice, integrity, and relentless advocacy, RGMJ has grown into one of the most respected law firms in the region. Our mission is to provide our clients with innovative legal solutions and a steadfast commitment to achieving their goals. We combine traditional legal wisdom with modern technology to navigate the complexities of the law.
            </p>
          </div>
          <div className="h-80 w-full overflow-hidden rounded-lg shadow-xl">
             <Image
                src="https://placehold.co/600x400.png"
                alt="RGMJ Law Firm Office"
                width={600}
                height={400}
                className="h-full w-full object-cover"
                data-ai-hint="law office"
              />
          </div>
        </div>
      </section>

      <section id="practice-areas" className="bg-primary/5 py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">Our Practice Areas</h2>
            <p className="mt-6 text-lg leading-8 text-foreground/80">
              We offer a wide range of legal services, providing expert counsel and representation in various fields of law.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {practiceAreas.map((area) => (
              <Card key={area.title} className="transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                <CardHeader className="items-center">
                  {area.icon}
                  <CardTitle className="font-headline text-2xl">{area.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-foreground/70">{area.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 sm:py-32">
        <div className="container mx-auto px-4">
           <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">Get In Touch</h2>
            <p className="mt-6 text-lg leading-8 text-foreground/80">
              Have a legal question or need to schedule a consultation? Fill out the form below and we'll get back to you promptly.
            </p>
          </div>
          <Card className="mx-auto mt-16 max-w-xl">
            <CardContent className="p-8">
              <form className="space-y-6">
                <Input placeholder="Your Name" />
                <Input type="email" placeholder="Your Email" />
                <Textarea placeholder="Your Message" rows={6} />
                <Button type="submit" className="w-full" size="lg" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>Send Inquiry</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
