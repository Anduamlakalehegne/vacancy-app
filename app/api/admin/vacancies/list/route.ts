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
    
    // Get all vacancies, sorted by creation date descending
    const vacancies = await db.collection("vacancies")
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    // Format dates and IDs for client, handling undefined values
    const formattedVacancies = vacancies.map(vacancy => {
      const formatted: any = {
        ...vacancy,
        _id: vacancy._id.toString()
      }

      // Safely format dates if they exist
      if (vacancy.createdAt) {
        formatted.createdAt = new Date(vacancy.createdAt).toISOString()
      }
      if (vacancy.updatedAt) {
        formatted.updatedAt = new Date(vacancy.updatedAt).toISOString()
      }
      if (vacancy.startDate) {
        formatted.startDate = vacancy.startDate
      }
      if (vacancy.endDate) {
        formatted.endDate = vacancy.endDate
      }

      return formatted
    })

    return NextResponse.json(formattedVacancies)
  } catch (error) {
    console.error("Error fetching vacancies:", error)
    return NextResponse.json(
      { error: "Failed to fetch vacancies" },
      { status: 500 }
    )
  }
} 