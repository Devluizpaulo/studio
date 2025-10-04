import { ClienteDetailClient } from "./ClienteDetailClient";

export default function ClienteDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="space-y-6">
             <ClienteDetailClient clientId={params.id} />
        </div>
    )
}
