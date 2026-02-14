import { NextResponse } from 'next/server';
import { dataStore } from '@/lib/store';

export async function GET() {
    try {
        const clients = await dataStore.getClients();
        return NextResponse.json(clients);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Check if we already have this client (update vs add)
        const clients = await dataStore.getClients();
        const existing = clients.find(c => c.id === body.id);

        if (existing) {
            await dataStore.updateClient(body.id, body);
            return NextResponse.json({ message: 'Client updated successfully' });
        } else {
            await dataStore.addClient(body);
            return NextResponse.json({ message: 'Client added successfully' }, { status: 201 });
        }
    } catch {
        return NextResponse.json({ error: 'Failed to process client' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await dataStore.deleteClient(id);
        return NextResponse.json({ message: 'Client deleted successfully' });
    } catch {
        return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
    }
}
