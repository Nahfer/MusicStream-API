import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { registerSchema } from "../../../../../middleware/Validation";

export async function POST(request: NextRequest) {
    try {
        const credentials = await request.json();

        const validation = registerSchema.safeParse(credentials);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed' },
                { status: 400 }
            );
        }

        const existingUser = await prisma.artist.findFirst({
            where: {
                email: credentials.email
            }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 409 }
            );
        }

        const { email, password, name, gender, type, bio } = credentials;

        const bcrypt = require('bcrypt');

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.artist.create({
            data: {
                email,
                password: hashedPassword,
                name,
                gender,
                type,
                bio,
            }
        });

        return NextResponse.json(
            { success: 'User successfully registered' },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Unknown error: could not register user" },
            { status: 500 }
        );
    }
}