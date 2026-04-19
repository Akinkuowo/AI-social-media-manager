import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json(notifications);
  } catch (err) {
    console.error("NOTIFICATION_GET_ERROR:", err);
    return NextResponse.json({ message: "Error fetching notifications" }, { status: 500 });
  }
}

export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("NOTIFICATION_PATCH_ERROR:", err);
    return NextResponse.json({ message: "Error updating notifications" }, { status: 500 });
  }
}
