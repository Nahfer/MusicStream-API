import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import jwt from 'jsonwebtoken';
import { loginSchema } from "../../../../../middleware/Validation";

export async function POST(request: NextRequest) {
    try {
        const credentials = await request.json();

        const validation = loginSchema.safeParse(credentials);

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

        if (!existingUser) {
            return NextResponse.json(
                { error: "User with this email doesn't exist" },
                { status: 404 }
            );
        }

        const bcrypt = require('bcrypt');

        const isMatch = await bcrypt.compare(credentials.password, existingUser.password);

        if (!isMatch) {
            return NextResponse.json(
                { error: "Invalid password" },
                { status: 401 }
            );
        }

        const token = jwt.sign(
            { name: existingUser.name, userid: existingUser.aid },
            "Ironclad",
            { expiresIn: "1h" }
        );

        return NextResponse.json(
            { success: 'Login successful', token },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Unknown error: Could not login" },
            { status: 500 }
        );
    }
}