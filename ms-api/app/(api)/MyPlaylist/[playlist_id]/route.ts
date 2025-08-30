import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { middleware } from "../../../../../middleware/authentication";

export async function GET(
    request: NextRequest,
    { params }: { params: { playlist_id: string } }
) {
    const authorized = await middleware(request);

    if (!authorized) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const playlistId = decodeURIComponent(params.playlist_id);

    try {
        const { searchParams } = new URL(request.url);
        const trackSearch = searchParams.get('track') || '';

        const trackList = await prisma.tracks.findMany({
            where: {
                playlist: { some: { pid: playlistId } },
                ...(trackSearch && {
                    title: {
                        contains: trackSearch,
                        mode: 'insensitive'
                    }
                })
            },
            select: {
                title: true,
                artist: true,
                duration: true,
                genre: true,
                lyrics: true,
                hostedDirectoryUrl: true
            },
            orderBy: { title: 'asc' }
        });

        if (trackList.length === 0) {
            return NextResponse.json(
                { error: 'No tracks found in this playlist' },
                { status: 404 }
            );
        }

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
