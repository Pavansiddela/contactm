import { db } from "@/lib/db";
import crypto from "crypto";

export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const verificationToken = db.verificationToken.findFirst({
      where: {
        email,
      },
    });
    return verificationToken;
  } catch (error) {
    return null;
  }
};

// export const generateVerificationToken = async (email: string) => {
//   const token = crypto.randomInt(100_000, 1_000_000).toString();
//   const expires = new Date(new Date().getTime() + 3600 * 1000);
//   const existingToken = await getVerificationTokenByEmail(email);
//   if (existingToken) {
//     await db.verificationToken.delete({
//       where: {
//         id: existingToken.id,
//       },
//     });
//   }

//   console.log("here in above creating a token");
//   const verificationToken = await db.verificationToken.create({
//     data: {
//       token,
//       expires,
//       email,
//     },
//   });
//   return verificationToken;
// };

export const generateVerificationToken = async (email: string) => {
  try {
    const token = crypto.randomInt(100_000, 1_000_000).toString(); // Generate a 6-digit random token
    const expires = new Date(new Date().getTime() + 3600 * 1000); // Token expires in 1 hour

    // Check if a token already exists for this email
    const existingToken = await getVerificationTokenByEmail(email);

    if (existingToken) {
      // Delete the existing token if it exists to avoid duplicates
      await db.verificationToken.delete({
        where: {
          id: existingToken.id,
        },
      });
    }

    // Create a new verification token
    const verificationToken = await db.verificationToken.create({
      data: {
        token,
        expires,
        email,
      },
    });

    return verificationToken;
  } catch (error) {
    // Log the error and handle failures during token creation
    console.error("Error generating verification token:", error);
    throw new Error("Could not generate verification token");
  }
};


export const getVerificationTokenByToken = async (token: string) => {
    try {
      const verificationToken = db.verificationToken.findUnique({
        where: {
          token,
        },
      });
      return verificationToken;
    } catch (error) {
      return null;
    }
  };

  export const generateResetPassswordToken = async (email: string) => {
    const token = crypto.randomInt(100_000, 1_000_000).toString(); // Generate a 6-digit random token
    const expires = new Date(new Date().getTime() + 3600 * 1000);
  
    const existingToken = await getResetPasswordTokenByMail(email);
    if (existingToken) {
      await db.passwordResetToken.delete({
        where: {
          id: existingToken.id,
        },
      });
    }
    const resetToken = await db.passwordResetToken.create({
      data: {
        expires,
        email,
        token: token,
      },
    });
  
    return resetToken;
  };

  export const getResetPasswordTokenByMail = async (email: string) => {
    try {
      const verificationToken = db.passwordResetToken.findFirst({
        where: {
          email,
        },
      });
      return verificationToken;
    } catch (error) {
      return null;
    }
  };

  export const getResetPasswordTokenByToken = async (token: string) => {
    try {
      const verificationToken = db.passwordResetToken.findUnique({
        where: {
          token,
        },
      });
      return verificationToken;
    } catch (error) {
      return null;
    }
  };
  