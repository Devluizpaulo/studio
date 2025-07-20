import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-headline text-2xl font-semibold text-accent">RGMJ Law Firm</h3>
            <p className="mt-4 text-primary-foreground/80">
              Your trusted partner in navigating the complexities of the legal world.
            </p>
          </div>
          <div>
            <h3 className="font-headline text-xl font-semibold">Contact Us</h3>
            <ul className="mt-4 space-y-2 text-primary-foreground/80">
              <li className="flex items-center">
                <Mail className="mr-3 h-5 w-5 text-accent" />
                <span>contact@rgmjlaw.com</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-3 h-5 w-5 text-accent" />
                <span>(123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <MapPin className="mr-3 h-5 w-5 text-accent" />
                <span>123 Legal Ave, Justice City, USA</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline text-xl font-semibold">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/#about" className="text-primary-foreground/80 hover:text-accent">About Us</Link></li>
              <li><Link href="/#practice-areas" className="text-primary-foreground/80 hover:text-accent">Practice Areas</Link></li>
              <li><Link href="/summarize" className="text-primary-foreground/80 hover:text-accent">AI Summary Tool</Link></li>
              <li><Link href="/#contact" className="text-primary-foreground/80 hover:text-accent">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-primary-foreground/20 pt-8 text-center text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} RGMJ Law Firm. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
