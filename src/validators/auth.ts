import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(5, { message: "Username must be at least 5 characters long" })
      .max(20, { message: "Username must not exceed 20 characters" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(20, { message: "Password must be at most 20 characters long" }),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(5, { message: "Username must be at least 5 characters long" })
      .max(20, { message: "Username must not exceed 20 characters" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(20, { message: "Password must be at most 20 characters long" }),
    email: z.string().email({ message: "Invalid email address" }),
  }),
});
