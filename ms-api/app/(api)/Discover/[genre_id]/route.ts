import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { middleware } from "../../../../../middleware/authentication";

export async function GET(request: NextRequest, context: { params: Promise<{ genre_id: string }> }) {
    const params = await context.params;
    const genreId = decodeURIComponent(params.genre_id);

    const authorized = await middleware(request);
    if (!authorized) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const trackSearch = searchParams.get('track') || '';

        const trackList = await prisma.tracks.findMany({
            where: {
                genreid: genreId,
                ...(trackSearch && {
                    title: {
                        contains: trackSearch,
                        mode: 'insensitive'
                    }
                })
            },
            select: {
                title: true,
                artist: {
                    select: {
                        name: true
                    }
                },
                duration: true,
                genre: {
                    select: {
                        genre: true
                    }
                },
                lyrics: true,
                hostedDirectoryUrl: true
            },
            orderBy: [
                { title: 'asc' }
            ]
        });

        return NextResponse.json(
            { trackList: trackList },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Unknown error' },
            { status: 500 }
        );
    }
}