import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { 
      companyName, 
      niche, 
      brandVoice, 
      targetAudience, 
      businessGoals,
      logo,
      primaryColor,
      secondaryColor,
      brandFont
    } = await req.json();

    if (!companyName) {
      return NextResponse.json(
        { message: "Company name is required" },
        { status: 400 }
      );
    }

    // Create company and associate with user as OWNER
    const company = await prisma.company.create({
      data: {
        name: companyName,
        niche,
        brandVoice,
        targetAudience,
        businessGoals,
        logo,
        primaryColor,
        secondaryColor,
        brandFont,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Company created successfully", companyId: company.id },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("COMPANY_CREATION_ERROR:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    console.log(`[COMPANY_GET] Session user ID: ${session?.user?.id}`);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find the current user's primary company
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      include: {
        company: true
      }
    });

    console.log(`[COMPANY_GET] Team member found: ${!!teamMember}`);

    if (!teamMember) {
      return NextResponse.json(
        { message: "Not Found" },
        { status: 404 }
      );
    }

    return NextResponse.json(teamMember.company);
  } catch (err: any) {
    console.error("COMPANY_GET_ERROR:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    console.log(`[COMPANY_PATCH] Session user ID: ${session?.user?.id}`);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { 
      companyName, 
      niche, 
      brandVoice, 
      targetAudience, 
      businessGoals,
      logo,
      primaryColor,
      secondaryColor,
      brandFont
    } = await req.json();

    // Verify user has permission to update (OWNER or ADMIN)
    const teamMember = await prisma.teamMember.findFirst({
      where: { 
        userId: session.user.id,
        role: { in: ["OWNER", "ADMIN"] }
      }
    });

    if (!teamMember) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const updatedCompany = await prisma.company.update({
      where: { id: teamMember.companyId },
      data: {
        name: companyName,
        niche,
        brandVoice,
        targetAudience,
        businessGoals,
        logo,
        primaryColor,
        secondaryColor,
        brandFont,
      },
    });

    return NextResponse.json(updatedCompany);
  } catch (err: any) {
    console.error("COMPANY_PATCH_ERROR:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

