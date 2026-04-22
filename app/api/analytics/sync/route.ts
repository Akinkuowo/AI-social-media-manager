import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { syncAllMetrics } from "@/lib/analytics-sync";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id }
    });

    if (!teamMember) {
      return NextResponse.json({ message: "No company association found" }, { status: 404 });
    }

    // Trigger background sync across all platforms
    await syncAllMetrics(teamMember.companyId);

    return NextResponse.json({ success: true, message: "Sync triggered successfully" });
  } catch (err: any) {
    console.error("[ANALYTICS_SYNC_API_ERR]:", err);
    return NextResponse.json(
      { message: "Failed to initiate sync" },
      { status: 500 }
    );
  }
}
