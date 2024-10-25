import { getUserByEmail } from "@/data/user";
import { RegisterSchema } from "@/schemas";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { generateVerificationToken } from "@/data/token";
import { sendVerficationMail } from "@/lib/mail";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validate = RegisterSchema.safeParse(body);
    if (!validate.success) {
      return Response.json({
        error: validate.error,
      });
    }
    console.log(body);

    const { name, email, password } = validate.data;

    const user = await getUserByEmail(email);
    if (user) {
      return Response.json({
        error: "User Already Exists",
        user,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const verficationToken = await generateVerificationToken(email);
    // console.log({ verficationToken, newUser });
    //send mail to user
    await sendVerficationMail(
      verficationToken.email,
      verficationToken.token
    ).catch(console.error);

    return Response.json({
      Success: " User Created and Verify Your Email",
      newUser,
    });
  } catch (error: any) {
    console.log(error);
    return Response.json({ error });
  }
};
