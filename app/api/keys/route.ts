import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const keys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(keys);
  } catch (err) {
    console.error("[KEYS_GET_ERR]:", err);
    return NextResponse.json({ message: "Failed to fetch keys" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();
    if (!name) return NextResponse.json({ message: "Key name is required" }, { status: 400 });

    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id }
    });

    if (!teamMember) {
      return NextResponse.json({ message: "No company found" }, { status: 404 });
    }

    // Generate a secure API Key
    const key = `ak_${randomBytes(24).toString('hex')}`;

    const apiKey = await prisma.apiKey.create({
      data: {
        key,
        name,
        userId: session.user.id,
        companyId: teamMember.companyId
      }
    });

    return NextResponse.json(apiKey);
  } catch (err) {
    console.error("[KEYS_POST_ERR]:", err);
    return NextResponse.json({ message: "Failed to create key" }, { status: 500 });
  }
}
