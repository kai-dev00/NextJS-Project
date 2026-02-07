import { z } from "zod";

export const userFormSchema = z
  .object({
    id: z.string().optional(),
    email: z.string().email("Invalid email address").optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    roleId: z.string().min(1, "Role is required"),
    isActive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // Only validate firstName/lastName when id is not present (invite mode)
    if (!data.id) {
      if (!data.firstName || data.firstName.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "First name is required",
          path: ["firstName"],
        });
      }
      if (!data.lastName || data.lastName.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Last name is required",
          path: ["lastName"],
        });
      }

      if (!data.email || data.email.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Email is required",
          path: ["email"],
        });
      }
    }
  });

export type UserFormValues = z.infer<typeof userFormSchema>;
