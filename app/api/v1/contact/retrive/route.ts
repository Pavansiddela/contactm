import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateDateRange, verifyToken } from "@/lib/utils";
import moment from "moment-timezone";

// GET: Retrieve contacts with filtering and sorting capabilities
export const POST = async (req: NextRequest) => {
  try {
    const decoded = await verifyToken(req);
    const body = await req.json().catch(() => {});
    console.log({ body });

    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const timezone = searchParams.get("timezone") || body?.timezone || "UTC"; // Default to UTC if not provided
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const filterTimezone = searchParams.get("filterTimezone");
    const sortBy = searchParams.get("sortBy") || "createdAt"; // Default sort by `createdAt`
    const order = searchParams.get("order") || "asc"; // Default sort order: ascending

    // Validate the date range
    let start, end;
    if (startDate && endDate) {
      try {
        ({ start, end } = validateDateRange(startDate, endDate));
        console.log(start, end);
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    // Build the filter criteria for the Prisma query
    const filterCriteria: any = {
      userId: decoded.id, // Assuming each user retrieves their own contacts
      deleted: false, // Fetch only non-deleted contacts
    };
    const dat = new Date().toUTCString();
    const utcDate = moment.utc(dat);
    const userTimezone = "Asia/Kolkata";
    const zonedDate = utcDate.tz(timezone).format();

    // if (name) {
    //   filterCriteria.name = {
    //     contains: name, // Filter by name (partial match)
    //     mode: "insensitive", // Case-insensitive match
    //   };
    // }

    // if (email) {
    //   filterCriteria.email = {
    //     contains: email, // Filter by email (partial match)
    //     mode: "insensitive", // Case-insensitive match
    //   };
    // }

    // if (filterTimezone) {
    //   filterCriteria.timezone = filterTimezone; // Exact match for timezone
    // }

    if (start && end) {
      filterCriteria.createdAt = {
        gte: start,
        lte: end,
      };
    }

    // Perform the database query with filtering and sorting
    const contacts = await db.contact.findMany({
      where: filterCriteria,
      orderBy: {
        [sortBy]: order === "asc" ? "asc" : "desc", // Sorting by the specified field and order
      },
    });

    // Convert timestamps to the specified timezone
    const contactsWithConvertedTimestamps = contacts.map((contact: any) => ({
      ...contact,
      // createdAt: convertToTimezone(contact.createdAt, timezone),
      createdAt: moment.utc(contact.createdAt).tz(timezone).format(),
      updateAt: moment.utc(contact.updatedAt).tz(timezone).format(),
    }));

    return NextResponse.json(
      {
        contactsWithConvertedTimestamps,
        timezone: { time: zonedDate, before: dat, zone: timezone },
        zonedDate,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
};
