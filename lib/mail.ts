import nodemailer from "nodemailer";
import { liveUrl } from "./utils";

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
  const confirmLink = `${liveUrl}/api/v1/auth/emailverify?token=${token}`;
  const info = await transporter.sendMail({
    from: {
      name: "Leo",
      address: process.env.USER_MAIL!,
    },
    to: email,
    subject: "Verify Your Email Using Below Link ✔",
    text: confirmLink,
    html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        /* Reset styles */
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            line-height: 1.6;
            background-color: #f4f4f4;
        }

        /* Container styles */
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        /* Email card styles */
        .email-card {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 40px;
            margin: 20px 0;
        }

        /* Logo and header styles */
        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }

        /* Content styles */
        .content {
            margin-bottom: 30px;
        }

        h1 {
            color: #1e293b;
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
        }

        p {
            color: #475569;
            font-size: 16px;
            margin-bottom: 20px;
        }

        /* Button styles */
        .button-container {
            text-align: center;
            margin: 30px 0;
        }

        .verify-button {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: bold;
            text-align: center;
        }

        .verify-button:hover {
            background-color: #1d4ed8;
        }

        /* Footer styles */
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }

        .footer p {
            color: #64748b;
            font-size: 14px;
        }

        /* Alternative link styles */
        .alternative-link {
            word-break: break-all;
            color: #2563eb;
            font-size: 14px;
        }

        /* Responsive styles */
        @media only screen and (max-width: 600px) {
            .container {
                padding: 10px;
            }

            .email-card {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-card">
            <div class="header">
                <div class="logo">Contact Management</div>
                <p>by Pavan Siddela</p>
            </div>
            
            <div class="content">
                <h1>Verify Your Email Address</h1>
                <p>Thank you for signing up! To complete your registration and start managing your contacts, please verify your email address by clicking the button below:</p>
                
                <div class="button-container">
                    <a href="${confirmLink}" class="verify-button">Verify Email Address</a>
                </div>
                
                <p>If the button above doesn't work, you can also click the link below:</p>
                <p class="alternative-link">${confirmLink}</p>
                
                <p>This verification link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
            </div>
            
            <div class="footer">
                <p>© 2024 Contact Management. All rights reserved.</p>
                <p>This is an automated email, please do not reply.</p>
            </div>
        </div>
    </div>
</body>
</html>`,
  });

  console.log("Message sent: %s", info.messageId);
}

export async function sendResetPasswordOtp(email: string, token: string) {
  // Send mail with defined transport object
  const confirmLink = `${liveUrl}/api/v1/auth/newpassword?token=${token}`;
  const info = await transporter.sendMail({
    from: {
      name: "Contact Management By Pavan Siddela",
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
