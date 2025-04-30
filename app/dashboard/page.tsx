"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BriefcaseBusiness,
  FileText,
  Clock,
  User,
  Loader2,
  Plus,
  ArrowRight,
  CheckCircle2,
  MoreHorizontal,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Application {
  _id: string
  vacancyId: string
  status: string
  submittedAt: string
  lastUpdated: string
  vacancy?: {
    title: string
    department: string
    location: string
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    underReview: 0,
    shortlisted: 0,
    interviews: 0,
  })

  useEffect(() => {
    const fetchApplications = async () => {
      if (status !== "authenticated") return

      setLoading(true)
      try {
        const response = await fetch("/api/applications")

        if (!response.ok) {
          throw new Error("Failed to fetch applications")
        }

        const data = await response.json()

        // Fetch vacancy details for each application
        const applicationsWithVacancies = await Promise.all(
          data.map(async (app: Application) => {
            try {
              const vacancyResponse = await fetch(`/api/vacancies/${app.vacancyId}`)
              if (vacancyResponse.ok) {
                const vacancy = await vacancyResponse.json()
                return { ...app, vacancy }
              }
              return app
            } catch (error) {
              console.error(`Error fetching vacancy for application ${app._id}:`, error)
              return app
            }
          }),
        )

        setApplications(applicationsWithVacancies)

        // Calculate stats
        const total = data.length
        const submitted = data.filter((app: Application) => app.status === "submitted").length
        const underReview = data.filter((app: Application) => app.status === "under-review").length
        const shortlisted = data.filter((app: Application) => app.status === "shortlisted").length
        const interviews = data.filter((app: Application) => app.status === "interview").length

        setStats({
          total,
          submitted,
          underReview,
          shortlisted,
          interviews,
        })
      } catch (error) {
        console.error("Error fetching applications:", error)
        toast({
          title: "Error",
          description: "Failed to load your applications. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [status, toast])

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
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
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
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
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {session?.user?.name?.split(" ")[0] || "User"}</h1>
          <p className="text-muted-foreground">Here's an overview of your job applications and opportunities</p>
        </div>
        <Button asChild>
          <Link href="/vacancies">
            <Plus className="mr-2 h-4 w-4" />
            Browse New Vacancies
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
              </div>
              <div className="p-2 rounded-full bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                <h3 className="text-2xl font-bold mt-1">{stats.underReview}</h3>
              </div>
              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shortlisted</p>
                <h3 className="text-2xl font-bold mt-1">{stats.shortlisted}</h3>
              </div>
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Interviews</p>
                <h3 className="text-2xl font-bold mt-1">{stats.interviews}</h3>
              </div>
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="applications">Recent Applications</TabsTrigger>
          <TabsTrigger value="calendar">Upcoming Events</TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <Card className="bg-card">
            <CardContent className="p-6">
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <BriefcaseBusiness className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No applications found</h3>
                  <p className="text-muted-foreground mb-6">You haven't applied for any positions yet.</p>
                  <Button asChild>
                    <Link href="/vacancies">Browse Vacancies</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Recent Applications</h3>
                    <Button asChild variant="outline">
                      <Link href="/dashboard/applications">View All Applications</Link>
                    </Button>
                  </div>
                  <div className="divide-y divide-border">
                    {applications.slice(0, 5).map((application) => (
                      <div key={application._id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{application.vacancy?.position || "Unknown Position"}</h4>
                            <p className="text-sm text-muted-foreground">
                              {/* {application.vacancy?.department} • {application.vacancy?.location} */}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
                                  application.status,
                                )}`}
                              >
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {application.submittedAt ? `Submitted ${formatDate(application.submittedAt)}` : "Draft"}
                              </span>
                            </div>
                          </div>
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/dashboard/applications/${application._id}`}>
                              <span className="sr-only">View application</span>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar">
          <Card className="bg-card">
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No upcoming events</h3>
                <p className="text-muted-foreground mb-6">
                  You don't have any scheduled interviews or upcoming deadlines.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommended Jobs */}
      {/* <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Recommended Jobs</h2>
          <Button asChild variant="outline">
            <Link href="/vacancies">View All Vacancies</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {[1, 2, 3].map((index) => (
            <Card key={index} className="bg-card">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">Senior Financial Analyst</h3>
                    <p className="text-sm text-muted-foreground">Finance Department</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                    Addis Ababa
                  </span>
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                    Full-Time
                  </span>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/vacancies/${index}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div> */}
    </div>
  )
}
