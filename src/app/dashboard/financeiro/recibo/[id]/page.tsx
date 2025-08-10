import { ReceiptClient } from "./ReceiptClient";

export default function ReceiptPage({ params }: { params: { id: string } }) {
    return <ReceiptClient receiptId={params.id} />
}

    