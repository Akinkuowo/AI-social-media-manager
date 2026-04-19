import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Reset the post back into the worker queue
    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        status: "SCHEDULED",
        errorLog: null,
      }
    });

    // We can explicitly update its timestamp to 'now' so it gets snatched instantly
    await prisma.post.update({
      where: { id: params.id },
      data: {
        scheduledAt: new Date()
      }
    });

    return NextResponse.json(post);
  } catch (err: any) {
    console.error("QUEUE_RETRY_ERROR:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
