import {z} from "zod"

export const searchWordSchema = z.object({
    searchWord: z.string().regex(/^[a-zA-Z\s]+$/, {
        message: "Only alphabetic characters are allowed",
      })
})