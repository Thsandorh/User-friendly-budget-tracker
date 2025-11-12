// Helper functions for auto-categorization
import { db } from "@/lib/db"

/**
 * Find matching category based on user's categorization rules
 * @param userId - The user ID
 * @param description - Transaction description to match against
 * @returns Category ID if match found, null otherwise
 */
export async function findMatchingCategory(
  userId: string,
  description: string
): Promise<string | null> {
  try {
    const rules = await db.categorizationRule.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    })

    const lowerDescription = description.toLowerCase()

    for (const rule of rules) {
      if (lowerDescription.includes(rule.pattern.toLowerCase())) {
        return rule.categoryId
      }
    }

    return null
  } catch (error) {
    console.error("Error finding matching category:", error)
    return null
  }
}
