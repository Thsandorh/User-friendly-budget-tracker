import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { startOfDay, endOfDay } from 'date-fns';

export const dynamic = 'force-dynamic'

// GET /api/daily-limits - Get daily limits
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

    // If specific date requested, get that day's limit
    if (dateParam) {
      const date = new Date(dateParam);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const dailyLimit = await db.dailyLimit.findFirst({
        where: {
          userId: user.id,
          date: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      // Calculate today's spending
      const todaySpending = await db.transaction.aggregate({
        where: {
          userId: user.id,
          type: 'expense',
          date: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
        _sum: {
          amount: true,
        },
      });

      return NextResponse.json({
        limit: dailyLimit,
        spending: todaySpending._sum.amount || 0,
        remaining: dailyLimit ? dailyLimit.amount - (todaySpending._sum.amount || 0) : null,
        exceeded: dailyLimit ? (todaySpending._sum.amount || 0) > dailyLimit.amount : false,
      });
    }

    // Otherwise get all active limits
    const dailyLimits = await db.dailyLimit.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(dailyLimits);
  } catch (error) {
    console.error('Error fetching daily limits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily limits' },
      { status: 500 }
    );
  }
}

// POST /api/daily-limits - Create/update daily limit
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
    const dayStart = startOfDay(limitDate);

    // Upsert - update if exists, create if not
    const dailyLimit = await db.dailyLimit.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: dayStart,
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
        date: dayStart,
        notes,
        isActive: true,
      },
    });

    return NextResponse.json(dailyLimit);
  } catch (error) {
    console.error('Error creating daily limit:', error);
    return NextResponse.json(
      { error: 'Failed to create daily limit' },
      { status: 500 }
    );
  }
}

// DELETE /api/daily-limits - Delete daily limit
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

    await db.dailyLimit.delete({
      where: {
        id,
        userId: user.id, // Ensure user owns this limit
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting daily limit:', error);
    return NextResponse.json(
      { error: 'Failed to delete daily limit' },
      { status: 500 }
    );
  }
}
