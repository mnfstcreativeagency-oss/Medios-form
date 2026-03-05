import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const password = searchParams.get('password');

    if (password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const applications = await Application.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: applications });
    } catch (error) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 });
    }
}

export async function PATCH(req: Request) {
    try {
        const { id, status, converted, followUpNeeded, reason, password } = await req.json();

        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const updateData: Record<string, unknown> = {};
        if (status !== undefined) updateData.status = status;
        if (converted !== undefined) updateData.converted = converted;
        if (followUpNeeded !== undefined) updateData.followUpNeeded = followUpNeeded;
        if (reason !== undefined) updateData.reason = reason;

        const application = await Application.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!application) {
            return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: application });
    } catch (error) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 });
    }
}
