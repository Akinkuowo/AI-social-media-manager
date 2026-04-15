import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/logger";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Find any company the user belongs to. 
    // In a multi-company scenario, we'd need a company selector.
    const teamMember = await prisma.teamMember.findFirst({
      where: { 
        userId: session.user.id,
      },
    });

    if (!teamMember) {
      return NextResponse.json({ message: "No company association found" }, { status: 404 });
    }

    const members = await prisma.teamMember.findMany({
      where: { companyId: teamMember.companyId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          }
        }
      }
    });

    const invitations = await prisma.invitation.findMany({
      where: { companyId: teamMember.companyId }
    });

    return NextResponse.json({ 
      members, 
      invitations,
      currentRole: teamMember.role,
      companyId: teamMember.companyId 
    });
  } catch (err: any) {
    console.error("TEAM_GET_ERROR:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { email, role } = await req.json();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Find if the user is an OWNER or ADMIN of ANY company
    const sender = await prisma.teamMember.findFirst({
      where: { 
        userId: session.user.id,
        role: { in: ["OWNER", "ADMIN"] }
      },
    });

    if (!sender) {
      return NextResponse.json({ 
        message: "Forbidden: You must be an Owner or Admin to invite members." 
      }, { status: 403 });
    }

    // Check if already a member
    const existingMember = await prisma.teamMember.findFirst({
      where: { 
        companyId: sender.companyId,
        user: { email }
      }
    });

    if (existingMember) {
      return NextResponse.json({ message: "User is already a member" }, { status: 400 });
    }

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        companyId: sender.companyId,
        token: Math.random().toString(36).substring(2, 15),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
    });

    await logActivity(
      sender.companyId, 
      session.user.id, 
      "MEMBER_INVITED", 
      `Invited ${email} as ${role}`
    );

    return NextResponse.json(invitation, { status: 201 });
  } catch (err: any) {
    console.error("TEAM_INVITE_ERROR:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
