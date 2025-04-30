import mongoose, { Schema, type Document } from "mongoose"

// Define the Application schema
export interface IApplication extends Document {
  userId: string
  vacancyId: string
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    resumeUrl?: string
  }
  education: Array<{
    institution: string
    degree: string
    fieldOfStudy: string
    graduationYear: string
    description?: string
  }>
  currentExperience?: {
    company: string
    position: string
    startDate: Date
    currentSalary?: string
    responsibilities: string
  }
  previousExperience: Array<{
    company: string
    position: string
    startDate: Date
    endDate: Date
    responsibilities: string
  }>
  training: Array<{
    name: string
    provider: string
    completionDate: Date
    expiryDate?: Date
    description?: string
  }>
  languages: Array<{
    language: string
    proficiency: "native" | "fluent" | "advanced" | "intermediate" | "basic"
  }>
  additionalInfo?: string
  termsAgreement?: boolean
  status: "draft" | "submitted" | "under-review" | "shortlisted" | "interview" | "rejected" | "hired"
  submittedAt?: Date
  lastUpdated: Date
}

// Create the schema
const ApplicationSchema = new Schema<IApplication>({
  userId: { type: String, required: true },
  vacancyId: { type: String, required: true },
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    resumeUrl: { type: String },
  },
  education: [
    {
      institution: { type: String, required: true },
      degree: { type: String, required: true },
      fieldOfStudy: { type: String, required: true },
      graduationYear: { type: String, required: true },
      description: { type: String },
    },
  ],
  currentExperience: {
    company: { type: String },
    position: { type: String },
    startDate: { type: Date },
    currentSalary: { type: String },
    responsibilities: { type: String },
  },
  previousExperience: [
    {
      company: { type: String, required: true },
      position: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      responsibilities: { type: String, required: true },
    },
  ],
  training: [
    {
      name: { type: String, required: true },
      provider: { type: String, required: true },
      completionDate: { type: Date, required: true },
      expiryDate: { type: Date },
      description: { type: String },
    },
  ],
  languages: [
    {
      language: { type: String, required: true },
      proficiency: {
        type: String,
        enum: ["native", "fluent", "advanced", "intermediate", "basic"],
        required: true,
      },
    },
  ],
  additionalInfo: { type: String },
  termsAgreement: { type: Boolean },
  status: {
    type: String,
    enum: ["draft", "submitted", "under-review", "shortlisted", "interview", "rejected", "hired"],
    default: "draft",
    required: true,
  },
  submittedAt: { type: Date },
  lastUpdated: { type: Date, default: Date.now },
})

// Create indexes for better query performance
ApplicationSchema.index({ userId: 1 })
ApplicationSchema.index({ vacancyId: 1 })
ApplicationSchema.index({ status: 1 })
ApplicationSchema.index({ "personalInfo.email": 1 })

// Create the model
// Check if the model already exists to avoid the "Cannot overwrite model once compiled" error
export const Application = mongoose.models.Application || mongoose.model<IApplication>("Application", ApplicationSchema)
