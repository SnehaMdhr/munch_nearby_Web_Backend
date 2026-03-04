import z from "zod";
import { userSchema } from "../types/user.type"; 
export const CreateUserDto = userSchema.pick(
    {
        name:true, 
        email: true,
        role: true,
        password: true,
        imageUrl: true
    }
).extend(
    {
        password: z.string().min(8),
        confirmPassword: z.string().min(6)
    }
).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    }
)

export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const LoginUserDTO = z.object({
    email: z.email(),
    password: z.string().min(6)
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const UpdateUserDTO = userSchema.omit({ role: true }).partial();
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;

export const AdminUpdateUserDTO = userSchema.partial();
export type AdminUpdateUserDTO = z.infer<typeof AdminUpdateUserDTO>;

export const GoogleLoginDTO = z.object({
    token: z.string().min(10)
});

export type GoogleLoginDTO = z.infer<typeof GoogleLoginDTO>;


export const ResetPasswordDTO = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
}).refine(
    (data) => data.newPassword === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }
);

export type ResetPasswordDTO = z.infer<typeof ResetPasswordDTO>;

export const ChangePasswordDTO = z.object({
    oldPassword: z.string().min(6),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
}).refine(
    (data) => data.newPassword === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }
);

export type ChangePasswordDTO = z.infer<typeof ChangePasswordDTO>;
