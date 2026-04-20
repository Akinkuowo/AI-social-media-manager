import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const key = await prisma.apiKey.findUnique({
      where: { id }
    });

    if (!key || key.userId !== session.user.id) {
      return NextResponse.json({ message: "Key not found" }, { status: 404 });
    }

    await prisma.apiKey.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[KEY_DELETE_ERR]:", err);
    return NextResponse.json({ message: "Failed to revoke key" }, { status: 500 });
  }
}
