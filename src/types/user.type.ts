import z, { email } from "zod";

export const userSchema = z.object({
    email: z.email().min(5),
    password: z.string().min(8),
    name: z.string().optional(),
    role: z.enum(["Customer","Restaurant Owner", "admin"]).default("Customer"),
    imageUrl: z.string().optional() 
});

export type UserType = z.infer<typeof userSchema>;