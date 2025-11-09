import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { startOfMonth, endOfMonth } from 'date-fns';

export const dynamic = 'force-dynamic'

// GET /api/monthly-limits - Get monthly limits
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

    // If specific date requested, get that month's limit
    if (dateParam) {
      const date = new Date(dateParam);
      const monthStartDate = startOfMonth(date);
      const monthEndDate = endOfMonth(date);

      const monthlyLimit = await db.monthlyLimit.findFirst({
        where: {
          userId: user.id,
          monthStart: monthStartDate,
        },
      });

      // Calculate this month's spending
      const monthSpending = await db.transaction.aggregate({
        where: {
          userId: user.id,
          type: 'expense',
          date: {
            gte: monthStartDate,
            lte: monthEndDate,
          },
        },
        _sum: {
          amount: true,
        },
      });

      return NextResponse.json({
        limit: monthlyLimit,
        spending: monthSpending._sum.amount || 0,
        remaining: monthlyLimit ? monthlyLimit.amount - (monthSpending._sum.amount || 0) : null,
        exceeded: monthlyLimit ? (monthSpending._sum.amount || 0) > monthlyLimit.amount : false,
      });
    }

    // Otherwise get all active limits
    const monthlyLimits = await db.monthlyLimit.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      orderBy: {
        monthStart: 'desc',
      },
    });

    return NextResponse.json(monthlyLimits);
  } catch (error) {
    console.error('Error fetching monthly limits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monthly limits' },
      { status: 500 }
    );
  }
}

// POST /api/monthly-limits - Create/update monthly limit
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
    const monthStartDate = startOfMonth(limitDate);

    // Upsert - update if exists, create if not
    const monthlyLimit = await db.monthlyLimit.upsert({
      where: {
        userId_monthStart: {
          userId: user.id,
          monthStart: monthStartDate,
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
        monthStart: monthStartDate,
        notes,
        isActive: true,
      },
    });

    return NextResponse.json(monthlyLimit);
  } catch (error) {
    console.error('Error creating monthly limit:', error);
    return NextResponse.json(
      { error: 'Failed to create monthly limit' },
      { status: 500 }
    );
  }
}

// DELETE /api/monthly-limits - Delete monthly limit
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

    await db.monthlyLimit.delete({
      where: {
        id,
        userId: user.id, // Ensure user owns this limit
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting monthly limit:', error);
    return NextResponse.json(
      { error: 'Failed to delete monthly limit' },
      { status: 500 }
    );
  }
}
