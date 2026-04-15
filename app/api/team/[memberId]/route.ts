import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/logger";

export async function PATCH(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await auth();
    const { role } = await req.json();
    const { memberId } = params;

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const sender = await prisma.teamMember.findFirst({
      where: { 
        userId: session.user.id,
        role: { in: ["OWNER", "ADMIN"] }
      },
    });

    if (!sender) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const targetMember = await prisma.teamMember.findUnique({
      where: { id: memberId },
      include: { user: true }
    });

    if (!targetMember) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }

    // Role hierarchy checks could go here (e.g. only OWNER can change ADMIN roles)

    const updatedMember = await prisma.teamMember.update({
      where: { id: memberId },
      data: { role }
    });

    await logActivity(
      sender.companyId,
      session.user.id,
      "ROLE_UPDATED",
      `Changed role of ${targetMember.user?.email} to ${role}`
    );

    return NextResponse.json(updatedMember);
  } catch (err: any) {
    console.error("TEAM_PATCH_ERROR:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await auth();
    const { memberId } = params;

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const sender = await prisma.teamMember.findFirst({
      where: { 
        userId: session.user.id,
        role: { in: ["OWNER", "ADMIN"] }
      },
    });

    if (!sender) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const targetMember = await prisma.teamMember.findUnique({
      where: { id: memberId },
      include: { user: true }
    });

    if (!targetMember) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }

    await prisma.teamMember.delete({
      where: { id: memberId }
    });

    await logActivity(
      sender.companyId,
      session.user.id,
      "MEMBER_REMOVED",
      `Removed ${targetMember.user?.email} from the team`
    );

    return NextResponse.json({ message: "Member removed" });
  } catch (err: any) {
    console.error("TEAM_DELETE_ERROR:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
