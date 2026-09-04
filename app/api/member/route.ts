// app/api/member/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Member from "@/models/Member";

// GET: Retrieve current logged-in member profile
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    let member = await Member.findOne({ clerkId: userId });

    // Auto-create initial record if first time
    if (!member) {
      const user = await currentUser();
      const email =
        user?.primaryEmailAddress?.emailAddress ||
        user?.emailAddresses?.[0]?.emailAddress ||
        "";
      const name =
        user?.fullName ||
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
        "Member";

      member = await Member.create({
        clerkId: userId,
        displayName: name,
        email,
        photoURL: user?.imageUrl || "",
        status: "Unregistered",
      });
    }

    return NextResponse.json({ member });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST/PUT: Update member profile
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { displayName, course, year, status } = body;

    await connectDB();

    const user = await currentUser();
    const email =
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      "";

    const updateFields: any = {
      displayName,
      course,
      year,
      email,
    };

    if (status) {
      updateFields.status = status;
      if (status === "Pending") {
        updateFields.appliedAt = new Date().toISOString();
      }
    }

    const updated = await Member.findOneAndUpdate(
      { clerkId: userId },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, member: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
