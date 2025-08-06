import { SidebarNav } from "./SidebarNav";

const sidebarNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Processos",
      href: "/dashboard/processos",
    },
    {
      title: "Agenda",
      href: "/dashboard/agenda",
    },
    {
        title: "Clientes",
        href: "/dashboard/clientes",
    },
    {
      title: "Financeiro",
      href: "/dashboard/financeiro",
      role: ["master", "secretary"],
    },
     {
      title: "Controle Interno",
      href: "/dashboard/controle-interno",
      role: ["master", "secretary"],
    },
    {
      title: "Documentos",
      href: "/dashboard/documentos",
      role: "master"
    },
    {
      title: "Equipe",
      href: "/dashboard/equipe",
      role: "master"
    },
    {
      title: "Meu Perfil",
      href: "/dashboard/perfil",
    },
    {
      title: "Configurações",
      href: "/dashboard/configuracoes",
      role: "master"
    }
  ]

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/5">
                    <SidebarNav items={sidebarNavItems} />
                </aside>
                <div className="flex-1 min-w-0">{children}</div>
            </div>
        </div>
    )
}
