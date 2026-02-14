import { NextResponse } from 'next/server';
import { dataStore } from '@/lib/store';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const influencer = await dataStore.getInfluencer(id);
        if (!influencer) {
            return NextResponse.json({ error: 'Influencer not found' }, { status: 404 });
        }
        return NextResponse.json(influencer);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch influencer' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await dataStore.deleteInfluencer(id);
        return NextResponse.json({ message: 'Influencer deleted successfully' });
    } catch {
        return NextResponse.json({ error: 'Failed to delete influencer' }, { status: 500 });
    }
}
