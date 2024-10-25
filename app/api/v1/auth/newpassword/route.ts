import { getResetPasswordTokenByToken } from "@/data/token";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";
import { NewPasswordSchema } from "@/schemas";
import { NextRequest, NextResponse } from "next/server";

export const POST:any = async (req: NextRequest) => {
  const tokenreq = req.nextUrl;
  const token = tokenreq.searchParams.get("token");
  const body = await req.json();

  const validate = NewPasswordSchema.safeParse(body);
  if (!validate.success) {
    return Response.json({
      error: validate.error,
    });
  }
  const { password } = validate.data;
  const existingToken = await getResetPasswordTokenByToken(token!);

  if (!existingToken)
    return {
      error: "Invalid Token",
    };
  const hasExpired = existingToken.expires < new Date();
  console.log(hasExpired);

  if (hasExpired) return Response.json({ error: "Token is expired" },{status:404});

  const existingUser = await getUserByEmail(existingToken.email);
  if (!existingUser)
    return Response.json({ error: "Email not existing in db" },{status:404});

  //creating a hashed password

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      password: hashedPassword,
    },
  });
  await db.passwordResetToken.delete({
    where: {
      id: existingToken.id,
    },
  });

  return Response.json(
    { success: "Password Reset Completed" },
    { status: 200 } // OK
  );
};
