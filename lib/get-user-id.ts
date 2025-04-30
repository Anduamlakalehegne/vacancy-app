import clientPromise from "@/lib/mongodb"

/**
 * Helper function to get a user ID from various sources
 * with fallback to email lookup if needed
 */
export async function getUserId(session: any): Promise<string | null> {
  // Try to get user ID from session with multiple fallbacks
  const userId = session?.user?.id || session?.user?.sub || (session as any)?.userId || (session as any)?.id

  if (userId) {
    return userId
  }

  // If we have an email, try to find the user by email as a last resort
  if (session?.user?.email) {
    try {
      const client = await clientPromise
      const db = client.db("wegagen_bank")
      const user = await db.collection("users").findOne({ email: session.user.email })

      if (user) {
        return user._id.toString()
      }
    } catch (error) {
      console.error("Error looking up user by email:", error)
    }
  }

  return null
}
