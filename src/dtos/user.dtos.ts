import z from "zod";
import { userSchema } from "../types/user.type"; 
export const CreateUserDto = userSchema.pick(
    {
        name:true, 
        email: true,
        password: true
    }
).extend(
    {
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