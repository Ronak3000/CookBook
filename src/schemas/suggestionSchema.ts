import {z} from "zod"

export const suggetionSchema = z.object({
    ingredients: z.array(z.string()).nonempty(),
    cuisine: z.string().nonempty(),
    people: z.string().nonempty().default("1")
})