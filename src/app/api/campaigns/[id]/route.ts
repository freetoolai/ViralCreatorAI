import { NextResponse } from 'next/server';
import { dataStore } from '@/lib/store';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const campaign = dataStore.getCampaign(id);
        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }
        return NextResponse.json(campaign);
    } catch (_error) {
        return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 });
    }
}
