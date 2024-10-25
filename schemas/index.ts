import * as z from "zod";

export const ContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  phoneNumber: z.string().min(10).max(14),
  address: z.string(),
  timezone: z.string().min(1, "Timezone is required"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deleted: z.boolean().default(false).optional(),
});
export const ContactUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email(),
  phoneNumber: z.string().min(10).max(14).optional(),
  address: z.string().optional(),
  timezone: z.string().min(1, "Timezone is required").optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deleted: z.boolean().default(false).optional(),
});




export const ResetSchema = z.object({
  email: z.string().email(),
});

export const NewPasswordSchema = z.object({
  password: z.string().min(1, {
    message: "Password is Required!",
  }),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, {
    message: "Password is Required!",
  }),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, {
    message: "password should be 6+ char",
  }),
  name: z.string().min(3, {
    message: "name should be 3+ char",
  }),
});
