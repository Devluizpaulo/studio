import Header from "./Header";
import { SidebarNav } from "./SidebarNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-muted/40">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
         <footer className="border-t border-border bg-background/95 p-4 text-center text-xs text-muted-foreground">
            <span>Versão 1.0.0 | Desenvolvido por </span>
            <a
              href="https://fenixsb.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent hover:underline"
            >
              Fênix Solutions & Build
            </a>
          </footer>
      </div>
    </div>
  );
}
