import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic'

// POST /api/transaction-templates/use - Create transaction from template
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
    const { templateId, amount: customAmount } = body;

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Get the template
    const template = await db.transactionTemplate.findUnique({
      where: {
        id: templateId,
        userId: user.id,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Create transaction from template
    const transaction = await db.transaction.create({
      data: {
        userId: user.id,
        amount: customAmount || template.amount,
        description: template.description,
        type: template.type,
        date: new Date(),
        categoryId: template.categoryId,
      },
      include: {
        category: true,
      },
    });

    // Increment use count
    await db.transactionTemplate.update({
      where: {
        id: templateId,
      },
      data: {
        useCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error using transaction template:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction from template' },
      { status: 500 }
    );
  }
}
