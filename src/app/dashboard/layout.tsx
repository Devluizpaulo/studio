import Header from "./Header";
import { SidebarNav } from "./SidebarNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="flex h-screen overflow-hidden">
        <SidebarNav />
        <main className="flex-1 overflow-y-auto overflow-x-hidden pt-16">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </>
  );
}
