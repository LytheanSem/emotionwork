import z from "zod";

// Centralized password validation schema
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain an uppercase letter, a lowercase letter, and a number"
  );

export const loginSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(63, "Username must be less than 63 characters")
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "Username can only contain lowercase letters, numbers and hyphens. It must start and end with a letter or number"
    )
    .refine(
      (val) => !val.includes("--"),
      "Username cannot contain consecutive hyphens"
    )
    .transform((val) => val.toLowerCase()),
});

export const verificationCodeSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: passwordSchema,
  code: z.string().length(6, "Verification code must be exactly 6 digits"),
});
