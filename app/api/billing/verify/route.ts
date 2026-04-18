import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json({ message: "Reference is required" }, { status: 400 });
    }

    // Verify the transaction with Paystack
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      }
    });

    const data = await paystackRes.json();

    if (!paystackRes.ok || !data.status) {
      console.error("[PAYSTACK_VERIFY_ERROR]:", data);
      return NextResponse.json({ message: data.message || "Failed to verify payment" }, { status: 400 });
    }

    const transaction = data.data;

    if (transaction.status !== "success") {
      return NextResponse.json({ message: `Transaction was not successful. Status: ${transaction.status}` }, { status: 400 });
    }

    const { companyId, plan } = transaction.metadata || {};

    if (!companyId || !plan) {
      return NextResponse.json({ message: "Invalid transaction metadata" }, { status: 400 });
    }

    // Verify user belongs to this company
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id, companyId }
    });

    if (!teamMember) {
      return NextResponse.json({ message: "Permission denied" }, { status: 403 });
    }

    // Update the company's subscription
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1); // Exact exactly 1 calendar month

    await prisma.subscription.upsert({
      where: { companyId },
      update: {
        plan: plan,
        status: 'ACTIVE',
        currentPeriodEnd: nextBillingDate,
      },
      create: {
        companyId,
        plan: plan,
        status: 'ACTIVE',
        currentPeriodEnd: nextBillingDate,
        usageCount: 0
      }
    });

    // Create an Invoice record
    await prisma.invoice.create({
      data: {
        companyId,
        amount: transaction.amount / 100, // Convert from Kobo back to original currency (e.g. NGN)
        status: 'paid',
        invoiceUrl: transaction.receipt_url || null, // Paystack sometimes offers receipt_url in specific channels
      }
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        companyId,
        userId: session.user.id,
        action: 'SUBSCRIPTION_UPGRADED',
        details: `Upgraded to ${plan} plan via Paystack`
      }
    });

    return NextResponse.json({ message: "Payment successful and plan upgraded", plan });

  } catch (err) {
    console.error("[BILLING_VERIFY_FATAL]:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
