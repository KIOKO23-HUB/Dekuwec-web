// app/api/send-verification/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, year } = await req.json();

    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      console.warn("BREVO_API_KEY not configured. Skipping email send.");
      return NextResponse.json({ success: true });
    }

    const payload = {
      sender: {
        name: "DEKUWEC Membership",
        email: "wildlifeandenvironmentalclub@dkut.ac.ke",
      },
      to: [{ email, name }],
      subject: "Action Required: Complete Your DEKUWEC Membership Registration",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; background-color: #0b1120; color: #e2e8f0; padding: 24px; border-radius: 12px; max-width: 600px; margin: auto;">
          <h2 style="color: #10b981; margin-top: 0;">Welcome to DEKUWEC, ${name}!</h2>
          <p>Thank you for initiating your membership verification (${year}).</p>
          
          <div style="background-color: #1e293b; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 6px;">
            <h3 style="color: #f59e0b; margin: 0 0 8px 0;">Membership Status: Pending Verification</h3>
            <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.5;">
              To complete your official membership and receive access to the official community and activities, please settle your registration fee:
            </p>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #cbd5e1;">
              <li><strong>Registration Fee:</strong> KES 100</li>
              <li><strong>Treasurer:</strong> Hannah (0118506251)</li>
              <li><strong>Verification DM:</strong> Send confirmation message to 0701 859332</li>
            </ul>
          </div>
          
          <p style="font-size: 13px; color: #94a3b8;">
            Once the verification message is confirmed, your portal account status will automatically transition to <strong>Approved</strong>.
          </p>
          <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;" />
          <p style="font-size: 11px; color: #64748b; text-align: center;">
            Dedan Kimathi Wildlife & Environmental Club (DEKUWEC)
          </p>
        </div>
      `,
    };

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("Brevo API error:", await res.text());
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Verification email dispatch failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
