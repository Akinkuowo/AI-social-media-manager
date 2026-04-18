import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") || new Date().getMonth().toString());
  const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

  try {
    // 1. Find user's company
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id }
    });

    if (!teamMember) {
      return NextResponse.json({ message: "No company association found" }, { status: 404 });
    }

    // 2. Find or Create Calendar for this month
    let calendar = await prisma.calendar.findUnique({
      where: {
        companyId_month_year: {
          companyId: teamMember.companyId,
          month,
          year
        }
      },
      include: {
        posts: {
          orderBy: { day: 'asc' },
          include: {
            socialAccount: true,
            analytics: true
          }
        }
      }
    });

    if (!calendar) {
      calendar = await prisma.calendar.create({
        data: {
          companyId: teamMember.companyId,
          month,
          year
        },
        include: {
          posts: true
        }
      });
    }

    return NextResponse.json(calendar);
  } catch (err) {
    console.error("CALENDAR_FETCH_ERROR:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { calendarId, day, type, caption, hashtags, socialAccountId, scheduledAt } = body;

    const post = await prisma.post.create({
      data: {
        calendarId,
        day,
        type,
        caption,
        hashtags,
        socialAccountId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        status: 'SCHEDULED'
      }
    });

    // Log Activity
    const calendar = await prisma.calendar.findUnique({ where: { id: calendarId } });
    if (calendar) {
      await prisma.activityLog.create({
        data: {
          companyId: calendar.companyId,
          userId: session.user.id,
          action: 'POST_SCHEDULED',
          details: `Scheduled a new ${type} post for day ${day}`
        }
      });
    }

    return NextResponse.json(post);
  } catch (err) {
    console.error("POST_SCHEDULING_ERROR:", err);
    return NextResponse.json({ message: "Failed to schedule post" }, { status: 500 });
  }
}
