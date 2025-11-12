import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic'

// POST /api/savings-challenges/update-progress - Update challenge progress
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
    const { challengeId, amount } = body;

    if (!challengeId || amount === undefined) {
      return NextResponse.json(
        { error: 'Challenge ID and amount are required' },
        { status: 400 }
      );
    }

    // Get the challenge
    const challenge = await db.savingsChallenge.findUnique({
      where: {
        id: challengeId,
        userId: user.id,
      },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Update the progress
    const newAmount = challenge.currentAmount + amount;
    const isCompleted = newAmount >= challenge.targetAmount;

    const updatedChallenge = await db.savingsChallenge.update({
      where: {
        id: challengeId,
      },
      data: {
        currentAmount: newAmount,
        isCompleted,
      },
    });

    return NextResponse.json(updatedChallenge);
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    return NextResponse.json(
      { error: 'Failed to update challenge progress' },
      { status: 500 }
    );
  }
}
