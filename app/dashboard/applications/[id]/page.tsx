"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Languages,
  Loader2,
  User,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Application {
  _id: string
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
    startDate: string
    currentSalary?: string
    responsibilities: string
  }
  previousExperience?: Array<{
    company: string
    position: string
    startDate: string
    endDate: string
    responsibilities: string
  }>
  training?: Array<{
    name: string
    provider: string
    completionDate: string
    expiryDate?: string
    description?: string
  }>
  languages?: Array<{
    language: string
    proficiency: string
  }>
  additionalInfo?: string
  termsAgreement?: boolean
  status: string
  submittedAt?: string
  lastUpdated: string
  vacancy?: {
    title: string
    department: string
    location: string
  }
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState(false)

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      setLoading(true)
      try {
        // Fetch application details
        const applicationResponse = await fetch(`/api/applications/${params.id}`)

        if (!applicationResponse.ok) {
          throw new Error("Failed to fetch application details")
        }

        const applicationData = await applicationResponse.json()

        // Fetch vacancy details
        const vacancyResponse = await fetch(`/api/vacancies/${applicationData.vacancyId}`)

        if (vacancyResponse.ok) {
          const vacancyData = await vacancyResponse.json()
          applicationData.vacancy = vacancyData
        }

        setApplication(applicationData)
      } catch (error) {
        console.error("Error fetching application details:", error)
        toast({
          title: "Error",
          description: "Failed to load application details. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchApplicationDetails()
  }, [params.id, toast])

  // Handle withdraw application
  const handleWithdrawApplication = async () => {
    if (!confirm("Are you sure you want to withdraw this application? This action cannot be undone.")) {
      return
    }

    setWithdrawing(true)
    try {
      const response = await fetch(`/api/applications/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to withdraw application")
      }

      toast({
        title: "Application Withdrawn",
        description: "Your application has been successfully withdrawn.",
      })

      router.push("/dashboard/applications")
    } catch (error) {
      console.error("Error withdrawing application:", error)
      toast({
        title: "Error",
        description: "Failed to withdraw your application. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setWithdrawing(false)
    }
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!application) {
    return (
      <div className="space-y-8">
        <Button asChild variant="ghost" className="pl-0">
          <Link href="/dashboard/applications">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Link>
        </Button>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Application Not Found</AlertTitle>
          <AlertDescription>
            The application you're looking for doesn't exist or you don't have permission to view it.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Get status badge class
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
      case "submitted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "under-review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "shortlisted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "interview":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
      case "hired":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "withdrawn":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  return (
    <div className="space-y-8">
      {/* Back button and header */}
      <div>
        <Button asChild variant="ghost" className="pl-0 mb-4">
          <Link href="/dashboard/applications">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Application Details</h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">
                {application.vacancy?.title || "Position"} • {application.vacancy?.department || "Department"}
              </p>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(application.status)}`}
              >
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Submitted: {formatDate(application.submittedAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last Updated: {formatDate(application.lastUpdated)}</span>
            </div>

            {/* Withdraw button for submitted/under-review applications */}
            {(application.status === "submitted" || application.status === "under-review") && (
              <Button variant="destructive" size="sm" onClick={handleWithdrawApplication} disabled={withdrawing}>
                {withdrawing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Withdrawing...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Withdraw Application
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Application Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Application Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <div
                className={`flex flex-col items-center ${application.status !== "draft" ? "text-primary" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${application.status !== "draft" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <FileText className="h-5 w-5" />
                </div>
                <span className="text-sm mt-2">Submitted</span>
              </div>

              <div className={`flex-1 h-1 mx-2 ${application.status !== "draft" ? "bg-primary" : "bg-muted"}`} />

              <div
                className={`flex flex-col items-center ${application.status === "under-review" || application.status === "shortlisted" || application.status === "interview" || application.status === "hired" ? "text-primary" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${application.status === "under-review" || application.status === "shortlisted" || application.status === "interview" || application.status === "hired" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <Clock className="h-5 w-5" />
                </div>
                <span className="text-sm mt-2">Under Review</span>
              </div>

              <div
                className={`flex-1 h-1 mx-2 ${application.status === "shortlisted" || application.status === "interview" || application.status === "hired" ? "bg-primary" : "bg-muted"}`}
              />

              <div
                className={`flex flex-col items-center ${application.status === "shortlisted" || application.status === "interview" || application.status === "hired" ? "text-primary" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${application.status === "shortlisted" || application.status === "interview" || application.status === "hired" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <span className="text-sm mt-2">Shortlisted</span>
              </div>

              <div
                className={`flex-1 h-1 mx-2 ${application.status === "interview" || application.status === "hired" ? "bg-primary" : "bg-muted"}`}
              />

              <div
                className={`flex flex-col items-center ${application.status === "interview" || application.status === "hired" ? "text-primary" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${application.status === "interview" || application.status === "hired" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <User className="h-5 w-5" />
                </div>
                <span className="text-sm mt-2">Interview</span>
              </div>

              <div className={`flex-1 h-1 mx-2 ${application.status === "hired" ? "bg-primary" : "bg-muted"}`} />

              <div
                className={`flex flex-col items-center ${application.status === "hired" ? "text-primary" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${application.status === "hired" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <Briefcase className="h-5 w-5" />
                </div>
                <span className="text-sm mt-2">Hired</span>
              </div>
            </div>

            {application.status === "rejected" && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Application Rejected</AlertTitle>
                <AlertDescription>
                  We appreciate your interest in Wegagen Bank. Unfortunately, your application was not selected for
                  further consideration at this time.
                </AlertDescription>
              </Alert>
            )}

            {application.status === "withdrawn" && (
              <Alert variant="default" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Application Withdrawn</AlertTitle>
                <AlertDescription>
                  You have withdrawn this application. If you'd like to apply for this position again, please submit a
                  new application.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Application Details */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="additional">Additional</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Full Name</h3>
                  <p className="text-lg">
                    {application.personalInfo.firstName} {application.personalInfo.lastName}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Email Address</h3>
                  <p className="text-lg">{application.personalInfo.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone Number</h3>
                  <p className="text-lg">{application.personalInfo.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Location</h3>
                  <p className="text-lg">
                    {application.personalInfo.city}, {application.personalInfo.address}
                  </p>
                </div>
              </div>

              {application.personalInfo.resumeUrl && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Resume/CV</h3>
                  <Button asChild variant="outline">
                    <a href={application.personalInfo.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      View Resume
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.education.map((edu, index) => (
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
                  {index < application.education.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.currentExperience && (
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <h3 className="text-lg font-medium">{application.currentExperience.position}</h3>
                    <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold">
                      Current
                    </span>
                  </div>
                  <p className="text-muted-foreground">{application.currentExperience.company}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Since {formatDate(application.currentExperience.startDate)}
                    {application.currentExperience.currentSalary &&
                      ` • Salary: ${application.currentExperience.currentSalary}`}
                  </p>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium mb-1">Responsibilities</h4>
                    <p className="text-sm">{application.currentExperience.responsibilities}</p>
                  </div>
                  {application.previousExperience && application.previousExperience.length > 0 && (
                    <Separator className="my-6" />
                  )}
                </div>
              )}

              {application.previousExperience && application.previousExperience.length > 0
                ? application.previousExperience.map((exp, index) => (
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
                      {index < (application.previousExperience?.length || 0) - 1 && <Separator className="my-4" />}
                    </div>
                  ))
                : !application.currentExperience && (
                    <p className="text-muted-foreground">No work experience provided.</p>
                  )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Training & Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.training && application.training.length > 0 ? (
                application.training.map((training, index) => (
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
                    {index < (application.training?.length || 0) - 1 && <Separator className="my-4" />}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No training or certifications provided.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Languages Tab */}
        <TabsContent value="languages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Languages className="h-5 w-5 mr-2" />
                Language Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.languages && application.languages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.languages.map((lang, index) => (
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
                <p className="text-muted-foreground">No language skills provided.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional Information Tab */}
        <TabsContent value="additional">
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              {application.additionalInfo ? (
                <div className="prose max-w-none dark:prose-invert">
                  <p>{application.additionalInfo}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No additional information provided.</p>
              )}

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Terms Agreement</h3>
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      application.termsAgreement ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}
                  >
                    {application.termsAgreement ? "✓" : "✗"}
                  </div>
                  <p className="ml-2 text-sm text-muted-foreground">
                    {application.termsAgreement
                      ? "Applicant has agreed to the terms and conditions."
                      : "Applicant has not agreed to the terms and conditions."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
