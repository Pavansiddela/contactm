import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { ContactSchema } from "@/schemas";
import { isValidTimezone, verifyToken } from "@/lib/utils";



// BULK POST: Create multiple contacts
export const POST = async (req: NextRequest) => {
  try {
    const decoded = await verifyToken(req);
    const body = await req.json();

    // Ensure body is an array of contacts
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body should be an array of contacts" },
        { status: 400 }
      );
    }

    const errors = [];
    const createdContacts = [];

    for (const contact of body) {
      // Validate each contact
      const validate = ContactSchema.safeParse(contact);
      if (!validate.success) {
        errors.push({
          contact: contact.email,
          error: validate.error,
        });
        continue; // Skip invalid contact
      }

      // Check if the contact's timezone is valid
      if (!isValidTimezone(contact.timezone)) {
        errors.push({
          contact: contact.email,
          error: "Invalid timezone",
        });
        continue;
      }

      // Check if contact already exists
      const existingContact = await db.contact.findUnique({
        where: { email: contact.email },
      });

      if (existingContact) {
        errors.push({
          contact: contact.email,
          error: "Already Exists",
        });
        continue;
      }

      // Add userId to the contact data and create the contact
      const contactData = { ...validate.data, userId: decoded.id };
      const newContact = await db.contact.create({
        data: contactData,
      });

      createdContacts.push(newContact);
    }

    // Return response with created contacts and any errors
    return NextResponse.json(
      {
        createdContacts,
        errors, // If there are validation or creation errors, return them
      },
      { status: createdContacts.length > 0 ? 201 : 400 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
};
