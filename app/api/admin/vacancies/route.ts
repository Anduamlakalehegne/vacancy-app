import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

// Define the Vacancy schema
const vacancySchema = new mongoose.Schema({
  vacancyNumber: String,
  position: String,
  status: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Create or get the Vacancy model
const Vacancy = mongoose.models.Vacancy || mongoose.model('Vacancy', vacancySchema)

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { db } = await connectToDatabase()
    const data = await request.json()

    // Validate required fields
    const requiredFields = [
      'vacancyNumber',
      'startDate',
      'endDate',
      'position',
      'requiredNumber',
      'education',
      'purpose',
      'experience',
      'responsibilities',
      'placeOfWork',
      'salary'
    ]

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Verify that the vacancy number exists in vacancynumbers collection
    const existingVacancyNumber = await db.collection("vacancynumbers")
      .findOne({ vacancyNumber: data.vacancyNumber })

    if (!existingVacancyNumber) {
      return NextResponse.json(
        { error: "Vacancy number not found" },
        { status: 404 }
      )
    }

    // Create the vacancy
    const vacancy = {
      ...data,
      createdBy: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: data.status || "draft"
    }

    const result = await db.collection("vacancies").insertOne(vacancy)

    // Update the vacancy number status to used
    await db.collection("vacancynumbers").updateOne(
      { vacancyNumber: data.vacancyNumber },
      { 
        $set: { 
          status: "used",
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({ 
      success: true,
      _id: result.insertedId,
      vacancy
    })
  } catch (error) {
    console.error("Error creating vacancy:", error)
    return NextResponse.json(
      { error: "Failed to create vacancy" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const vacancies = await Vacancy.find({}, { _id: 1, vacancyNumber: 1, position: 1, status: 1 })
      .sort({ createdAt: -1 })

    return NextResponse.json(vacancies)
  } catch (error) {
    console.error("Error fetching vacancies:", error)
    return NextResponse.json(
      { error: "Failed to fetch vacancies" },
      { status: 500 }
    )
  }
} 