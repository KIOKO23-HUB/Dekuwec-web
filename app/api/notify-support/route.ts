// app/api/notify-support/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    const brevoApiKey = process.env.BREVO_API_KEY;
    const clubEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "wildlifeandenvironmentalclub@dkut.ac.ke";

    if (!brevoApiKey) {
      return NextResponse.json({ error: "Brevo API Key missing" }, { status: 500 });
    }

    // 1. Email to the Club Admin
    const adminEmailPromise = fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: { name: "DEKUWEC Portal Support", email: clubEmail },
        to: [{ email: clubEmail, name: "DEKUWEC Support Desk" }],
        subject: `[Web Inquiry] ${subject || "General Message"} - from ${name}`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
            <h3 style="color: #065f46;">New Message via Website Contact Form</h3>
            <p><strong>From:</strong> ${name} (&lt;${email}&gt;)</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #059669; margin-top: 10px; border-radius: 4px;">
              <p style="white-space: pre-wrap; margin: 0;">${message}</p>
            </div>
          </div>
        `,
      }),
    });

    // 2. Email Receipt to the Inquirer
    const userEmailPromise = fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: { name: "DEKUWEC Secretariat", email: clubEmail },
        to: [{ email: email, name: name }],
        subject: "Message Received: DEKUWEC Support Desk",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; line-height: 1.6;">
            <h3 style="color: #065f46; margin-top: 0;">We have received your message</h3>
            <p>Hi <strong>${name}</strong>,</p>
            <p>Thank you for contacting the Dedan Kimathi Wildlife & Environmental Club. We have logged your inquiry and a club official will review and reply to your inquiry shortly.</p>
            <div style="background-color: #f1f5f9; padding: 14px; border-radius: 8px; margin: 15px 0; font-size: 13px;">
              <p style="margin: 0 0 5px 0; font-weight: bold;">Summary of your message:</p>
              <p style="margin: 0; color: #475569; font-style: italic;">"${message}"</p>
            </div>
            <p>Warm regards,<br/><strong>DEKUWEC Help Desk</strong></p>
          </div>
        `,
      }),
    });

    await Promise.all([adminEmailPromise, userEmailPromise]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Brevo support dispatch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
