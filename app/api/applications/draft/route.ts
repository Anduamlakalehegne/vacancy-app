import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/db"
import { Application } from "@/lib/models/application"

// POST handler to save a draft application
export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await req.json()
    console.log("Saving draft application:", body)

    // Connect to database
    await connectToDatabase()

    // Try to get user ID from different possible locations
    const userId = session.user.id || session.user.sub || (session as any).userId || (session as any).id || body.userId

    // If we still don't have a userId, try to find by email
    if (!userId && session.user.email) {
      const client = await (await import("@/lib/mongodb")).default
      const db = client.db("wegagen_bank")
      const user = await db.collection("users").findOne({ email: session.user.email })

      if (user) {
        const userIdFromEmail = user._id.toString()
        console.log(`Found user ID ${userIdFromEmail} by email lookup for draft`)

        // Check if user already has a draft for this vacancy
        let application = await Application.findOne({
          userId: userIdFromEmail,
          vacancyId: body.vacancyId,
          status: "draft",
        })

        if (application) {
          // Update existing draft
          Object.assign(application, {
            ...body,
            userId: userIdFromEmail,
            lastUpdated: new Date(),
          })
        } else {
          // Create new draft
          application = new Application({
            userId: userIdFromEmail,
            vacancyId: body.vacancyId,
            ...body,
            status: "draft",
            lastUpdated: new Date(),
          })
        }

        // Save draft
        await application.save()

        return NextResponse.json({ message: "Draft saved successfully", applicationId: application._id })
      }
    }

    // Log the session structure to debug
    console.log("Session structure for draft:", JSON.stringify(session, null, 2))
    console.log("Saving draft with userId:", userId)

    if (!userId) {
      return NextResponse.json(
        {
          error: "User ID not found in session",
          sessionInfo: {
            hasUser: !!session.user,
            userKeys: Object.keys(session.user || {}),
          },
        },
        { status: 400 },
      )
    }

    // Check if user already has a draft for this vacancy
    let application = await Application.findOne({
      userId: userId,
      vacancyId: body.vacancyId,
      status: "draft",
    })

    if (application) {
      // Update existing draft
      Object.assign(application, {
        ...body,
        userId: userId, // Ensure userId is set
        lastUpdated: new Date(),
      })
    } else {
      // Create new draft
      application = new Application({
        userId: userId,
        vacancyId: body.vacancyId,
        ...body,
        status: "draft",
        lastUpdated: new Date(),
      })
    }

    // Save draft
    await application.save()

    return NextResponse.json({ message: "Draft saved successfully", applicationId: application._id })
  } catch (error) {
    console.error("Error saving draft application:", error)
    return NextResponse.json(
      {
        error: "Failed to save draft",
        message: error instanceof Error ? error.message : "Unknown error",
        details: error,
      },
      { status: 500 },
    )
  }
}
