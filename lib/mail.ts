import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.USER_MAIL,
    pass: process.env.APP_PASSWORD,
  },
});

export async function sendVerficationMail(email: string, token: string) {
  const confirmLink = `http://localhost:3000/api/v1/auth/emailverify?token=${token}`;
  const info = await transporter.sendMail({
    from: {
      name: "Leo",
      address: process.env.USER_MAIL!,
    },
    to: email,
    subject: "Verify Your Email Using Below Link ✔",
    text: confirmLink,
    html: `<p> Click <a href="${confirmLink}"> here</a> for verify your email</p>`,
  });

  console.log("Message sent: %s", info.messageId);
}

export async function sendResetPasswordOtp(email: string, token: string) {
  // Send mail with defined transport object
  const confirmLink = `http://localhost:3000/api/v1/auth/newpassword?token=${token}`;
  const info = await transporter.sendMail({
    from: {
      name: "Leo",
      address: process.env.USER_MAIL!,
    },
    to: email,
    subject: "Password Resetting Code ⚙️",
    text: confirmLink,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #333;">Your Password Reset Instructions</h1>
          <p style="font-size: 16px; color: #555;">Hi there!</p>
          <p style="font-size: 16px; color: #555;">You requested a password reset. Please follow these instructions:</p>
          
          <ol style="font-size: 16px; color: #555; margin-left: 20px;">
            <li><strong>Your One-Time Password (OTP):</strong> <strong style="font-size: 24px;">${token}</strong></li>
            <li><strong>Reset Password Link:</strong> Here is the link you need to use:</li>
            <div style="background-color: #e7f3fe; padding: 10px; margin-bottom: 20px;">
              <code style="color:#333;">${confirmLink}</code>
            </div>
            <li><strong>Request Type:</strong> This is a <code>POST</code> request.</li>
            <li><strong>Request Body:</strong> You will need to send the following JSON body:</li>
            <pre style="background-color:#f9f9f9; border-radius:5px; padding:10px;">
{
  "password": "yourNewPasswordHere"
}
            </pre>
          </ol>

          <p style="font-size: 16px; color: #555;">If you did not request this change, you can safely ignore this email.</p>
          
          <hr style="margin: 20px 0;">
          
          <p style="font-size: 14px; color: #777;">This link will expire in <strong>30 minutes</strong>.</p>
        </div>
      </div>
    `,
  });

  console.log(info.messageId);
}
