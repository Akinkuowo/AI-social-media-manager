import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find the invoices for the user's active company
    const invoices = await prisma.invoice.findMany({
      where: {
        company: {
          members: {
            some: {
              userId: session.user.id
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    if (!invoices) {
      return NextResponse.json(
        { message: "No history found" },
        { status: 404 }
      );
    }

    return NextResponse.json(invoices);
  } catch (err: any) {
    console.error("BILLING_HISTORY_ERROR:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
