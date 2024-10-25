import { getUserByEmail } from "@/data/user";
import { LoginSchema } from "@/schemas";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const validate = LoginSchema.safeParse(body);

  if (!validate.success) {
    return NextResponse.json(
      { error: "Invalid fields" },
      { status: 400 } // Bad Request
    );
  }

  const { email, password } = validate.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return NextResponse.json(
      { error: "Invalid Credentials" },
      { status: 401 } // Unauthorized
    );
  }

  // Check if the password is correct
  const isPasswordValid = await bcrypt.compare(password, existingUser.password);

  if (!isPasswordValid) {
    return Response.json(
      { error: "Invalid Credentials" },
      { status: 401 } // Unauthorized
    );
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: existingUser.id, email: existingUser.email },

    JWT_SECRET
  );

  // Set token as an HTTP-only cookie
  const response = NextResponse.json(
    { success: "Login successful" },
    { status: 200 } // OK
  );

  response.cookies.set("token", token, {
    httpOnly: true,
    path: "/", // Cookie path
  });

  return response;
};
