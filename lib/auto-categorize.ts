import { db } from './db';

export async function autoCategorizeTransaction(
  userId: string,
  description: string
): Promise<string | null> {
  try {
    // Get all active rules for the user, ordered by priority
    const rules = await db.categorizationRule.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Match against description (case-insensitive)
    const lowerDesc = description.toLowerCase();

    for (const rule of rules) {
      if (lowerDesc.includes(rule.pattern.toLowerCase())) {
        return rule.categoryId;
      }
    }

    return null; // No matching rule found
  } catch (error) {
    console.error('Error auto-categorizing transaction:', error);
    return null;
  }
}
