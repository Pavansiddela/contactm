import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ContactSchema, ContactUpdateSchema } from "@/schemas";
import { isValidTimezone, timezones, verifyToken } from "@/lib/utils";

// Utility function for verifying the JWT token

// POST: Create new contact
export const POST = async (req: NextRequest) => {
  try {
    const decoded = await verifyToken(req);
    const body = await req.json();

    // Validate body against schema
    const validate = ContactSchema.safeParse(body);
    if (!validate.success) {
      return NextResponse.json({ error: validate.error }, { status: 400 });
    }

    if (!isValidTimezone(body.timezone)) {
      return NextResponse.json(
        { error: "Invalid timezone", allowedTimezones: timezones },
        { status: 400 }
      );
    }

    const existingContact = await db.contact.findUnique({
      where: { email: validate.data.email },
    });

    if (existingContact) {
      return NextResponse.json({ error: "Already Exists" }, { status: 409 });
    }
    console.log(decoded.id);
    const contactData = { ...validate.data, userId: decoded.id };
    console.log(contactData);
    const newContact = await db.contact.create({ data: contactData });

    return NextResponse.json(newContact, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
};

// PUT: Update existing contact
export const PUT = async (req: NextRequest) => {
  try {
    const decoded = await verifyToken(req);
    const body = await req.json();

    // Validate body against schema
    const validate = ContactUpdateSchema.safeParse(body);
    if (!validate.success) {
      return NextResponse.json({ error: validate.error }, { status: 400 });
    }

    // if (!isValidTimezone(body.timezone)) {
    //   return NextResponse.json(
    //     { error: "Invalid timezone", allowedTimezones: timezones },
    //     { status: 400 }
    //   );
    // }

    const existingContact = await db.contact.findUnique({
      where: { email: validate.data.email },
    });

    if (!existingContact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const updatedContact = await db.contact.update({
      where: { email: validate.data.email },
      data: validate.data,
    });

    return NextResponse.json(updatedContact, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
};

// DELETE: Soft delete contact (mark as inactive)
export const DELETE = async (req: NextRequest) => {
  try {
    const decoded = await verifyToken(req);
    const { email } = await req.json();

    const existingContact = await db.contact.findUnique({
      where: { email },
    });

    if (!existingContact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const softDeletedContact = await db.contact.update({
      where: { email },
      data: { deleted: true }, // Assuming you have an "active" field for soft deletion
    });

    return NextResponse.json(softDeletedContact, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
};

// HARD DELETE: Permanently delete contact
// export const hardDelete = async (req: NextRequest) => {
//   try {
//     const decoded = await verifyToken(req);
//     const { email } = await req.json();

//     const existingContact = await db.contact.findUnique({
//       where: { email },
//     });

//     if (!existingContact) {
//       return NextResponse.json({ error: "Contact not found" }, { status: 404 });
//     }

//     await db.contact.delete({
//       where: { email },
//     });

//     return NextResponse.json(
//       { message: "Contact permanently deleted" },
//       { status: 200 }
//     );
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 401 });
//   }
// };
