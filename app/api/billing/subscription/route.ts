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

    // Find the subscription for the user's active company
    const subscription = await prisma.subscription.findFirst({
      where: {
        company: {
          members: {
            some: {
              userId: session.user.id
            }
          }
        }
      }
    });

    // If no subscription exists, we return a default FREE plan
    if (!subscription) {
      return NextResponse.json({
        plan: "FREE",
        status: "ACTIVE",
        usageCount: 0,
        currentPeriodEnd: null
      });
    }

    return NextResponse.json(subscription);
  } catch (err: any) {
    console.error("SUBSCRIPTION_ERROR:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
