import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { middleware } from "../../../../middleware/authentication";
import { playlistSchema } from "../../../../middleware/Validation";

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
        const userPlayList = await prisma.playlist.findMany({
            where: {
                creatorid: uid
            },
            select: {
                playlistTitle: true,
                numberOfTracks: true
            }
        });

        return NextResponse.json(
            { playLists: userPlayList },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const authorized = await middleware(request);
    if (!authorized) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const uid = authorized.userid as string;

    try {
        const body = await request.json();

        const validation = playlistSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed' },
                { status: 400 }
            );
        }

        const { playlistTitle, tracks } = validation.data;

        const newPlayList = await prisma.playlist.create({
            data: {
                playlistTitle,
                creatorid: uid,
                numberOfTracks: tracks.length,
                tracks: {
                    connect: tracks.map((tid: number) => ({ tid }))
                }
            },
            select: {
                pid: true,
                playlistTitle: true,
                numberOfTracks: true
            }
        });

        return NextResponse.json(
            { playList: newPlayList },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Unknown error' },
            { status: 500 }
        );
    }
}