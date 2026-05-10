import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { followerCount, engagementRate } = await req.json();
    const { id } = await params;

    const competitor = await prisma.competitor.update({
      where: { id },
      data: {
        followerCount: followerCount !== undefined ? parseInt(followerCount) : undefined,
        engagementRate: engagementRate !== undefined ? parseFloat(engagementRate) : undefined,
      },
    });

    return NextResponse.json(competitor);
  } catch (err) {
    console.error("COMPETITOR_UPDATE_ERROR:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.competitor.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("COMPETITOR_DELETE_ERROR:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
