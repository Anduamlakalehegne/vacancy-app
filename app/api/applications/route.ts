import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/db"
import { Application } from "@/lib/models/application"

export async function GET(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession()
    console.log("Session in GET applications:", session)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user ID from session with multiple fallbacks
    const userId = session.user.id || session.user.sub || (session as any).userId

    if (!userId) {
      console.error("No user ID in session:", session)

      // If we have an email, try to find the user by email as a last resort
      if (session.user.email) {
        const client = await (await import("@/lib/mongodb")).default
        const db = client.db("wegagen_bank")
        const user = await db.collection("users").findOne({ email: session.user.email })

        if (user) {
          const userIdFromEmail = user._id.toString()
          console.log(`Found user ID ${userIdFromEmail} by email lookup`)

          // Continue with this user ID
          return await fetchApplicationsForUser(userIdFromEmail, req)
        }
      }

      return NextResponse.json(
        {
          error: "User ID not found in session",
          sessionInfo: JSON.stringify(session),
        },
        { status: 400 },
      )
    }

    return await fetchApplicationsForUser(userId, req)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch applications",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Helper function to fetch applications for a user
async function fetchApplicationsForUser(userId: string, req: NextRequest) {
  // Connect to database
  await connectToDatabase()

  // Get query parameters
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const vacancyId = searchParams.get("vacancyId")

  // Build query
  const query: any = { userId }
  if (status) query.status = status
  if (vacancyId) query.vacancyId = vacancyId

  console.log("Fetching applications with query:", query)

  // Fetch applications
  const applications = await Application.find(query).sort({ lastUpdated: -1 }).lean()

  console.log(`Found ${applications.length} applications`)

  return NextResponse.json(applications)
}

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession()
    console.log("Session in POST application:", session)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user ID from session with multiple fallbacks
    const userId = session.user.id || session.user.sub || (session as any).userId

    if (!userId) {
      console.error("No user ID in session:", session)

      // If we have an email, try to find the user by email as a last resort
      if (session.user.email) {
        const client = await (await import("@/lib/mongodb")).default
        const db = client.db("wegagen_bank")
        const user = await db.collection("users").findOne({ email: session.user.email })

        if (user) {
          const userIdFromEmail = user._id.toString()
          console.log(`Found user ID ${userIdFromEmail} by email lookup`)

          // Continue with this user ID
          return await createApplicationForUser(userIdFromEmail, req)
        }
      }

      return NextResponse.json(
        {
          error: "User ID not found in session",
          sessionInfo: JSON.stringify(session),
        },
        { status: 400 },
      )
    }

    return await createApplicationForUser(userId, req)
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json(
      {
        error: "Failed to submit application",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Helper function to create an application for a user
async function createApplicationForUser(userId: string, req: NextRequest) {
  // Parse request body
  const body = await req.json()

  // Connect to database
  await connectToDatabase()

  // Check if user already applied for this vacancy
  const existingApplication = await Application.findOne({
    userId,
    vacancyId: body.vacancyId,
  }).lean()

  if (existingApplication && existingApplication.status === "submitted") {
    return NextResponse.json({ error: "You have already applied for this position" }, { status: 409 })
  }

  // Create or update application
  const application = existingApplication
    ? await Application.findByIdAndUpdate(
        existingApplication._id,
        {
          ...body,
          userId,
          status: "submitted",
          submittedAt: new Date(),
          lastUpdated: new Date(),
        },
        { new: true },
      )
    : await Application.create({
        ...body,
        userId,
        status: "submitted",
        submittedAt: new Date(),
        lastUpdated: new Date(),
      })

  console.log("Application saved:", application)

  return NextResponse.json(
    { message: "Application submitted successfully", applicationId: application._id },
    { status: 201 },
  )
}
