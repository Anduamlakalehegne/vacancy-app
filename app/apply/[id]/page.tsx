"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { PersonalInfoForm } from "@/components/application/personal-info-form"
import { EducationForm } from "@/components/application/education-form"
import { WorkExperienceForm } from "@/components/application/work-experience-form"
import { PreviousExperienceForm } from "@/components/application/previous-experience-form"
import { TrainingForm } from "@/components/application/training-form"
import { LanguageForm } from "@/components/application/language-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type {
  PersonalInfoFormValues,
  EducationFormValues,
  CurrentExperienceFormValues,
  PreviousExperienceFormValues,
  TrainingFormValues,
  LanguageFormValues,
} from "@/lib/validation/application-schema"

// Define the Application type
interface Application {
  _id?: string
  userId: string
  vacancyId: string
  personalInfo: PersonalInfoFormValues
  education: EducationFormValues[]
  currentExperience?: CurrentExperienceFormValues
  previousExperience?: PreviousExperienceFormValues[]
  training?: TrainingFormValues[]
  languages?: LanguageFormValues[]
  additionalInfo?: string
  termsAgreement?: boolean
  status: string
  submittedAt?: string
  lastUpdated: string
}

// Define the Vacancy type
interface Vacancy {
  _id: string
  title: string
  department: string
  location: string
}

// Define the UserProfile type
interface UserProfile {
  personalInfo?: PersonalInfoFormValues
  education?: EducationFormValues[]
  currentExperience?: CurrentExperienceFormValues
  previousExperience?: PreviousExperienceFormValues[]
  training?: TrainingFormValues[]
  languages?: LanguageFormValues[]
  additionalInfo?: string
}

