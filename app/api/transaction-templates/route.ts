import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic'

// GET /api/transaction-templates - Get all templates for current user
export async function GET(request: NextRequest) {
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

    const templates = await db.transactionTemplate.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      include: {
        category: true,
      },
      orderBy: [
        { useCount: 'desc' }, // Most used first
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching transaction templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/transaction-templates - Create new template
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
    const { name, amount, description, type, icon = '⭐', color = '#3b82f6', categoryId } = body;

    if (!name || !amount || !description || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const template = await db.transactionTemplate.create({
      data: {
        userId: user.id,
        name,
        amount,
        description,
        type,
        icon,
        color,
        categoryId: categoryId || null,
        isActive: true,
        useCount: 0,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error creating transaction template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

// DELETE /api/transaction-templates - Delete template
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
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    await db.transactionTemplate.delete({
      where: {
        id,
        userId: user.id, // Ensure user owns this template
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
