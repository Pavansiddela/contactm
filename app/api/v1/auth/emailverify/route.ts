import {
  generateVerificationToken,
  getVerificationTokenByToken,
} from "@/data/token";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";
import { sendVerficationMail } from "@/lib/mail";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const tokenreq = req.nextUrl;
  const token = tokenreq.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is missing" }, { status: 400 });
  }

  const existingToken = await getVerificationTokenByToken(token);
  if (!existingToken) {
    return NextResponse.json({ error: "Token is missing in db" }, { status: 400 });
  }

  const hasExpired = existingToken.expires < new Date();
  console.log(hasExpired);

  if (hasExpired) {
    const verificationToken = await generateVerificationToken(existingToken.email);
    await sendVerficationMail(verificationToken.email, verificationToken.token).catch(console.error);

    return NextResponse.json({
      error: "Token is expired and new OTP link generated",
    }, { status: 400 });
  }

  const existingUser = await getUserByEmail(existingToken.email);
  if (!existingUser) {
    return NextResponse.json({ error: "Email not existing in db" }, { status: 404 });
  }

  await db.user.update({
    where: { id: existingUser.id },
    data: {
      emailverified: true,
      email: existingToken.email,
    },
  });

  await db.verificationToken.delete({
    where: { id: existingToken.id },
  });

  return NextResponse.json({ success: "Email verified Successfully" }, { status: 200 });
};