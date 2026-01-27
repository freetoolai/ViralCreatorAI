import { NextResponse } from 'next/server';
import { dataStore } from '@/lib/store';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    try {
        const campaigns = dataStore.getCampaigns(clientId || undefined);
        return NextResponse.json(campaigns);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        dataStore.addCampaign(body);
        return NextResponse.json({ message: 'Campaign created successfully' }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
    }
}
