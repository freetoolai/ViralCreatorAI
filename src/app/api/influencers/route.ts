import { NextResponse } from 'next/server';
import { dataStore } from '@/lib/store';

export async function GET() {
    try {
        const influencers = dataStore.getInfluencers();
        return NextResponse.json(influencers);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch influencers' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        dataStore.addInfluencer(body);
        return NextResponse.json({ message: 'Influencer added successfully' }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add influencer' }, { status: 500 });
    }
}
