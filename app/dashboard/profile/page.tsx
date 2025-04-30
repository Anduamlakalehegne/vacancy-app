"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, Briefcase, Check, Edit2, GraduationCap, Languages, Loader2, Plus, User, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type {
  PersonalInfoFormValues,
  EducationFormValues,
  CurrentExperienceFormValues,
  PreviousExperienceFormValues,
  TrainingFormValues,
  LanguageFormValues,
} from "@/lib/validation/application-schema"
import { PersonalInfoForm } from "@/components/application/personal-info-form"
import { EducationForm } from "@/components/application/education-form"
import { WorkExperienceForm } from "@/components/application/work-experience-form"
import { PreviousExperienceForm } from "@/components/application/previous-experience-form"
import { TrainingForm } from "@/components/application/training-form"
import { LanguageForm } from "@/components/application/language-form"

// Define the UserProfile type
interface UserProfile {
  userId: string
  personalInfo?: PersonalInfoFormValues
  education?: EducationFormValues[]
  currentExperience?: CurrentExperienceFormValues
  previousExperience?: PreviousExperienceFormValues[]
  training?: TrainingFormValues[]
  languages?: LanguageFormValues[]
  additionalInfo?: string
  lastUpdated?: string
  _id?: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editMode, setEditMode] = useState<string | null>(null)
  const [formData, setFormData] = useState<UserProfile | null>(null)
  const [completeness, setCompleteness] = useState({
    personal: false,
    education: false,
    currentWork: false,
    previousWork: false,
    training: false,
    language: false,
    overall: 0,
  })

  useEffect(() => {
    console.log("Edit mode changed to:", editMode)
  }, [editMode])

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (status !== "authenticated") return

      setLoading(true)
      try {
        const response = await fetch("/api/profile")

        if (response.status === 404) {
          // Profile not found, create an empty profile
          const emptyProfile = {
            userId: session?.user?.id || "",
            personalInfo: {
              firstName: "",
              lastName: "",
              email: session?.user?.email || "",
              phone: "",
              address: "",
              city: "",
              resumeUrl: "",
            },
            education: [],
            currentExperience: {
              company: "",
              position: "",
              startDate: "",
              currentSalary: "",
              responsibilities: "",
            },
            previousExperience: [],
            training: [],
            languages: [],
          }
          setProfile(emptyProfile)
          setFormData(emptyProfile)
          return
        }

        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }

        const data = await response.json()
        setProfile(data)
        setFormData(data)
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load your profile. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [status, session, toast])

  // Calculate profile completeness
  useEffect(() => {
    if (!profile) return

    const personal = !!(
      profile.personalInfo?.firstName &&
      profile.personalInfo?.lastName &&
      profile.personalInfo?.email &&
      profile.personalInfo?.phone
    )

    const education = !!(profile.education && profile.education.length > 0)

    const currentWork = !!(profile.currentExperience?.company && profile.currentExperience?.position)

    const previousWork = !!(profile.previousExperience && profile.previousExperience.length > 0)

    const training = !!(profile.training && profile.training.length > 0)

    const language = !!(profile.languages && profile.languages.length > 0)

    // Calculate overall completeness percentage
    const sections = [personal, education, currentWork, previousWork, training, language]
    const completedSections = sections.filter(Boolean).length
    const overall = Math.round((completedSections / sections.length) * 100)

    setCompleteness({
      personal,
      education,
      currentWork,
      previousWork,
      training,
      language,
      overall,
    })
  }, [profile])

  // Handle form submission for each section
  const handlePersonalInfoSubmit = (data: PersonalInfoFormValues) => {
    if (!formData) return

    setFormData({
      ...formData,
      personalInfo: data,
    })

    handleSaveProfile({
      ...formData,
      personalInfo: data,
    })
  }

  const handleEducationSubmit = (data: { education: EducationFormValues[] }) => {
    if (!formData) return

    const updatedFormData = {
      ...formData,
      education: data.education,
    }

    setFormData(updatedFormData)
    handleSaveProfile(updatedFormData)
  }

  const handleCurrentExperienceSubmit = (data: { currentExperience?: CurrentExperienceFormValues }) => {
    if (!formData) return

    const updatedFormData = {
      ...formData,
      currentExperience: data.currentExperience,
    }

    setFormData(updatedFormData)
    handleSaveProfile(updatedFormData)
  }

  const handlePreviousExperienceSubmit = (data: { previousExperience?: PreviousExperienceFormValues[] }) => {
    if (!formData) return

    console.log("Submitting previous experience data:", data)

    const updatedFormData = {
      ...formData,
      previousExperience: data.previousExperience || [],
    }

    setFormData(updatedFormData)
    handleSaveProfile(updatedFormData)

    // Close edit mode after successful submission
    setEditMode(null)
  }

  const handleTrainingSubmit = (data: { training?: TrainingFormValues[] }) => {
    if (!formData) return

    const updatedFormData = {
      ...formData,
      training: data.training,
    }

    setFormData(updatedFormData)
    handleSaveProfile(updatedFormData)
  }

  const handleLanguageSubmit = (data: {
    languages: LanguageFormValues[]
    additionalInfo?: string
    termsAgreement: boolean
  }) => {
    if (!formData) return

    const updatedFormData = {
      ...formData,
      languages: data.languages,
      additionalInfo: data.additionalInfo,
    }

    setFormData(updatedFormData)
    handleSaveProfile(updatedFormData)
  }

  // Handle save profile
  const handleSaveProfile = async (dataToSave: UserProfile) => {
    if (!dataToSave) return

    setSaving(true)
    try {
      // Create a copy of the form data without the _id field
      const { _id, ...dataToSend } = dataToSave

      console.log("Saving profile data:", dataToSend)

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update profile")
      }

      const result = await response.json()
      console.log("Profile update result:", result)

      setProfile(dataToSave)
      setEditMode(null)

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })

      // Refresh the profile data
      const refreshResponse = await fetch("/api/profile")
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json()
        setProfile(refreshedData)
        setFormData(refreshedData)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Handle save draft for each form
  const handleSaveDraft = (data: any) => {
    if (!formData) return

    // Update form data with the current step data
    const updatedFormData = {
      ...formData,
      ...data,
    }

    // Update the state
    setFormData(updatedFormData)
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!session?.user?.name) return "U"
    const nameParts = session.user.name.split(" ")
    return nameParts.length > 1 ? (nameParts[0][0] + nameParts[1][0]).toUpperCase() : nameParts[0][0].toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and application data</p>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                <AvatarFallback className="text-xl">{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{session?.user?.name}</CardTitle>
                <CardDescription>{session?.user?.email}</CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${completeness.overall}%` }}></div>
                </div>
                <span className="text-sm font-medium">{completeness.overall}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Profile Completeness</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Details */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-8">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="current-work">Current Work</TabsTrigger>
          <TabsTrigger value="previous-work">Previous Work</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="language">Language</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your basic personal information</CardDescription>
              </div>
              {editMode !== "personal" ? (
                <Button variant="outline" size="sm" onClick={() => setEditMode("personal")}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditMode(null)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {editMode === "personal" ? (
                <PersonalInfoForm
                  defaultValues={profile?.personalInfo}
                  onSubmit={handlePersonalInfoSubmit}
                  onSaveDraft={(data) => handleSaveDraft({ personalInfo: data })}
                />
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Full Name</h3>
                      <p className="text-lg">
                        {profile?.personalInfo?.firstName} {profile?.personalInfo?.lastName}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Email Address</h3>
                      <p className="text-lg">{profile?.personalInfo?.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone Number</h3>
                      <p className="text-lg">{profile?.personalInfo?.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Location</h3>
                      <p className="text-lg">
                        {profile?.personalInfo?.city && profile?.personalInfo?.address
                          ? `${profile.personalInfo.city}, ${profile.personalInfo.address}`
                          : "Not provided"}
                      </p>
                    </div>
                  </div>

                  {profile?.personalInfo?.resumeUrl && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Resume/CV</h3>
                      <Button asChild variant="outline">
                        <a href={profile.personalInfo.resumeUrl} target="_blank" rel="noopener noreferrer">
                          View Resume
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Education
                </CardTitle>
                <CardDescription>Your educational background</CardDescription>
              </div>
              {editMode !== "education" ? (
                <Button variant="outline" size="sm" onClick={() => setEditMode("education")}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditMode(null)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {editMode === "education" ? (
                <EducationForm
                  defaultValues={{ education: profile?.education || [] }}
                  onSubmit={handleEducationSubmit}
                  onBack={() => setEditMode(null)}
                  onSaveDraft={handleSaveDraft}
                />
              ) : profile?.education && profile.education.length > 0 ? (
                <div className="space-y-6">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="mb-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">
                          {edu.degree} in {edu.fieldOfStudy}
                        </h3>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                          {edu.graduationYear}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{edu.institution}</p>
                      {edu.description && <p className="mt-2 text-sm">{edu.description}</p>}
                      {index < profile.education.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Education Information</AlertTitle>
                  <AlertDescription>
                    You haven't added any education information yet. Click the Edit button to add your educational
                    background.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Current Work Experience Tab */}
        <TabsContent value="current-work" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Current Work Experience
                </CardTitle>
                <CardDescription>Your current employment details</CardDescription>
              </div>
              {editMode !== "current-work" ? (
                <Button variant="outline" size="sm" onClick={() => setEditMode("current-work")}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditMode(null)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {editMode === "current-work" ? (
                <WorkExperienceForm
                  defaultValues={{ currentExperience: profile?.currentExperience }}
                  onSubmit={handleCurrentExperienceSubmit}
                  onBack={() => setEditMode(null)}
                  onSaveDraft={handleSaveDraft}
                />
              ) : profile?.currentExperience && profile.currentExperience.company ? (
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <h3 className="text-lg font-medium">{profile.currentExperience.position}</h3>
                    <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold">
                      Current
                    </span>
                  </div>
                  <p className="text-muted-foreground">{profile.currentExperience.company}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Since {formatDate(profile.currentExperience.startDate)}
                    {profile.currentExperience.currentSalary && ` • Salary: ${profile.currentExperience.currentSalary}`}
                  </p>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium mb-1">Responsibilities</h4>
                    <p className="text-sm">{profile.currentExperience.responsibilities}</p>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Current Work Experience</AlertTitle>
                  <AlertDescription>
                    You haven't added any current work experience. Click the Edit button to add your current job
                    details.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Previous Work Experience Tab */}
        <TabsContent value="previous-work" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Previous Work Experience
                </CardTitle>
                <CardDescription>Your previous employment history</CardDescription>
              </div>
              {editMode !== "previous-work" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log("Previous Work Edit button clicked")
                    setEditMode("previous-work")
                  }}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditMode(null)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {editMode === "previous-work" ? (
                <PreviousExperienceForm
                  defaultValues={{ previousExperience: profile?.previousExperience || [] }}
                  onSubmit={handlePreviousExperienceSubmit}
                  onBack={() => setEditMode(null)}
                  onSaveDraft={handleSaveDraft}
                />
              ) : profile?.previousExperience && profile.previousExperience.length > 0 ? (
                <div className="space-y-6">
                  {profile.previousExperience.map((exp, index) => (
                    <div key={index} className="mb-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">{exp.position}</h3>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                          Previous
                        </span>
                      </div>
                      <p className="text-muted-foreground">{exp.company}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                      </p>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium mb-1">Responsibilities</h4>
                        <p className="text-sm">{exp.responsibilities}</p>
                      </div>
                      {index < (profile.previousExperience?.length || 0) - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Previous Work Experience</AlertTitle>
                  <AlertDescription>
                    You haven't added any previous work experience. Click the Edit button to add your work history.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Training & Certifications
                </CardTitle>
                <CardDescription>Your training and certification details</CardDescription>
              </div>
              {editMode !== "training" ? (
                <Button variant="outline" size="sm" onClick={() => setEditMode("training")}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditMode(null)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {editMode === "training" ? (
                <div className="space-y-6">
                  <TrainingForm
                    defaultValues={{ training: profile?.training || [] }}
                    onSubmit={handleTrainingSubmit}
                    onBack={() => setEditMode(null)}
                    onSaveDraft={handleSaveDraft}
                  />
                </div>
              ) : profile?.training && profile.training.length > 0 ? (
                <div className="space-y-4">
                  {profile.training.map((training, index) => (
                    <div key={index} className="mb-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">{training.name}</h3>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                          {formatDate(training.completionDate)}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{training.provider}</p>
                      {training.expiryDate && (
                        <p className="text-sm text-muted-foreground mt-1">Expires: {formatDate(training.expiryDate)}</p>
                      )}
                      {training.description && <p className="mt-2 text-sm">{training.description}</p>}
                      {index < (profile.training?.length || 0) - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Training Information</AlertTitle>
                  <AlertDescription>
                    You haven't added any training or certifications yet. Click the Edit button to add your
                    qualifications.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Tab */}
        <TabsContent value="language" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center">
                  <Languages className="mr-2 h-5 w-5" />
                  Language Skills
                </CardTitle>
                <CardDescription>Languages you can speak, read, or write</CardDescription>
              </div>
              {editMode !== "language" ? (
                <Button variant="outline" size="sm" onClick={() => setEditMode("language")}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditMode(null)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {editMode === "language" ? (
                <div className="space-y-6">
                  <LanguageForm
                    defaultValues={{
                      languages: profile?.languages || [],
                      additionalInfo: profile?.additionalInfo || "",
                      termsAgreement: true,
                    }}
                    onSubmit={handleLanguageSubmit}
                    onBack={() => setEditMode(null)}
                    onSaveDraft={handleSaveDraft}
                  />
                </div>
              ) : profile?.languages && profile.languages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.languages.map((lang, index) => (
                    <div key={index} className="border rounded-md p-4">
                      <h3 className="text-lg font-medium">{lang.language}</h3>
                      <div className="mt-2">
                        <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold capitalize">
                          {lang.proficiency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Language Skills</AlertTitle>
                  <AlertDescription>
                    You haven't added any language skills yet. Click the Edit button to add languages you know.
                  </AlertDescription>
                </Alert>
              )}

              {profile?.additionalInfo && !editMode && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Additional Information</h3>
                  <p className="text-sm text-muted-foreground">{profile.additionalInfo}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Profile Completeness */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Profile Completeness</CardTitle>
          <CardDescription>Complete your profile to improve your application experience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {completeness.personal ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
                <span>Personal Information</span>
              </div>
              <span className="text-sm text-muted-foreground">{completeness.personal ? "Complete" : "Incomplete"}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {completeness.education ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
                <span>Education</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {completeness.education ? "Complete" : "Incomplete"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {completeness.currentWork ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
                <span>Current Work Experience</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {completeness.currentWork ? "Complete" : "Incomplete"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {completeness.previousWork ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
                <span>Previous Work Experience</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {completeness.previousWork ? "Complete" : "Incomplete"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {completeness.training ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
                <span>Training & Certifications</span>
              </div>
              <span className="text-sm text-muted-foreground">{completeness.training ? "Complete" : "Incomplete"}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {completeness.language ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
                <span>Language Skills</span>
              </div>
              <span className="text-sm text-muted-foreground">{completeness.language ? "Complete" : "Incomplete"}</span>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-4">
              A complete profile allows us to pre-fill your application forms and increases your chances of being
              noticed by recruiters.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                const tabToOpen = !completeness.personal
                  ? "personal"
                  : !completeness.education
                    ? "education"
                    : !completeness.currentWork
                      ? "current-work"
                      : !completeness.previousWork
                        ? "previous-work"
                        : !completeness.training
                          ? "training"
                          : !completeness.language
                            ? "language"
                            : "personal"

                setEditMode(tabToOpen)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Complete Your Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
