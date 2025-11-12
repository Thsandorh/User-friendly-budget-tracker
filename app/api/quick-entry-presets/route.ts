import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic'

// Default presets for new users
const DEFAULT_PRESETS = [
  { name: 'Coffee', nameHu: 'Kávé', amount: 450, icon: '☕', sortOrder: 0 },
  { name: 'Groceries', nameHu: 'Bevásárlás', amount: 5000, icon: '🛒', sortOrder: 1 },
  { name: 'Gas', nameHu: 'Benzin', amount: 8000, icon: '⛽', sortOrder: 2 },
  { name: 'Lunch', nameHu: 'Ebéd', amount: 1500, icon: '🍕', sortOrder: 3 },
];

// GET /api/quick-entry-presets - Get all quick entry presets for user
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let presets = await db.quickEntryPreset.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    // If user has no presets, create defaults
    if (presets.length === 0) {
      const createdPresets = await Promise.all(
        DEFAULT_PRESETS.map((preset) =>
          db.quickEntryPreset.create({
            data: {
              ...preset,
              userId: user.id,
            },
          })
        )
      );
      presets = createdPresets;
    }

    return NextResponse.json(presets);
  } catch (error) {
    console.error('Error fetching quick entry presets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quick entry presets' },
      { status: 500 }
    );
  }
}

// POST /api/quick-entry-presets - Create or update a quick entry preset
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { id, name, nameHu, amount, icon, sortOrder } = body;

    if (!name || !nameHu || !amount || !icon) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update if ID provided, otherwise create
    const preset = id
      ? await db.quickEntryPreset.update({
          where: { id, userId: user.id },
          data: { name, nameHu, amount, icon, sortOrder },
        })
      : await db.quickEntryPreset.create({
          data: {
            userId: user.id,
            name,
            nameHu,
            amount,
            icon,
            sortOrder: sortOrder ?? 0,
          },
        });

    return NextResponse.json(preset);
  } catch (error) {
    console.error('Error saving quick entry preset:', error);
    return NextResponse.json(
      { error: 'Failed to save quick entry preset' },
      { status: 500 }
    );
  }
}

// DELETE /api/quick-entry-presets - Delete a quick entry preset
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Preset ID is required' },
        { status: 400 }
      );
    }

    await db.quickEntryPreset.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quick entry preset:', error);
    return NextResponse.json(
      { error: 'Failed to delete quick entry preset' },
      { status: 500 }
    );
  }
}
