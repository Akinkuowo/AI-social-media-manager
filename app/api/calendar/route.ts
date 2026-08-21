import { requireAuth, getCompanyId } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const company = await getCompanyId(auth.userId);
  if (company.error) return company.error;

  const { searchParams } = new URL(req.url);
  const month = parseInt(
    searchParams.get("month") || new Date().getMonth().toString()
  );
  const year = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );

  try {
    // Find or create the calendar for this month/year using upsert to
    // avoid a race condition between the findUnique + create pattern.
    const calendar = await prisma.calendar.upsert({
      where: {
        companyId_month_year: {
          companyId: company.companyId,
          month,
          year,
        },
      },
      create: {
        companyId: company.companyId,
        month,
        year,
      },
      update: {}, // no-op on existing records
      include: {
        posts: {
          orderBy: { day: "asc" },
          // Use select to avoid loading large unused fields (e.g. platformOptimized JSON)
          select: {
            id: true,
            day: true,
            type: true,
            caption: true,
            hashtags: true,
            status: true,
            scheduledAt: true,
            isRecurring: true,
            recurrenceInterval: true,
            mediaUrls: true,
            createdAt: true,
            updatedAt: true,
            socialAccount: {
              select: {
                id: true,
                platform: true,
                name: true,
              },
            },
            analytics: {
              select: {
                impressions: true,
                reach: true,
                engagement: true,
                likes: true,
                shares: true,
                comments: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(calendar);
  } catch (err) {
    console.error("CALENDAR_FETCH_ERROR:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const company = await getCompanyId(auth.userId);
  if (company.error) return company.error;

  try {
    const body = await req.json();
    const {
      calendarId,
      day,
      type,
      caption,
      hashtags,
      socialAccountIds,
      scheduledAt,
      isRecurring,
      recurrenceInterval,
    } = body;

    if (!Array.isArray(socialAccountIds) || socialAccountIds.length === 0) {
      return NextResponse.json(
        { message: "Must select at least one platform." },
        { status: 400 }
      );
    }

    // Verify the calendar belongs to this company (authorization check)
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
      select: { id: true, companyId: true },
    });

    if (!calendar || calendar.companyId !== company.companyId) {
      return NextResponse.json(
        { message: "Calendar not found." },
        { status: 404 }
      );
    }

    const safeDate = scheduledAt ? new Date(scheduledAt) : new Date();

    const dataToInsert = socialAccountIds.map((accountId: string) => ({
      calendarId,
      day,
      type,
      caption,
      hashtags,
      socialAccountId: accountId,
      scheduledAt: safeDate,
      status: "SCHEDULED" as const,
      isRecurring: Boolean(isRecurring),
      recurrenceInterval: isRecurring ? recurrenceInterval : null,
    }));

    // Run bulk insert and activity log in a transaction
    const result = await prisma.$transaction([
      prisma.post.createMany({ data: dataToInsert }),
      prisma.activityLog.create({
        data: {
          companyId: company.companyId,
          userId: auth.userId,
          action: "POST_SCHEDULED_BULK",
          details: `Scheduled a new ${type} post across ${socialAccountIds.length} platforms for day ${day}`,
        },
      }),
    ]);

    return NextResponse.json({ success: true, count: result[0].count });
  } catch (err) {
    console.error("POST_SCHEDULING_ERROR:", err);
    return NextResponse.json(
      { message: "Failed to schedule cross-platform posts" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const company = await getCompanyId(auth.userId);
  if (company.error) return company.error;

  const { searchParams } = new URL(req.url);
  const monthStr = searchParams.get("month");
  const yearStr = searchParams.get("year");

  if (!monthStr || !yearStr) {
    return NextResponse.json({ message: "Month and year are required" }, { status: 400 });
  }

  const targetMonth = parseInt(monthStr);
  const targetYear = parseInt(yearStr);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  if (targetYear < currentYear || (targetYear === currentYear && targetMonth <= currentMonth)) {
    return NextResponse.json({ message: "Can only clear future months" }, { status: 403 });
  }

  try {
    const calendar = await prisma.calendar.findUnique({
      where: {
        companyId_month_year: {
          companyId: company.companyId,
          month: targetMonth,
          year: targetYear,
        },
      },
    });

    if (!calendar) {
      return NextResponse.json({ message: "No calendar found for this month" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.post.deleteMany({
        where: { calendarId: calendar.id },
      }),
      prisma.activityLog.create({
        data: {
          companyId: company.companyId,
          userId: auth.userId,
          action: "CALENDAR_BULK_CLEAR",
          details: `Cleared all posts for ${targetMonth + 1}/${targetYear}`,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("CALENDAR_BULK_DELETE_ERROR:", err);
    return NextResponse.json({ message: "Failed to clear calendar" }, { status: 500 });
  }
}
