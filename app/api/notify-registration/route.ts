// app/api/notify-registration/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, regNumber, yearOfStudy, memberType } = await req.json();

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
        sender: { name: "DEKUWEC Portal", email: clubEmail },
        to: [{ email: clubEmail, name: "DEKUWEC Executive Board" }],
        subject: `[New Member Submission] ${name} - ${yearOfStudy}`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
            <h2 style="color: #065f46;">New DEKUWEC Registration Submitted</h2>
            <p>A student has submitted their membership details through the web portal:</p>
            <table style="border-collapse: collapse; width: 100%; max-width: 500px; margin-top: 15px;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Full Name:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${name}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Student Email:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${email}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Reg Number:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${regNumber || "N/A"}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Year of Study:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${yearOfStudy}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Type:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${memberType === "new" ? "New Member" : "Existing Member Update"}</td></tr>
            </table>
          </div>
        `,
      }),
    });

    // 2. Email Confirmation to the Student
    const studentEmailPromise = fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: { name: "DEKUWEC Secretariat", email: clubEmail },
        to: [{ email: email, name: name }],
        subject: "Confirmation: DEKUWEC Membership Registration Received",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; line-height: 1.6;">
            <div style="border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 20px;">
              <h2 style="color: #065f46; margin: 0;">Dedan Kimathi Wildlife & Environmental Club</h2>
            </div>
            <p>Dear <strong>${name}</strong>,</p>
            <p>Thank you for submitting your details to DEKUWEC! We have received your registration, and your profile is currently being processed by the executive board.</p>
            <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 14px; margin: 20px 0; font-size: 14px;">
              <p style="margin: 0; font-weight: bold; color: #065f46;">What happens next?</p>
              <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #065f46;">
                <li>Your student record is being verified.</li>
                <li>You will receive alerts for upcoming outdoor hikes, expeditions, and cleanups.</li>
                <li>Join our weekly physical session every <strong>Wednesday at 4:00 PM at Resource Centre</strong>.</li>
              </ul>
            </div>
            <p>If you have any questions or need to reach out, feel free to reply directly to this email or visit our desk.</p>
            <p style="margin-top: 30px; font-size: 13px; color: #64748b;">
              Best regards,<br/>
              <strong>Executive Board, DEKUWEC</strong><br/>
              Dedan Kimathi University of Technology
            </p>
          </div>
        `,
      }),
    });

    await Promise.all([adminEmailPromise, studentEmailPromise]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Brevo registration dispatch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
