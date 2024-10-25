import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import moment from "moment-timezone";

export const GET = async (req: NextRequest) => {
  const token = req.cookies.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 } // Unauthorized
    );
  }

  const JWT_SECRET = process.env.JWT_SECRET!;

  try {
    // Verify the token
    const decoded: any = await jwt.verify(token.value, JWT_SECRET);

    // Check if decoded token contains user ID
    if (!decoded || !decoded.email) {
      throw new Error("Invalid token payload");
    }

    // Log the decoded information for debugging
    console.log("Decoded JWT:", decoded);

    // Fetch contacts using the user ID from the decoded token
    const contacts = await db.contact.findMany({
      where: {
        userId: decoded.id,
        deleted: false, // Only fetch non-deleted contacts
      },
      orderBy: {
        createdAt: "desc", // Most recent first
      },
    });

    const dat = new Date().toUTCString();
    const utcDate = moment.utc(dat);
    const userTimezone = "Asia/Kolkata";
    const zonedDate = utcDate.tz(userTimezone);

    return NextResponse.json({
      zone: zonedDate.format(),
      contacts,
      zsone: zonedDate.utc(),
    });
  } catch (error) {
    console.error("Token verification failed:", error);
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 } // Unauthorized
    );
  }
};
