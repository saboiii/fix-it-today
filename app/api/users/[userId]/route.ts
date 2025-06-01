import { clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    const awaitedParams = await params;
    const userId = awaitedParams.userId;

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);

        // Select only the public data you want to expose
        const publicUserData = {
            id: user.id,
            fullName: user.fullName,
            imageUrl: user.imageUrl,
            createdAt: user.createdAt,
            // Do NOT include sensitive data like emailAddresses, phoneNumbers, privateMetadata, etc.
        };

        return NextResponse.json(publicUserData, { status: 200 });
    } catch (error: any) {
        console.error(`Error fetching user ${userId}:`, error);
        // Check for specific Clerk errors if needed, e.g., user not found
        if (error.status === 404 || error.clerkError) {
             return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}