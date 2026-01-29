import { NextResponse } from 'next/server';
import { dataStore } from '@/lib/store';

export async function GET() {
    try {
        const clients = dataStore.getClients();
        return NextResponse.json(clients);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        dataStore.addClient(body);
        return NextResponse.json({ message: 'Client added successfully' }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Failed to add client' }, { status: 500 });
    }
}
