// app/api/admin/broadcast/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/mongodb";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { title, message, imageUrl, targetEmails, sendEmail } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required." }, { status: 400 });
    }

    // 1. Post In-Website Notification
    await addDoc(collection(db, "site_notifications"), {
      title: title.trim(),
      message: message.trim(),
      imageUrl: imageUrl || null,
      createdAt: serverTimestamp(),
      active: true,
    });

    // 2. Optional Broadcast Email to Signups / Members
    if (sendEmail && Array.isArray(targetEmails) && targetEmails.length > 0) {
      const brevoApiKey = process.env.BREVO_API_KEY;
      if (brevoApiKey) {
        const recipients = targetEmails.filter(Boolean).map((em: string) => ({ email: em }));

        const imageHtml = imageUrl
          ? `<div style="margin: 16px 0; text-align: center;"><img src="${imageUrl}" alt="Poster" style="max-width: 100%; border-radius: 12px; border: 1px solid #334155;" /></div>`
          : "";

        const payload = {
          sender: {
            name: "DEKUWEC Executive",
            email: "wildlifeandenvironmentalclub@dkut.ac.ke",
          },
          to: recipients,
          subject: `[DEKUWEC Announcement] ${title}`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 24px; border-radius: 16px; max-width: 600px; margin: auto;">
              <h2 style="color: #10b981; margin-top: 0;">${title}</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">${message}</p>
              ${imageHtml}
              <hr style="border: 0; border-top: 1px solid #1e293b; margin: 24px 0;" />
              <div style="font-size: 11px; color: #64748b; text-align: center;">
                <p>Dedan Kimathi Wildlife & Environmental Club (DEKUWEC)</p>
                <p>Instagram: @dekut_wec | X: @Dekut_WEC | TikTok: @dekut_wec | WhatsApp: 0758638953</p>
              </div>
            </div>
          `,
        };

        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": brevoApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Broadcast failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