export default function ApplyPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState("personal")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [vacancy, setVacancy] = useState<Vacancy | null>(null)
  const [application, setApplication] = useState<Application | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [missingFields, setMissingFields] = useState<string[]>([])

  // Initialize form data with default values
  const [formData, setFormData] = useState<Partial<Application>>({
    vacancyId: jobId,
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      resumeUrl: "",
    },
    education: [
      {
        institution: "",
        degree: "",
        fieldOfStudy: "",
        graduationYear: "",
        description: "",
      },
    ],
    currentExperience: {
      company: "",
      position: "",
      startDate: "",
      currentSalary: "",
      responsibilities: "",
    },
    previousExperience: [
      {
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        responsibilities: "",
      },
    ],
    training: [
      {
        name: "",
        provider: "",
        completionDate: "",
        expiryDate: "",
        description: "",
      },
    ],
    languages: [
      {
        language: "",
        proficiency: "intermediate",
      },
    ],
    additionalInfo: "",
    termsAgreement: false,
    status: "draft",
  })

  // Check authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/apply/${jobId}`)
    }
  }, [status, router, jobId])

  // Fetch vacancy details, check for existing application, and fetch user profile
  useEffect(() => {
    const fetchData = async () => {
      if (status !== "authenticated") return

      setLoading(true)
      try {
        // Fetch vacancy details
        const vacancyResponse = await fetch(`/api/vacancies/${jobId}`)
        if (!vacancyResponse.ok) {
          throw new Error("Failed to fetch vacancy details")
        }
        const vacancyData = await vacancyResponse.json()
        setVacancy(vacancyData)

        // Check for existing application
        const applicationsResponse = await fetch(`/api/applications?vacancyId=${jobId}`)
        if (!applicationsResponse.ok) {
          throw new Error("Failed to fetch applications")
        }
        const applications = await applicationsResponse.json()

        // Fetch user profile
        const profileResponse = await fetch("/api/profile")
        let profileData = null

        if (profileResponse.ok) {
          profileData = await profileResponse.json()
          setUserProfile(profileData)

          // Check for missing required fields in the profile
          const missingFieldsList = []

          if (
            !profileData.personalInfo?.firstName ||
            !profileData.personalInfo?.lastName ||
            !profileData.personalInfo?.email ||
            !profileData.personalInfo?.phone
          ) {
            missingFieldsList.push("personal")
          }

          if (!profileData.education || profileData.education.length === 0) {
            missingFieldsList.push("education")
          }

          setMissingFields(missingFieldsList)
        }

        // If user has an existing application for this vacancy
        if (applications.length > 0) {
          const existingApplication = applications[0]
          setApplication(existingApplication)

          // Initialize form data with existing application data
          setFormData({
            ...existingApplication,
            // Ensure these fields exist even if they're not in the existing application
            previousExperience: existingApplication.previousExperience || [
              {
                company: "",
                position: "",
                startDate: "",
                endDate: "",
                responsibilities: "",
              },
            ],
            training: existingApplication.training || [
              {
                name: "",
                provider: "",
                completionDate: "",
                expiryDate: "",
                description: "",
              },
            ],
            languages: existingApplication.languages || [
              {
                language: "",
                proficiency: "intermediate",
              },
            ],
            termsAgreement: existingApplication.termsAgreement || false,
          })

          // If application is already submitted, redirect to confirmation page
          if (existingApplication.status === "submitted") {
            toast({
              title: "Application Already Submitted",
              description: "You have already applied for this position.",
            })
            router.push(`/apply/${jobId}/confirmation`)
            return
          }
        } else if (profileData) {
          // If no existing application but user profile exists, pre-fill form with profile data
          setFormData((prevData) => ({
            ...prevData,
            personalInfo: profileData.personalInfo || prevData.personalInfo,
            education:
              profileData.education && profileData.education.length > 0 ? profileData.education : prevData.education,
            currentExperience: profileData.currentExperience || prevData.currentExperience,
            previousExperience:
              profileData.previousExperience && profileData.previousExperience.length > 0
                ? profileData.previousExperience
                : prevData.previousExperience,
            training:
              profileData.training && profileData.training.length > 0 ? profileData.training : prevData.training,
            languages:
              profileData.languages && profileData.languages.length > 0 ? profileData.languages : prevData.languages,
            additionalInfo: profileData.additionalInfo || prevData.additionalInfo,
          }))

          // If there are missing fields, set the active tab to the first missing field
          if (missingFields.length > 0) {
            setActiveTab(missingFields[0])
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [jobId, status, router, toast])

  // Handle tab navigation
  const handleNextTab = (current: string) => {
    switch (current) {
      case "personal":
        setActiveTab("education")
        break
      case "education":
        setActiveTab("current-work")
        break
      case "current-work":
        setActiveTab("previous-work")
        break
      case "previous-work":
        setActiveTab("training")
        break
      case "training":
        setActiveTab("language")
        break
      default:
        break
    }
  }

  const handlePreviousTab = (current: string) => {
    switch (current) {
      case "education":
        setActiveTab("personal")
        break
      case "current-work":
        setActiveTab("education")
        break
      case "previous-work":
        setActiveTab("current-work")
        break
      case "training":
        setActiveTab("previous-work")
        break
      case "language":
        setActiveTab("training")
        break
      default:
        break
    }
  }

  // Form submission handlers for each step
  const handlePersonalInfoSubmit = (data: PersonalInfoFormValues) => {
    setFormData((prev) => ({
      ...prev,
      personalInfo: data,
    }))
    handleNextTab("personal")
  }

  const handleEducationSubmit = (data: { education: EducationFormValues[] }) => {
    setFormData((prev) => ({
      ...prev,
      education: data.education,
    }))
    handleNextTab("education")
  }

  const handleCurrentExperienceSubmit = (data: { currentExperience?: CurrentExperienceFormValues }) => {
    setFormData((prev) => ({
      ...prev,
      currentExperience: data.currentExperience,
    }))
    handleNextTab("current-work")
  }

  const handlePreviousExperienceSubmit = (data: { previousExperience?: PreviousExperienceFormValues[] }) => {
    setFormData((prev) => ({
      ...prev,
      previousExperience: data.previousExperience,
    }))
    handleNextTab("previous-work")
  }

  const handleTrainingSubmit = (data: { training?: TrainingFormValues[] }) => {
    setFormData((prev) => ({
      ...prev,
      training: data.training,
    }))
    handleNextTab("training")
  }

  const handleLanguageSubmit = (data: {
    languages: LanguageFormValues[]
    additionalInfo?: string
    termsAgreement: boolean
  }) => {
    // Update form data with language info and terms agreement
    const updatedFormData = {
      ...formData,
      languages: data.languages,
      additionalInfo: data.additionalInfo,
      termsAgreement: data.termsAgreement,
    }

    // Set the updated form data
    setFormData(updatedFormData)

    // Submit the application with the updated data
    handleSubmitApplication(updatedFormData)
  }

  // Save draft application
  const handleSaveDraft = async (stepData: any) => {
    // Update form data with the current step data
    const updatedFormData = {
      ...formData,
      ...stepData,
    }

    // Update the state
    setFormData(updatedFormData)

    try {
      // Make sure we include the user ID from the session
      const draftData = {
        ...updatedFormData,
        userId: session?.user?.id,
        vacancyId: jobId,
      }

      console.log("Saving draft with data:", draftData)

      const response = await fetch("/api/applications/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draftData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Draft save error:", errorData)
        throw new Error(errorData.error || "Failed to save draft")
      }

      const data = await response.json()

      toast({
        title: "Draft Saved",
        description: "Your application draft has been saved successfully.",
      })

      // Update application ID if this is a new draft
      if (!application?._id) {
        setApplication({
          ...updatedFormData,
          _id: data.applicationId,
          userId: session?.user?.id || "",
          status: "draft",
          lastUpdated: new Date().toISOString(),
        } as Application)
      }
    } catch (error) {
      console.error("Error saving draft:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save draft. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Update the handleSubmitApplication function to handle the user ID issue
  const handleSubmitApplication = async (finalFormData: Partial<Application>) => {
    setSubmitting(true)

    try {
      // Validate terms agreement
      if (!finalFormData.termsAgreement) {
        toast({
          title: "Terms Agreement Required",
          description: "You must agree to the terms before submitting your application.",
          variant: "destructive",
        })
        setSubmitting(false)
        return
      }

      // Get the user ID from the session or use a fallback
      const userId =
        session?.user?.id || (session?.user as any)?.sub || (session as any)?.userId || (session as any)?.id

      console.log("Session for submission:", session)

      // If we can't get a user ID, use the email to identify the user
      if (!userId && session?.user?.email) {
        toast({
          title: "Session ID Missing",
          description: "Using email as fallback. Please log out and log in again after submission.",
          variant: "destructive",
        })
      }

      // Prepare submission data with explicit userId or fallback to email
      const submissionData = {
        ...finalFormData,
        userId: userId, // Explicitly set userId from session
        userEmail: session?.user?.email, // Add email as fallback
        vacancyId: jobId, // Ensure vacancyId is set
        termsAgreement: finalFormData.termsAgreement,
        submit: true,
      }

      console.log("Submitting application data:", submissionData)

      // Also update the user profile with the application data
      await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalInfo: finalFormData.personalInfo,
          education: finalFormData.education,
          currentExperience: finalFormData.currentExperience,
          previousExperience: finalFormData.previousExperience,
          training: finalFormData.training,
          languages: finalFormData.languages,
          additionalInfo: finalFormData.additionalInfo,
        }),
      })

      // If we have an existing application, update it
      if (application?._id) {
        const response = await fetch(`/api/applications/${application._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submissionData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("API error response:", errorData)
          throw new Error(errorData.error || errorData.message || "Failed to update application")
        }
      } else {
        // Otherwise create a new application
        const response = await fetch("/api/applications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submissionData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("API error response:", errorData)
          throw new Error(errorData.error || errorData.message || "Failed to submit application")
        }
      }

      // Redirect to confirmation page
      router.push(`/apply/${jobId}/confirmation`)
    } catch (error) {
      console.error("Error submitting application:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Show loading or nothing while checking authentication
  if (status === "loading" || status === "unauthenticated" || loading) {
    return (
      <DashboardLayout>
        <div className="container py-8 flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button asChild variant="ghost" className="pl-0 mb-4">
            <Link href={`/vacancies/${jobId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Job Details
            </Link>
          </Button>

          {/* Application Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Apply for {vacancy?.title}</h1>
            <p className="text-muted-foreground">
              {vacancy?.department} • {vacancy?.location}
            </p>
          </div>

          {/* Missing Profile Information Alert */}
          {missingFields.length > 0 && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Complete Your Profile</AlertTitle>
              <AlertDescription>
                Please complete the following sections of your profile to enhance your application:
                {missingFields.map((field, index) => (
                  <span key={field} className="font-medium">
                    {index > 0 ? ", " : " "}
                    {field === "personal" ? "Personal Information" : field === "education" ? "Education" : field}
                  </span>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {/* Application Form */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-8">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="current-work">Current Work</TabsTrigger>
                  <TabsTrigger value="previous-work">Previous Work</TabsTrigger>
                  <TabsTrigger value="training">Training</TabsTrigger>
                  <TabsTrigger value="language">Language</TabsTrigger>
                </TabsList>

                {/* Personal Information */}
                <TabsContent value="personal" className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                    <p className="text-muted-foreground mb-6">Please provide your personal details below.</p>
                  </div>

                  <PersonalInfoForm
                    defaultValues={formData.personalInfo}
                    onSubmit={handlePersonalInfoSubmit}
                    onSaveDraft={(data) => handleSaveDraft({ personalInfo: data })}
                  />
                </TabsContent>

                {/* Education */}
                <TabsContent value="education" className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Education</h2>
                    <p className="text-muted-foreground mb-6">
                      Please provide details about your educational background.
                    </p>
                  </div>

                  <EducationForm
                    defaultValues={{ education: formData.education || [] }}
                    onSubmit={handleEducationSubmit}
                    onBack={() => handlePreviousTab("education")}
                    onSaveDraft={handleSaveDraft}
                  />
                </TabsContent>

                {/* Current Work Experience */}
                <TabsContent value="current-work" className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Current Work Experience</h2>
                    <p className="text-muted-foreground mb-6">Please provide details about your current employment.</p>
                  </div>

                  <WorkExperienceForm
                    defaultValues={{ currentExperience: formData.currentExperience }}
                    onSubmit={handleCurrentExperienceSubmit}
                    onBack={() => handlePreviousTab("current-work")}
                    onSaveDraft={handleSaveDraft}
                  />
                </TabsContent>

                {/* Previous Work Experience */}
                <TabsContent value="previous-work" className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Previous Work Experience</h2>
                    <p className="text-muted-foreground mb-6">
                      Please provide details about your previous employment history.
                    </p>
                  </div>

                  <PreviousExperienceForm
                    defaultValues={{ previousExperience: formData.previousExperience }}
                    onSubmit={handlePreviousExperienceSubmit}
                    onBack={() => handlePreviousTab("previous-work")}
                    onSaveDraft={handleSaveDraft}
                  />
                </TabsContent>

                {/* Training */}
                <TabsContent value="training" className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Training & Certifications</h2>
                    <p className="text-muted-foreground mb-6">
                      Please provide details about any relevant training or certifications you have.
                    </p>
                  </div>

                  <TrainingForm
                    defaultValues={{ training: formData.training }}
                    onSubmit={handleTrainingSubmit}
                    onBack={() => handlePreviousTab("training")}
                    onSaveDraft={handleSaveDraft}
                  />
                </TabsContent>

                {/* Language */}
                <TabsContent value="language" className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Language Skills</h2>
                    <p className="text-muted-foreground mb-6">
                      Please provide details about languages you can speak, read, or write.
                    </p>
                  </div>

                  <LanguageForm
                    defaultValues={{
                      languages: formData.languages,
                      additionalInfo: formData.additionalInfo,
                      termsAgreement: formData.termsAgreement || false,
                    }}
                    onSubmit={handleLanguageSubmit}
                    onBack={() => handlePreviousTab("language")}
                    onSaveDraft={handleSaveDraft}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
