import { z } from "zod";

// Zod password validation rules (Min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character)
export const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

export const registerSchema = z
  .object({
    name: z
      .string({ required_error: "Name is required" })
      .min(2, "Name must be at least 2 characters long")
      .trim(),
    email: z
      .string({ required_error: "Email is required" })
      .email("Please provide a valid email address")
      .trim()
      .toLowerCase(),
    phone: z
      .string()
      .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format (e.g. +919876543210)")
      .optional()
      .or(z.literal("")),
    password: passwordSchema,
    confirmPassword: z.string({ required_error: "Confirm Password is required" }),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the Terms & Conditions and Privacy Policy" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.union([
  // Email + Password login
  z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Please provide a valid email address")
      .trim()
      .toLowerCase(),
    password: z.string({ required_error: "Password is required" }),
    rememberMe: z.boolean().optional(),
  }),
  // Phone + OTP login
  z.object({
    phone: z
      .string({ required_error: "Phone number is required" })
      .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format (e.g. +919876543210)"),
    code: z
      .string({ required_error: "OTP code is required" })
      .length(6, "OTP code must be exactly 6 digits"),
    rememberMe: z.boolean().optional(),
  }),
]);

export const requestOtpSchema = z.object({
  phone: z
    .string({ required_error: "Phone number is required" })
    .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format (e.g. +919876543210)"),
  purpose: z.enum(["register", "login", "verify"], {
    required_error: "Purpose is required",
  }),
});

export const verifyOtpSchema = z.object({
  phone: z
    .string({ required_error: "Phone number is required" })
    .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format (e.g. +919876543210)"),
  code: z
    .string({ required_error: "OTP code is required" })
    .length(6, "OTP code must be exactly 6 digits"),
  purpose: z.enum(["register", "login", "verify"], {
    required_error: "Purpose is required",
  }),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please provide a valid email address")
    .trim()
    .toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string({ required_error: "Confirm Password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    oldPassword: z.string({ required_error: "Current password is required" }),
    newPassword: passwordSchema,
    confirmNewPassword: z.string({ required_error: "Confirm password is required" }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format (e.g. +919876543210)")
    .optional()
    .or(z.literal("")),
  telegramChatId: z.string().optional().or(z.literal("")),
});

// Express validation middleware factory
export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      const fieldErrors = {};
      err.errors.forEach((e) => {
        const path = e.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(e.message);
      });
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: fieldErrors,
      });
    }
    next(err);
  }
};
