import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { postId } = await params;

    // Verify the user owns this post via their company
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id }
    });

    if (!teamMember) {
      return NextResponse.json({ message: "No company association found" }, { status: 404 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { calendar: true }
    });

    if (!post || post.calendar.companyId !== teamMember.companyId) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    await prisma.post.delete({
      where: { id: postId }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        companyId: teamMember.companyId,
        userId: session.user.id,
        action: 'POST_DELETED',
        details: `Deleted ${post.type} post: "${post.caption.substring(0, 50)}..."`
      }
    });

    return NextResponse.json({ message: "Post deleted" });
  } catch (err) {
    console.error("POST_DELETE_ERROR:", err);
    return NextResponse.json({ message: "Failed to delete post" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { postId } = await params;
    const body = await req.json();

    // Verify ownership
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id }
    });

    if (!teamMember) {
      return NextResponse.json({ message: "No company association found" }, { status: 404 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { calendar: true }
    });

    if (!post || post.calendar.companyId !== teamMember.companyId) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Build update data from allowed fields
    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.scheduledAt) updateData.scheduledAt = new Date(body.scheduledAt);
    if (body.caption) updateData.caption = body.caption;
    if (body.hashtags !== undefined) updateData.hashtags = body.hashtags;

    const updated = await prisma.post.update({
      where: { id: postId },
      data: updateData
    });

    // Log status transitions
    if (body.status && body.status !== post.status) {
      await prisma.activityLog.create({
        data: {
          companyId: teamMember.companyId,
          userId: session.user.id,
          action: `POST_${body.status}`,
          details: `Post status changed from ${post.status} to ${body.status}`
        }
      });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("POST_UPDATE_ERROR:", err);
    return NextResponse.json({ message: "Failed to update post" }, { status: 500 });
  }
}
