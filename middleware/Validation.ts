import * as z from "zod";

export const registerSchema = z.object({
    email: z.email('Invalid email'),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().regex(/^[A-Za-z\s]+$/, "Only A-Z, a-z characters allowed"),
    gender: z.enum(["MALE", "FEMALE", "UNDEFINED"]),
    type: z.enum(['ARTIST', 'LISTENER']),
    bio: z.string(),
});

export const loginSchema = z.object({
    email: z.email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters")
});

export const playlistSchema = z.object({
    playlistTitle: z.string(),
    tracks: z.array(z.number().int()).nonempty()
});