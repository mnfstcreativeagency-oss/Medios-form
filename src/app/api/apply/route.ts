import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const data = await req.json();

        const application = await Application.create(data);

        return NextResponse.json({ success: true, data: application }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 });
    }
}
