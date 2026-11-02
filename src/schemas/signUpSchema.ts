import { z } from 'zod';
export const nameValidation = z.string().trim().min(2, 'Name must be at least 2 characters long.').max(100);
export const usernameValidation = z.string().trim().min(3, 'Username must be at least 3 characters long.').max(20, 'Username must be at most 20 characters long.').regex(/^[a-zA-Z0-9_]+$/, 'Use letters, numbers, and underscores only.');
export const emailValidation = z.string().trim().email('Please use a valid email address.');
export const passwordValidation = z.string().min(8, 'Password must be at least 8 characters long.').max(20, 'Password must be at most 20 characters long.');
export const signUpSchema = z.object({ name: nameValidation, username: usernameValidation, email: emailValidation, password: passwordValidation });
