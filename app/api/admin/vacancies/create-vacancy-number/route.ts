import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { db } = await connectToDatabase()
    const data = await request.json()

    // Validate required fields
    if (!data.startDate || !data.endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      )
    }

    // If vacancyNumber is provided, save it directly
    if (data.vacancyNumber) {
      const result = await db.collection("vacancynumbers").insertOne({
        vacancyNumber: data.vacancyNumber,
        startDate: data.startDate,
        endDate: data.endDate,
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date()
      })

      return NextResponse.json({ 
        success: true,
        vacancyNumber: data.vacancyNumber,
        _id: result.insertedId
      })
    }

    // Otherwise, generate a new vacancy number
    const currentYear = new Date().getFullYear()
    
    // Find the latest vacancy number for the current year
    const latestVacancy = await db.collection("vacancynumbers")
      .find({
        vacancyNumber: { $regex: `^WB/EXT/\\d{4}/${currentYear}$` }
      })
      .sort({ vacancyNumber: -1 })
      .limit(1)
      .toArray()

    let nextNumber = 1
    if (latestVacancy.length > 0) {
      // Extract the number from the latest vacancy number
      const match = latestVacancy[0].vacancyNumber.match(/WB\/EXT\/(\d{4})\/\d{4}/)
      if (match) {
        nextNumber = parseInt(match[1]) + 1
      }
    }

    // Format the new vacancy number
    const vacancyNumber = `WB/EXT/${nextNumber.toString().padStart(4, '0')}/${currentYear}`

    return NextResponse.json({ 
      success: true,
      vacancyNumber
    })
  } catch (error) {
    console.error("Error handling vacancy number:", error)
    return NextResponse.json(
      { error: "Failed to handle vacancy number request" },
      { status: 500 }
    )
  }
} 