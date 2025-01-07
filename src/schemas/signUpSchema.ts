import {z} from "zod"

export const nameValidation = z.string()
    .min(2,"Name must be at leat 2 letters long")

export const usernameValidation = z
    .string()
    .min(3,{message:"Username must be at least 3 characters long"})
    .max(20,{message:'Username must be at most 20 characters long'})
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .trim();

export const emailValidation = z
    .string()
    .email({message:"Please use a valid email"})
    .trim();

export const passwordValidation = z
    .string()
    .min(8,{message:"Password must be at least 8 characters long"})
    .max(20,{message:'Password must be at most 20 characters long'})
    .trim();

export const signUpSchema = z.object({
    name: nameValidation,
    username: usernameValidation,
    email: emailValidation,
    password: passwordValidation
})