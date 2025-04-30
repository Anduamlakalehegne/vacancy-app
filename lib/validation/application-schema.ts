import { z } from "zod"

// Personal Information Schema
export const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  resumeUrl: z.string().optional(),
})

// Education Schema
export const educationSchema = z.object({
  institution: z.string().min(2, "Institution name is required"),
  degree: z.string().min(2, "Degree/Certificate is required"),
  fieldOfStudy: z.string().min(2, "Field of study is required"),
  graduationYear: z.string().regex(/^\d{4}$/, "Please enter a valid year (YYYY)"),
  description: z.string().optional(),
})

// Current Experience Schema
export const currentExperienceSchema = z.object({
  company: z.string().min(2, "Company name is required"),
  position: z.string().min(2, "Position is required"),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Please enter a valid date"),
  currentSalary: z.string().optional(),
  responsibilities: z.string().min(10, "Please provide a description of your responsibilities"),
})

// Previous Experience Schema
export const previousExperienceSchema = z
  .object({
    company: z.string().min(2, "Company name is required"),
    position: z.string().min(2, "Position is required"),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Please enter a valid date"),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Please enter a valid date"),
    responsibilities: z.string().min(10, "Please provide a description of your responsibilities"),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)
      return endDate > startDate
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  )

// Training Schema
export const trainingSchema = z.object({
  name: z.string().min(2, "Training/Certification name is required"),
  provider: z.string().min(2, "Provider name is required"),
  completionDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Please enter a valid date"),
  expiryDate: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), "Please enter a valid date")
    .optional(),
  description: z.string().optional(),
})

// Language Schema
export const languageSchema = z.object({
  language: z.string().min(2, "Language name is required"),
  proficiency: z.enum(["native", "fluent", "advanced", "intermediate", "basic"], {
    errorMap: () => ({ message: "Please select a proficiency level" }),
  }),
})

// Complete Application Schema
export const applicationSchema = z.object({
  personalInfo: personalInfoSchema,
  education: z.array(educationSchema).min(1, "At least one education entry is required"),
  currentExperience: currentExperienceSchema.optional(),
  previousExperience: z.array(previousExperienceSchema).optional(),
  training: z.array(trainingSchema).optional(),
  languages: z.array(languageSchema).min(1, "At least one language entry is required"),
  additionalInfo: z.string().optional(),
  termsAgreement: z.boolean().refine((val) => val === true, "You must agree to the terms"),
})

// Partial schemas for each step
export const applicationStepSchemas = {
  personal: personalInfoSchema,
  education: z.object({ education: z.array(educationSchema).min(1) }),
  currentExperience: z.object({ currentExperience: currentExperienceSchema.optional() }),
  previousExperience: z.object({ previousExperience: z.array(previousExperienceSchema).optional() }),
  training: z.object({ training: z.array(trainingSchema).optional() }),
  language: z.object({
    languages: z.array(languageSchema).min(1),
    additionalInfo: z.string().optional(),
    termsAgreement: z.boolean().refine((val) => val === true, "You must agree to the terms"),
  }),
}

export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>
export type EducationFormValues = z.infer<typeof educationSchema>
export type CurrentExperienceFormValues = z.infer<typeof currentExperienceSchema>
export type PreviousExperienceFormValues = z.infer<typeof previousExperienceSchema>
export type TrainingFormValues = z.infer<typeof trainingSchema>
export type LanguageFormValues = z.infer<typeof languageSchema>
export type ApplicationFormValues = z.infer<typeof applicationSchema>
