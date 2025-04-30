import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import mongoose from "mongoose"
import { use } from "react"

// Define Vacancy Schema
const vacancySchema = new mongoose.Schema({
  vacancyNumber: String,
  title: String,
  department: String,
  location: String,
  employmentType: String,
  experience: String,
  education: String,
  salary: String,
  deadline: Date,
  description: String,
  requirements: [String],
  responsibilities: [String],
  status: String,
  createdAt: Date,
  updatedAt: Date
})

// Get or create model
const Vacancy = mongoose.models.Vacancy || mongoose.model('Vacancy', vacancySchema)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectToDatabase()

    const vacancy = await Vacancy.findById(id)
    if (!vacancy) {
      return NextResponse.json(
        { error: "Vacancy not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(vacancy)
  } catch (error) {
    console.error("Error fetching vacancy:", error)
    return NextResponse.json(
      { error: "Failed to fetch vacancy" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectToDatabase()
    const body = await request.json()

    const updatedVacancy = await Vacancy.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true }
    )

    if (!updatedVacancy) {
      return NextResponse.json(
        { error: "Vacancy not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedVacancy)
  } catch (error) {
    console.error("Error updating vacancy:", error)
    return NextResponse.json(
      { error: "Failed to update vacancy" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const deletedVacancy = await Vacancy.findByIdAndDelete(id)
    if (!deletedVacancy) {
      return NextResponse.json(
        { error: "Vacancy not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Vacancy deleted successfully" })
  } catch (error) {
    console.error("Error deleting vacancy:", error)
    return NextResponse.json(
      { error: "Failed to delete vacancy" },
      { status: 500 }
    )
  }
}
