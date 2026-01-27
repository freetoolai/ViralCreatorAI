import { NextResponse } from 'next/server';
import { dataStore } from '@/lib/store';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const influencer = dataStore.getInfluencer(id);
        if (!influencer) {
            return NextResponse.json({ error: 'Influencer not found' }, { status: 404 });
        }
        return NextResponse.json(influencer);
    } catch (_error) {
        return NextResponse.json({ error: 'Failed to fetch influencer' }, { status: 500 });
    }
}
