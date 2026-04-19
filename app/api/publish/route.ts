import { auth } from "@/auth";
import { processQueue } from "@/lib/publisher";
import { NextResponse } from "next/server";

/**
 * POST /api/publish
 * 
 * Manual trigger for the publishing engine.
 * Authenticates the user and then runs the background processQueue.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log(`[Publish API] Manual trigger by user ${session.user.id}`);
    const results = await processQueue();
    
    const published = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'failed').length;

    return NextResponse.json({
      published,
      failed,
      total: results.length,
      results
    });

  } catch (err) {
    console.error("[PUBLISH_API_ERROR]:", err);
    return NextResponse.json({ message: "Publisher failed" }, { status: 500 });
  }
}
