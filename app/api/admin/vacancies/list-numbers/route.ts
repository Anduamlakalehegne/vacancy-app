import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { db } = await connectToDatabase()
    
    // Get all vacancy numbers, sorted by creation date descending
    const vacancyNumbers = await db.collection("vacancynumbers")
      .find({})
      .sort({ createdAt: -1 })
      .project({ vacancyNumber: 1, startDate: 1, endDate: 1, _id: 1 })
      .toArray()

    return NextResponse.json({ 
      success: true,
      vacancyNumbers
    })
  } catch (error) {
    console.error("Error fetching vacancy numbers:", error)
    return NextResponse.json(
      { error: "Failed to fetch vacancy numbers" },
      { status: 500 }
    )
  }
} 