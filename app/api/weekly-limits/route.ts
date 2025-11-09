import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { startOfWeek, endOfWeek } from 'date-fns';

export const dynamic = 'force-dynamic'

// GET /api/weekly-limits - Get weekly limits
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

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    // If specific date requested, get that week's limit
    if (dateParam) {
      const date = new Date(dateParam);
      const weekStartDate = startOfWeek(date, { weekStartsOn: 1 }); // Monday
      const weekEndDate = endOfWeek(date, { weekStartsOn: 1 });

      const weeklyLimit = await db.weeklyLimit.findFirst({
        where: {
          userId: user.id,
          weekStart: weekStartDate,
        },
      });

      // Calculate this week's spending
      const weekSpending = await db.transaction.aggregate({
        where: {
          userId: user.id,
          type: 'expense',
          date: {
            gte: weekStartDate,
            lte: weekEndDate,
          },
        },
        _sum: {
          amount: true,
        },
      });

      return NextResponse.json({
        limit: weeklyLimit,
        spending: weekSpending._sum.amount || 0,
        remaining: weeklyLimit ? weeklyLimit.amount - (weekSpending._sum.amount || 0) : null,
        exceeded: weeklyLimit ? (weekSpending._sum.amount || 0) > weeklyLimit.amount : false,
      });
    }

    // Otherwise get all active limits
    const weeklyLimits = await db.weeklyLimit.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      orderBy: {
        weekStart: 'desc',
      },
    });

    return NextResponse.json(weeklyLimits);
  } catch (error) {
    console.error('Error fetching weekly limits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly limits' },
      { status: 500 }
    );
  }
}

// POST /api/weekly-limits - Create/update weekly limit
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
    const { amount, date, currency = 'HUF', notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    const limitDate = date ? new Date(date) : new Date();
    const weekStartDate = startOfWeek(limitDate, { weekStartsOn: 1 }); // Monday

    // Upsert - update if exists, create if not
    const weeklyLimit = await db.weeklyLimit.upsert({
      where: {
        userId_weekStart: {
          userId: user.id,
          weekStart: weekStartDate,
        },
      },
      update: {
        amount,
        currency,
        notes,
        isActive: true,
      },
      create: {
        userId: user.id,
        amount,
        currency,
        weekStart: weekStartDate,
        notes,
        isActive: true,
      },
    });

    return NextResponse.json(weeklyLimit);
  } catch (error) {
    console.error('Error creating weekly limit:', error);
    return NextResponse.json(
      { error: 'Failed to create weekly limit' },
      { status: 500 }
    );
  }
}

// DELETE /api/weekly-limits - Delete weekly limit
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
        { error: 'Limit ID is required' },
        { status: 400 }
      );
    }

    await db.weeklyLimit.delete({
      where: {
        id,
        userId: user.id, // Ensure user owns this limit
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting weekly limit:', error);
    return NextResponse.json(
      { error: 'Failed to delete weekly limit' },
      { status: 500 }
    );
  }
}
