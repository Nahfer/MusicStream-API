import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { middleware } from "../../../../../middleware/authentication";

export async function GET(
    request: NextRequest,
    { params }: { params: { artist_id: string } }
) {
    const authorized = await middleware(request);

    if (!authorized) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const artistId = decodeURIComponent(params.artist_id);

    try {
        const artistProfile = await prisma.artist.findUnique({
            where: {
                aid: artistId
            },
            select: {
                name: true,
                profileImageUrl: true,
                bio: true
            }
        });

        if (!artistProfile) {
            return NextResponse.json(
                { error: 'Artist not found' },
                { status: 404 }
            );
        }

        const artistAlbums = await prisma.albums.findMany({
            where: {
                artistid: artistId
            },
            select: {
                title: true,
                albumCover: true
            }
        });

        return NextResponse.json({
            artist: artistProfile,
            albums: artistAlbums
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Unknown error' },
            { status: 500 }
        );
    }
}