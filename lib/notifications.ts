import { prisma } from "./prisma";
import nodemailer from "nodemailer";

export type NotificationPayload = {
  userId: string;
  title: string;
  message: string;
  type: "PUBLISH_SUCCESS" | "PUBLISH_FAILED" | "ANALYTICS_READY" | "COMMENT_RECEIVED" | "SYSTEM_ALERT";
  link?: string;
  channels: ("email" | "in-app" | "push")[];
};

/**
 * Centralized Notification Dispatcher
 */
export async function sendNotification(payload: NotificationPayload) {
  const { userId, title, message, type, link, channels } = payload;

  console.log(`[Notification Engine] Dispatching "${title}" to User ${userId} via [${channels.join(", ")}]`);

  // 1. In-App Notification (Database)
  if (channels.includes("in-app")) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          link,
        },
      });
    } catch (err) {
      console.error("[Notification_InApp_Error]:", err);
    }
  }

  // 2. Email (Nodemailer)
  if (channels.includes("email")) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.email) {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_SERVER_HOST,
          port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
        });

        await transporter.sendMail({
          from: `"SocialAI" <${process.env.EMAIL_FROM}>`,
          to: user.email,
          subject: title,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
              <h2 style="color: #3B82F6;">${title}</h2>
              <p>${message}</p>
              ${link ? `<a href="${process.env.NEXT_PUBLIC_APP_URL}${link}" style="display: inline-block; padding: 10px 20px; background: #3B82F6; color: white; text-decoration: none; border-radius: 5px;">View Details</a>` : ""}
              <hr style="margin-top: 20px; border: 0; border-top: 1px solid #eee;">
              <p style="font-size: 10px; color: #999;">You are receiving this because notifications are enabled for your SocialAI account.</p>
            </div>
          `,
        });
      }
    } catch (err) {
      console.warn("[Notification_Email_Ignored]: Likely missing SMTP credentials in .env.", err);
    }
  }

  // 3. Web Push (Infrastructure)
  if (channels.includes("push")) {
    // Note: This requires VAPID keys and a registered Service Worker.
    // For now, we log the intent. Real web push uses the 'web-push' library.
    console.log(`[Notification_Push_Pending]: Web Push payload targeted for user ${userId}`);
  }
}
