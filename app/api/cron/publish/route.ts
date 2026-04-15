import { NextResponse } from "next/server";
import { processQueue } from "@/lib/publisher";

export async function GET(req: Request) {
  try {
    // In production, you would check for an authorization header
    // e.g. if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    
    console.log("[Cron] Starting publishing process...");
    const results = await processQueue();
    
    return NextResponse.json({
      message: "Cron job executed successfully",
      processedCount: results.length,
      results
    });
  } catch (err: any) {
    console.error("[Cron] Error during publishing process:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
