import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

// Define the Application schema
const applicationSchema = new mongoose.Schema({
  userId: String,
  vacancyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vacancy' },
  vacancyNumber: String,
  position: String,
  applicantName: String,
  email: String,
  phone: String,
  status: String,
  resumeUrl: String,
  coverLetter: String,
  education: String,
  experience: String,
  skills: [String],
  appliedDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Define the UserProfile schema
const userProfileSchema = new mongoose.Schema({
  userId: String,
  personalInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    resumeUrl: String
  },
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    graduationYear: String,
    description: String
  }],
  currentExperience: {
    company: String,
    position: String,
    startDate: String,
    currentSalary: String,
    responsibilities: String
  },
  previousExperience: [{
    company: String,
    position: String,
    startDate: String,
    endDate: String,
    responsibilities: String
  }],
  training: [{
    name: String,
    provider: String,
    completionDate: String,
    expiryDate: String,
    description: String
  }],
  languages: [{
    language: String,
    proficiency: String
  }],
  lastUpdated: Date,
  additionalInfo: String
})

// Create or get the models
const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema)
const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', userProfileSchema)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('Starting API request...')
    
    const session = await getServerSession()
    if (!session) {
      console.log('No session found')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log('Connecting to database...')
    const { db } = await connectToDatabase()
    console.log('Database connected successfully')

    // Await params before using
    const { id } = await params
    console.log('Fetching application with ID:', id)
    
    const application = await Application.findById(id)
    if (!application) {
      console.log('Application not found')
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Convert Mongoose document to plain object
    const applicationData = application.toObject()
    console.log('Application found:', applicationData)

    // Log all fields in the application
    console.log('Application fields:', Object.keys(applicationData))
    console.log('Application userId:', applicationData.userId)
    console.log('Application email:', applicationData.email)

    // Try to find user profile by email first
    if (applicationData.email) {
      console.log('Fetching user profile by email:', applicationData.email)
      const userProfileByEmail = await db.collection("userProfiles").findOne({ 
        "personalInfo.email": applicationData.email 
      })
      console.log('User profile by email result:', userProfileByEmail)

      if (userProfileByEmail) {
        return NextResponse.json({
          application: applicationData,
          userProfile: userProfileByEmail
        })
      }
    }

    // If not found by email, try userId
    if (applicationData.userId) {
      console.log('Fetching user profile with userId:', applicationData.userId)
      const userProfileByUserId = await db.collection("userProfiles").findOne({ 
        userId: applicationData.userId 
      })
      console.log('User profile by userId result:', userProfileByUserId)
      
      return NextResponse.json({
        application: applicationData,
        userProfile: userProfileByUserId
      })
    }
    
    return NextResponse.json({
      application: applicationData,
      userProfile: null
    })
  } catch (error) {
    console.error("Detailed error:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch application",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    await connectToDatabase()

    const application = await Application.findByIdAndUpdate(
      params.id,
      { 
        ...data,
        updatedAt: new Date()
      },
      { new: true }
    )

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    )
  }
}
