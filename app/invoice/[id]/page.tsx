import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { PrintButton } from "@/components/ui/PrintButton";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      company: true,
    },
  });

  if (!invoice) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full bg-white/5 border border-white/10 rounded-3xl p-10 md:p-14 relative overflow-hidden backdrop-blur-xl">
        
        {/* Print Button (Hidden on Print) */}
        <div className="absolute top-6 right-6 print:hidden">
          <PrintButton />
        </div>

        {/* Invoice Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-white/10 pb-10 mb-10">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent mb-2">RECEIPT</h1>
            <p className="text-white/40 font-mono text-sm tracking-wider uppercase">#{invoice.id.substring(0, 8)}</p>
          </div>
          <div className="md:text-right">
            <h2 className="text-lg font-bold text-white mb-1">AI Social Manager</h2>
            <p className="text-white/50 text-sm font-medium">Billed to: <span className="text-white font-bold">{invoice.company.name}</span></p>
            <p className="text-white/50 text-sm mt-1">{format(new Date(invoice.date), "MMMM dd, yyyy")}</p>
          </div>
        </div>

        {/* Invoice Amount Box */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-primary font-bold tracking-wider text-sm uppercase mb-1">Amount Paid</p>
            <p className="text-4xl font-black text-white">₦{invoice.amount.toLocaleString()}</p>
          </div>
          <div className="px-4 py-2 bg-success/10 border border-success/20 text-success rounded-lg font-bold uppercase tracking-widest text-xs">
            {invoice.status === 'paid' ? 'Paid via Paystack' : invoice.status}
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-12">
          <div className="grid grid-cols-[1fr_auto] gap-4 mb-4 text-xs font-bold uppercase tracking-widest text-white/40 border-b border-white/10 pb-4">
            <p>Description</p>
            <p className="text-right">Total</p>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-4 py-2 items-center text-sm font-medium">
            <p className="text-white text-base">Subscription Plan Upgrade</p>
            <p className="text-white font-mono text-base">₦{invoice.amount.toLocaleString()}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-center text-sm font-medium text-white/30">
          Thank you for using AI Social Media Manager. If you have any questions, contact billing@example.com.
        </div>

      </div>

      {/* Embedded Script to handle auto-print safely */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Optionally auto trigger print dialog after 1 second for seamless downloads
            // setTimeout(() => window.print(), 1000);
          `
        }}
      />
    </div>
  );
}
