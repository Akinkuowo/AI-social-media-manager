import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { plan } = await req.json();

    if (!['Pro', 'Agency'].includes(plan)) {
      return NextResponse.json({ message: "Invalid plan selected" }, { status: 400 });
    }

    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      include: { company: true }
    });

    if (!teamMember) {
      return NextResponse.json({ message: "No company associated" }, { status: 404 });
    }

    // Set precise NGN amounts in Kobo
    // Pro: ₦20,000 = 2,000,000 kobo
    // Agency: ₦50,000 = 5,000,000 kobo
    let amountTotalKobo = 0;
    if (plan === 'Pro') {
      amountTotalKobo = 2000000;
    } else if (plan === 'Agency') {
      amountTotalKobo = 5000000;
    }

    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`;

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: session.user.email,
        amount: amountTotalKobo,
        currency: "NGN",
        callback_url: callbackUrl,
        metadata: {
          companyId: teamMember.companyId,
          plan: plan.toUpperCase(),
        }
      })
    });

    const data = await paystackRes.json();

    if (!paystackRes.ok || !data.status) {
      console.error("[PAYSTACK_INIT_ERROR]:", data);
      return NextResponse.json({ message: data.message || "Failed to initialize payment" }, { status: 400 });
    }

    return NextResponse.json({ 
      authorization_url: data.data.authorization_url, 
      reference: data.data.reference 
    });

  } catch (err) {
    console.error("[BILLING_INIT_FATAL]:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
