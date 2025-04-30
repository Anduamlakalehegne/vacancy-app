import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/db"
import mongoose from "mongoose"

// Define the Application schema
const applicationSchema = new mongoose.Schema({
  vacancyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vacancy' },
  vacancyNumber: String,
  position: String,
  applicantName: String,
  email: String,
  phone: String,
  status: String,
  resumeUrl: String,
  coverLetter: String,
  appliedDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Create or get the Application model
const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema)

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const applications = await Application.find({})
      .sort({ appliedDate: -1 })
      .select('_id vacancyNumber position applicantName email phone status appliedDate resumeUrl')

    return NextResponse.json(applications)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    )
  }
} 