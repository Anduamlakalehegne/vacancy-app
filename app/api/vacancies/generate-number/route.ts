import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import mongoose from "mongoose"

// Define VacancyNumber Schema
const vacancyNumberSchema = new mongoose.Schema({
  number: String,
  year: Number,
  sequence: Number,
  createdAt: { type: Date, default: Date.now }
})

// Get or create model
const VacancyNumber = mongoose.models.VacancyNumber || mongoose.model('VacancyNumber', vacancyNumberSchema)

export async function GET() {
  try {
    await connectToDatabase()
    
    const currentYear = new Date().getFullYear()
    
    // Find the latest vacancy number for the current year
    const latestVacancy = await VacancyNumber.findOne({ year: currentYear })
      .sort({ sequence: -1 })
      .exec()
    
    // Generate new sequence number
    const sequence = latestVacancy ? latestVacancy.sequence + 1 : 1
    
    // Format sequence to 4 digits
    const formattedSequence = sequence.toString().padStart(4, '0')
    
    // Create new vacancy number
    const vacancyNumber = `WB/EXT/${formattedSequence}/${currentYear}`
    
    // Save to database
    await VacancyNumber.create({
      number: vacancyNumber,
      year: currentYear,
      sequence: sequence
    })
    
    return NextResponse.json({ vacancyNumber })
  } catch (error) {
    console.error("Error generating vacancy number:", error)
    return NextResponse.json(
      { error: "Failed to generate vacancy number" },
      { status: 500 }
    )
  }
} 