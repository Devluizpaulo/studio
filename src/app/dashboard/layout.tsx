import { SidebarNav } from "./SidebarNav";

const sidebarNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Agenda",
      href: "/dashboard/agenda",
    },
    {
        title: "Processos",
        href: "/dashboard/processos",
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
                <div className="flex-1">{children}</div>
            </div>
        </div>
    )
}
