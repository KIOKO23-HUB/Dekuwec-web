// app/api/members/message/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { recipientEmail, recipientName, senderName, message } = await req.json();
    const brevoApiKey = process.env.BREVO_API_KEY;

    if (!brevoApiKey || !recipientEmail) {
      return NextResponse.json({ error: "Missing Brevo API key or recipient email." }, { status: 400 });
    }

    const payload = {
      sender: { name: "DEKUWEC Portal", email: "wildlifeandenvironmentalclub@dkut.ac.ke" },
      to: [{ email: recipientEmail, name: recipientName }],
      subject: `[DEKUWEC] New Direct Message from ${senderName}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 24px; border-radius: 16px; max-width: 600px; margin: auto;">
          <h2 style="color: #10b981; margin-top: 0;">New Message from ${senderName}</h2>
          <p style="font-size: 14px; color: #cbd5e1;">Hello ${recipientName},</p>
          <p style="font-size: 14px; color: #cbd5e1;">You have received a new direct message through the DEKUWEC Membership Portal:</p>
          <div style="background-color: #0f172a; border-left: 4px solid #10b981; padding: 16px; margin: 16px 0; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #ffffff; font-style: italic;">"${message}"</p>
          </div>
          <p style="font-size: 12px; color: #64748b;">Log into your account at <a href="https://dekuwec-web.firebaseapp.com/membership" style="color: #10b981;">DEKUWEC Portal</a> to reply.</p>
        </div>
      `,
    };

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": brevoApiKey, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to dispatch email via Brevo.");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
