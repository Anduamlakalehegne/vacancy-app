import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { getUserId } from "@/lib/get-user-id"
import clientPromise from "@/lib/mongodb"

// Define the UserProfile model
interface UserProfile {
  userId: string
  personalInfo?: any
  education?: any[]
  currentExperience?: any
  previousExperience?: any[]
  training?: any[]
  languages?: any[]
  lastUpdated: Date
}

export async function GET(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user ID
    const userId = await getUserId(session)

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 })
    }

    // Connect to database directly with MongoDB client
    const client = await clientPromise
    const db = client.db("wegagen_bank")

    // Find user profile
    const profile = await db.collection("userProfiles").findOne({ userId })

    if (!profile) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user ID
    const userId = await getUserId(session)

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 })
    }

    // Parse request body
    const body = await req.json()
    console.log("Received profile update request with body:", body)

    // Remove _id field if it exists to prevent immutable field error
    if (body._id) {
      delete body._id
    }

    // Ensure arrays are properly initialized
    if (!body.previousExperience) {
      body.previousExperience = []
    } else if (!Array.isArray(body.previousExperience)) {
      body.previousExperience = [body.previousExperience]
    }

    // Process each previousExperience entry to remove _id fields
    if (Array.isArray(body.previousExperience)) {
      body.previousExperience = body.previousExperience.map((exp: any) => {
        if (exp && exp._id) {
          const { _id, ...rest } = exp
          return rest
        }
        return exp
      })
    }

    console.log("Processed previousExperience array:", body.previousExperience)

    // Also remove _id from nested objects if they exist
    if (body.personalInfo && body.personalInfo._id) {
      delete body.personalInfo._id
    }

    if (body.currentExperience && body.currentExperience._id) {
      delete body.currentExperience._id
    }
    // Remove _id from arrays of objects
    ;["education", "training", "languages"].forEach((field) => {
      if (Array.isArray(body[field])) {
        body[field] = body[field].map((item: any) => {
          if (item && item._id) {
            const { _id, ...rest } = item
            return rest
          }
          return item
        })
      }
    })

    // Ensure arrays are initialized properly
    if (!body.education) body.education = []
    if (!body.training) body.training = []
    if (!body.languages) body.languages = []

    console.log("Updating profile for userId:", userId)
    console.log("Profile data to save:", JSON.stringify(body, null, 2))

    // Connect to database directly with MongoDB client
    const client = await clientPromise
    const db = client.db("wegagen_bank")

    // Check if profile exists
    const existingProfile = await db.collection("userProfiles").findOne({ userId })

    let result
    if (existingProfile) {
      // Update existing profile
      result = await db.collection("userProfiles").updateOne(
        { userId },
        {
          $set: {
            ...body,
            lastUpdated: new Date(),
          },
        },
      )
      console.log("Update result:", result)
    } else {
      // Create new profile
      result = await db.collection("userProfiles").insertOne({
        userId,
        ...body,
        lastUpdated: new Date(),
      })
      console.log("Insert result:", result)
    }

    // Verify the update was successful
    const updatedProfile = await db.collection("userProfiles").findOne({ userId })

    return NextResponse.json({
      message: "Profile updated successfully",
      result: result,
      profile: updatedProfile,
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json(
      {
        error: "Failed to update profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
