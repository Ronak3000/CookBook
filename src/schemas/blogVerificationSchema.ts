import { z } from 'zod';
export const BlogVerificationSchema = z.object({
  title: z.string().trim().min(3, 'Give your recipe a title of at least 3 characters.').max(200),
  bodyOfBlog: z.string().trim().min(10, 'Add at least 10 characters to tell your recipe’s story.').max(50000),
});
