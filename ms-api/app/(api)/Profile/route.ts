import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { middleware } from "../../../../middleware/authentication";

export async function GET(request: NextRequest) {
    const authorized = await middleware(request);
    if (!authorized) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const uid = authorized.userid;

    try {
        const artistProfile = await prisma.artist.findUnique({
            where: {
                aid: uid
            },
            select: {
                name: true,
                profileImageUrl: true,
                bio: true,
                email: true,
                type: true
            }
        });

        if (!artistProfile) {
            return NextResponse.json(
                { error: 'User profile not found' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { artist: artistProfile },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Unknown error' },
            { status: 500 }
        );
    }
}