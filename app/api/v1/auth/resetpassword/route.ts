import { generateResetPassswordToken } from "@/data/token";
import { getUserByEmail } from "@/data/user";
import { sendResetPasswordOtp } from "@/lib/mail";
import { ResetSchema } from "@/schemas";
import { NextRequest } from "next/server";



export const POST = async (req: NextRequest) => {
  //sending the password resetting token
  const body = await req.json();
  const validate = ResetSchema.safeParse(body);
  if (!validate.success) {
    return Response.json({
      error: validate.error,
    });
  }
  const { email } = body;
  console.log(email)

  const user = await getUserByEmail(email);

  if (!user) {
    return Response.json({
      error: "User Doesn't Exists",
      user,
    });
  }

  //generate token
  const token = await generateResetPassswordToken(email);
  console.log(token);

  //send mail

  await sendResetPasswordOtp(token.email, token.token);

  return Response.json({ success: "Reset Mail is Sent to Your Mail" });
};
