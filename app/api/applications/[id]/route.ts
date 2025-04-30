import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/db"
import { Application } from "@/lib/models/application"
import { applicationSchema } from "@/lib/validation/application-schema"

// GET handler to fetch a specific application
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user session
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await connectToDatabase()

    // Extract the ID from params and validate it
    const id = params.id
    if (!id) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 })
    }

    // Fetch application with lean() for better performance
    const application = await Application.findById(id).lean()

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Get the user ID from session with multiple fallbacks
    const userId = session.user.id || session.user.sub || (session as any).userId

    // Check if user is authorized to view this application
    if (!userId || (application.userId !== userId && session.user.role !== "admin")) {
      // If we have an email, try to find the user by email as a last resort
      if (session.user.email) {
        const client = await (await import("@/lib/mongodb")).default
        const db = client.db("wegagen_bank")
        const user = await db.collection("users").findOne({ email: session.user.email })

        if (user) {
          const userIdFromEmail = user._id.toString()

          // If this application belongs to the user found by email, allow access
          if (application.userId === userIdFromEmail || session.user.role === "admin") {
            return NextResponse.json(application)
          }
        }
      }

      return NextResponse.json({ error: "Unauthorized to view this application" }, { status: 403 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 })
  }
}

// PUT handler to update an application
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user session
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await connectToDatabase()

    // Fetch application
    const application = await Application.findById(params.id)

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Get the user ID from session with multiple fallbacks
    const userId = session.user.id || session.user.sub || (session as any).userId

    // Check if user is authorized to update this application
    if (!userId || application.userId !== userId) {
      // If we have an email, try to find the user by email as a last resort
      if (session.user.email) {
        const client = await (await import("@/lib/mongodb")).default
        const db = client.db("wegagen_bank")
        const user = await db.collection("users").findOne({ email: session.user.email })

        if (user) {
          const userIdFromEmail = user._id.toString()

          // If this application belongs to the user found by email, allow update
          if (application.userId === userIdFromEmail) {
            return await updateApplication(application, req)
          }
        }
      }

      return NextResponse.json({ error: "Unauthorized to update this application" }, { status: 403 })
    }

    return await updateApplication(application, req)
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json(
      {
        error: "Failed to update application",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Helper function to update an application
async function updateApplication(application: any, req: NextRequest) {
  // Check if application can be updated (only draft or submitted applications)
  if (!["draft", "submitted"].includes(application.status)) {
    return NextResponse.json({ error: "This application cannot be updated anymore" }, { status: 400 })
  }

  // Parse request body
  const body = await req.json()
  console.log("Received update data:", body)

  // Validate application data
  try {
    applicationSchema.parse(body)
  } catch (error) {
    console.error("Validation error:", error)
    return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 })
  }

  // Update application
  application.personalInfo = body.personalInfo
  application.education = body.education
  application.currentExperience = body.currentExperience
  application.previousExperience = body.previousExperience || []
  application.training = body.training || []
  application.languages = body.languages
  application.additionalInfo = body.additionalInfo
  application.lastUpdated = new Date()

  // If application was a draft and is now being submitted
  if (application.status === "draft" && body.submit === true) {
    application.status = "submitted"
    application.submittedAt = new Date()
  }

  // Save updated application
  await application.save()

  return NextResponse.json({ message: "Application updated successfully" })
}

// DELETE handler to withdraw an application
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user session
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await connectToDatabase()

    // Fetch application
    const application = await Application.findById(params.id)

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Get the user ID from session with multiple fallbacks
    const userId = session.user.id || session.user.sub || (session as any).userId

    // Check if user is authorized to delete this application
    if (!userId || application.userId !== userId) {
      // If we have an email, try to find the user by email as a last resort
      if (session.user.email) {
        const client = await (await import("@/lib/mongodb")).default
        const db = client.db("wegagen_bank")
        const user = await db.collection("users").findOne({ email: session.user.email })

        if (user) {
          const userIdFromEmail = user._id.toString()

          // If this application belongs to the user found by email, allow deletion
          if (application.userId === userIdFromEmail) {
            return await withdrawApplication(application)
          }
        }
      }

      return NextResponse.json({ error: "Unauthorized to withdraw this application" }, { status: 403 })
    }

    return await withdrawApplication(application)
  } catch (error) {
    console.error("Error withdrawing application:", error)
    return NextResponse.json({ error: "Failed to withdraw application" }, { status: 500 })
  }
}

// Helper function to withdraw an application
async function withdrawApplication(application: any) {
  // Check if application can be withdrawn (only draft or submitted applications)
  if (!["draft", "submitted", "under-review"].includes(application.status)) {
    return NextResponse.json({ error: "This application cannot be withdrawn anymore" }, { status: 400 })
  }

  // Delete application (or mark as withdrawn)
  // Option 1: Hard delete
  // await Application.findByIdAndDelete(params.id);

  // Option 2: Soft delete (mark as withdrawn)
  application.status = "withdrawn"
  application.lastUpdated = new Date()
  await application.save()

  return NextResponse.json({ message: "Application withdrawn successfully" })
}
