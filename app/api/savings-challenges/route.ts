import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic'

// GET /api/savings-challenges - Get all savings challenges for user
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

    const challenges = await db.savingsChallenge.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [
        { isCompleted: 'asc' },
        { endDate: 'asc' },
      ],
    });

    return NextResponse.json(challenges);
  } catch (error) {
    console.error('Error fetching savings challenges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch savings challenges' },
      { status: 500 }
    );
  }
}

// POST /api/savings-challenges - Create a new savings challenge
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
    const {
      name,
      description,
      targetAmount,
      endDate,
      reward,
      icon = '🏆',
      color = '#10b981',
    } = body;

    if (!name || !description || !targetAmount || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const challenge = await db.savingsChallenge.create({
      data: {
        userId: user.id,
        name,
        description,
        targetAmount,
        currentAmount: 0,
        endDate: new Date(endDate),
        reward,
        icon,
        color,
        isCompleted: false,
      },
    });

    return NextResponse.json(challenge);
  } catch (error) {
    console.error('Error creating savings challenge:', error);
    return NextResponse.json(
      { error: 'Failed to create savings challenge' },
      { status: 500 }
    );
  }
}

// DELETE /api/savings-challenges - Delete a savings challenge
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
    const challengeId = searchParams.get('id');

    if (!challengeId) {
      return NextResponse.json(
        { error: 'Challenge ID is required' },
        { status: 400 }
      );
    }

    await db.savingsChallenge.delete({
      where: {
        id: challengeId,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting savings challenge:', error);
    return NextResponse.json(
      { error: 'Failed to delete savings challenge' },
      { status: 500 }
    );
  }
}
