"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ArrowLeft, Download, Mail, Phone, Calendar, FileText, User, MapPin, GraduationCap, Briefcase, Languages, Award } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface UserProfile {
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    resumeUrl: string
  }
  education: Array<{
    institution: string
    degree: string
    fieldOfStudy: string
    graduationYear: string
    description: string
  }>
  currentExperience: {
    company: string
    position: string
    startDate: string
    currentSalary: string
    responsibilities: string
  }
  previousExperience: Array<{
    company: string
    position: string
    startDate: string
    endDate: string
    responsibilities: string
  }>
  training: Array<{
    name: string
    provider: string
    completionDate: string
    expiryDate: string
    description: string
  }>
  languages: Array<{
    language: string
    proficiency: string
  }>
  lastUpdated: string
  additionalInfo: string
}

interface Application {
  _id: string
  vacancyNumber: string
  position: string
  applicantName: string
  email: string
  phone: string
  status: string
  appliedDate: string
  resumeUrl: string
  coverLetter: string
}

interface ApplicationData {
  application: Application
  userProfile: UserProfile
}

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [data, setData] = useState<ApplicationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/admin/applications/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch application')
        }
        const responseData = await response.json()
        setData(responseData)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load application details')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      setData(prev => prev ? {
        ...prev,
        application: { ...prev.application, status: newStatus }
      } : null)
    } catch (error) {
      console.error('Error updating status:', error)
      setError('Failed to update application status')
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-red-500">{error || 'Application not found'}</p>
      </div>
    )
  }

  const { application, userProfile } = data

  if (!userProfile) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Application Details</h1>
          </div>
          <Badge
            variant={
              application.status === "pending"
                ? "secondary"
                : application.status === "reviewed"
                ? "default"
                : application.status === "shortlisted"
                ? "outline"
                : "destructive"
            }
            className="text-lg px-4 py-1"
          >
            {application.status}
          </Badge>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">User profile not found. This might be because the user has deleted their profile or it hasn't been created yet.</p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Applicant Name</p>
                <p className="font-medium">{application.applicantName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{application.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{application.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applied Date</p>
                <p className="font-medium">{format(new Date(application.appliedDate), "PPP")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Application Details</h1>
        </div>
        <Badge
          variant={
            application.status === "pending"
              ? "secondary"
              : application.status === "reviewed"
              ? "default"
              : application.status === "shortlisted"
              ? "outline"
              : "destructive"
          }
          className="text-lg px-4 py-1"
        >
          {application.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{`${userProfile.personalInfo.firstName} ${userProfile.personalInfo.lastName}`}</p>
                  <p className="text-sm text-muted-foreground">Applicant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{userProfile.personalInfo.email}</p>
                  <p className="text-sm text-muted-foreground">Email</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{userProfile.personalInfo.phone}</p>
                  <p className="text-sm text-muted-foreground">Phone</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{`${userProfile.personalInfo.address}, ${userProfile.personalInfo.city}`}</p>
                  <p className="text-sm text-muted-foreground">Address</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {format(new Date(application.appliedDate), "PPP")}
                  </p>
                  <p className="text-sm text-muted-foreground">Applied Date</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vacancy Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="font-medium">{application.position}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vacancy Number</p>
                <p className="font-medium">{application.vacancyNumber}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(userProfile.personalInfo.resumeUrl, '_blank')}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Resume
              </Button>
              <div className="space-y-2">
                <p className="text-sm font-medium">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange("reviewed")}
                    disabled={application.status === "reviewed"}
                  >
                    Mark as Reviewed
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange("shortlisted")}
                    disabled={application.status === "shortlisted"}
                  >
                    Shortlist
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange("rejected")}
                    disabled={application.status === "rejected"}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange("pending")}
                    disabled={application.status === "pending"}
                  >
                    Reset to Pending
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Info */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Professional Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="education">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="education">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Education
                  </TabsTrigger>
                  <TabsTrigger value="experience">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Experience
                  </TabsTrigger>
                  <TabsTrigger value="training">
                    <Award className="h-4 w-4 mr-2" />
                    Training
                  </TabsTrigger>
                  <TabsTrigger value="languages">
                    <Languages className="h-4 w-4 mr-2" />
                    Languages
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="education" className="mt-4">
                  <div className="space-y-4">
                    {userProfile.education.map((edu, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h3 className="font-semibold">{edu.institution}</h3>
                        <p className="text-sm text-muted-foreground">{edu.degree} in {edu.fieldOfStudy}</p>
                        <p className="text-sm">Graduated: {edu.graduationYear}</p>
                        {edu.description && (
                          <p className="mt-2 text-sm">{edu.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="experience" className="mt-4">
                  <div className="space-y-4">
                    {/* Current Experience */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold">Current Position</h3>
                      <p className="text-sm text-muted-foreground">{userProfile.currentExperience.position}</p>
                      <p className="text-sm">{userProfile.currentExperience.company}</p>
                      <p className="text-sm">Started: {format(new Date(userProfile.currentExperience.startDate), "PPP")}</p>
                      <p className="text-sm">Salary: {userProfile.currentExperience.currentSalary}</p>
                      <p className="mt-2 text-sm">{userProfile.currentExperience.responsibilities}</p>
                    </div>

                    {/* Previous Experience */}
                    <h3 className="font-semibold mt-4">Previous Experience</h3>
                    {userProfile.previousExperience.map((exp, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-medium">{exp.position}</h4>
                        <p className="text-sm text-muted-foreground">{exp.company}</p>
                        <p className="text-sm">
                          {format(new Date(exp.startDate), "PPP")} - {format(new Date(exp.endDate), "PPP")}
                        </p>
                        <p className="mt-2 text-sm">{exp.responsibilities}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="training" className="mt-4">
                  <div className="space-y-4">
                    {userProfile.training.map((train, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h3 className="font-semibold">{train.name}</h3>
                        <p className="text-sm text-muted-foreground">{train.provider}</p>
                        <p className="text-sm">
                          Completed: {format(new Date(train.completionDate), "PPP")}
                        </p>
                        <p className="text-sm">
                          Expires: {format(new Date(train.expiryDate), "PPP")}
                        </p>
                        {train.description && (
                          <p className="mt-2 text-sm">{train.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="languages" className="mt-4">
                  <div className="space-y-4">
                    {userProfile.languages.map((lang, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h3 className="font-semibold">{lang.language}</h3>
                        <Badge variant="secondary" className="mt-2">
                          {lang.proficiency}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 