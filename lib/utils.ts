import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import moment from "moment";
export const liveUrl = "https://contactm.vercel.app/";
export const timezones = [
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Kolkata",
  "Africa/Cairo",
  "Australia/Sydney",
  "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires",
  "Africa/Nairobi",
  "Antarctica/McMurdo",
];

export const isValidTimezone = (timezone: string): boolean => {
  return timezones.includes(timezone as (typeof timezones)[number]);
};

export const verifyToken = async (req: NextRequest) => {
  const token = req.cookies.get("token");
  const JWT_SECRET = process.env.JWT_SECRET!;

  if (!token) {
    throw new Error("Unauthorized");
  }

  try {
    const decoded: any = await jwt.verify(token.value, JWT_SECRET);
    if (!decoded || !decoded.email) {
      throw new Error("Invalid token payload");
    }
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Error("Unauthorized");
  }
};


export const validateDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date format. Please use ISO format (YYYY-MM-DD).");
  }

  if (start > end) {
    throw new Error("Start date cannot be after the end date.");
  }

  return { start, end };
};

// Function to convert a date to the user's timezone using moment
export const convertToTimezone = (date: Date, timezone: string): string => {
  return moment.tz(date, timezone).format("YYYY-MM-DD HH:mm:ss Z");
};