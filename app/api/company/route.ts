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
