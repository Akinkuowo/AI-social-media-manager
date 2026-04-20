import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id }
    });

    if (!teamMember) {
      return NextResponse.json({ message: "No company association found" }, { status: 404 });
    }

    const body = await req.json();
    const { caption, hashtags, mediaUrls, status, scheduledAt, day } = body;

    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: { calendar: true }
    });

    if (!existingPost || existingPost.calendar.companyId !== teamMember.companyId) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        caption,
        hashtags,
        mediaUrls,
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        day
      },
      include: {
        socialAccount: true
      }
    });

    // Log activity if status changed
    if (status && status !== existingPost.status) {
      await prisma.activityLog.create({
        data: {
          companyId: teamMember.companyId,
          userId: session.user.id,
          action: `POST_${status}`,
          details: `Post status changed from ${existingPost.status} to ${status}`
        }
      });
    }

    return NextResponse.json(post);
  } catch (err: any) {
    console.error("[POST_UPDATE_ERR]:", err);
    return NextResponse.json(
      { message: err.message || "Failed to update post" },
      { status: 500 }
    );
  }
}

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

    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id }
    });

    if (!teamMember) {
      return NextResponse.json({ message: "No company association found" }, { status: 404 });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: { calendar: true }
    });

    if (!post || post.calendar.companyId !== teamMember.companyId) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    await prisma.post.delete({
      where: { id }
    });

    await prisma.activityLog.create({
      data: {
        companyId: teamMember.companyId,
        userId: session.user.id,
        action: 'POST_DELETED',
        details: `Deleted ${post.type} post: "${post.caption.substring(0, 50)}..."`
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[POST_DELETE_ERR]:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
