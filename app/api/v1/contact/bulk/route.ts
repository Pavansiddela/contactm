// app/api/contacts/import/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { parse as parsesCSV } from "csv-parse/sync";
import { read as readXLSX, utils as xlsxUtils } from "xlsx-js-style";
import { verifyToken } from "@/lib/utils";

const prisma = new PrismaClient();

// Contact validation schema
const ContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phoneNumber: z.string(),
  address: z.string().optional(),
  timezone: z.string().min(1, "Timezone is required"),
});

type Contact = z.infer<typeof ContactSchema>;

// Function to normalize contact data
const normalizeContact = (row: any): Partial<Contact> => ({
  name: String(row.name || ""),
  email: String(row.email || ""),
  phoneNumber: String(
    row.phoneNumber || row["phone number"] || row.phone || ""
  ),
  address: row.address ? String(row.address) : undefined,
  timezone: String(row.timezone || ""),
});

// Function to parse Excel file
async function parseExcel(buffer: ArrayBuffer) {
  const workbook = readXLSX(buffer, { type: "array" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsxUtils.sheet_to_json(worksheet, { raw: false });
}

// Function to parse CSV file
async function parseCSV(text: string) {
  return parsesCSV(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = decoded.id;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file type
    const fileType = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(fileType!)) {
      return NextResponse.json(
        { error: "Please upload a CSV or Excel file" },
        { status: 400 }
      );
    }

    // Parse file based on type
    let records;
    if (fileType === "csv") {
      const text = await file.text();
      records = await parseCSV(text);
    } else {
      const buffer = await file.arrayBuffer();
      records = await parseExcel(buffer);
    }

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: "No valid records found in file" },
        { status: 400 }
      );
    }

    // Validate all contacts before processing
    const validationResults = records
      .map((row: any, index) => {
        const normalizedContact = normalizeContact(row);
        const result = ContactSchema.safeParse(normalizedContact);

        if (!result.success) {
          return {
            row: index + 2, // Adding 2 to account for 1-based indexing and header row
            errors: result.error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          };
        }
        return null;
      })
      .filter(Boolean);

    // If there are any validation errors, return them
    if (validationResults.length > 0) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResults,
        },
        { status: 400 }
      );
    }

    // Process valid contacts within a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check for duplicate emails before processing
      const normalizedRecords = records.map((row) => normalizeContact(row));
      const emails = normalizedRecords
        .map((record) => record.email)
        .filter((email): email is string => email !== undefined); // Ensures only strings are in the array

      const existingContacts = await tx.contact.findMany({
        where: {
          email: { in: emails }, // Now 'emails' is guaranteed to be a string[]
          deleted: false,
        },
        select: { email: true },
      });

      if (existingContacts.length > 0) {
        throw new Error(
          `Duplicate emails found: ${existingContacts
            .map((c) => c.email)
            .join(", ")}`
        );
      }

      const createdContacts = await Promise.all(
        normalizedRecords.map((contact) =>
          tx.contact.create({
            data: {
              userId: parseInt(userId),
              name: contact.name!,
              email: contact.email!,
              phoneNumber: contact.phoneNumber!,
              address: contact.address,
              timezone: contact.timezone!,
            },
          })
        )
      );

      return createdContacts;
    });

    return NextResponse.json(
      {
        message: "Contacts imported successfully",
        count: result.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Import error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle duplicate emails error
    if (error.message?.includes("Duplicate emails found")) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 }
      );
    }

    // Handle unique constraint violations
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error: "Duplicate entries found",
          details: `Duplicate value for ${error.meta?.target}`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to import contacts",
      },
      { status: 500 }
    );
  }
}
