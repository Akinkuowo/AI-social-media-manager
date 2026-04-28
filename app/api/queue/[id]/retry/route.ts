import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Reset the post back into the worker queue
    const post = await prisma.post.update({
      where: { id },
      data: {
        status: "SCHEDULED",
        errorLog: null,
        scheduledAt: new Date(),
      }
    });

    console.log(`[Queue] Post ${id} reset to SCHEDULED for retry.`);
    return NextResponse.json(post);
  } catch (err: any) {
    console.error("QUEUE_RETRY_ERROR:", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}
