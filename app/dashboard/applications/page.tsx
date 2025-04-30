"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, RefreshCw, AlertCircle } from "lucide-react"
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

export default function ApplicationsPage() {
  const { data: session, status, update } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [retryCount, setRetryCount] = useState(0)

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      await update()
      toast({
        title: "Session Refreshed",
        description: "Your session has been refreshed.",
      })
      setRetryCount(retryCount + 1) // Trigger a refetch
    } catch (error) {
      console.error("Error refreshing session:", error)
      toast({
        title: "Error",
        description: "Failed to refresh session. Please try logging out and back in.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const fetchApplications = async () => {
      if (status !== "authenticated") return

      setLoading(true)
      try {
        const response = await fetch("/api/applications")

        if (!response.ok) {
          const errorData = await response.json()

          // If we get a 400 error about missing user ID, try to refresh the session
          if (response.status === 400 && errorData.error?.includes("User ID not found")) {
            if (retryCount < 2) {
              // Limit retries to prevent infinite loops
              console.log("User ID missing, refreshing session...")
              await refreshSession()
              return // Exit and let the retry happen via retryCount change
            }
          }

          throw new Error(errorData.error || "Failed to fetch applications")
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
  }, [status, toast, retryCount])

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

  // Filter applications based on active tab
  const filteredApplications = applications.filter((app) => {
    if (activeTab === "all") return true
    return app.status === activeTab
  })

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
        <h1 className="text-3xl font-bold mb-2">My Applications</h1>
        <p className="text-muted-foreground">Track and manage your job applications at Wegagen Bank</p>
      </div>

      {/* Session Information */}
      {/* {session?.user && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Session Information</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <p>Email: {session.user.email}</p>
                  <p>Name: {session.user.name}</p>
                  <p>ID: {session.user.id || session.user.sub || "Not found in session"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={refreshSession}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Session
                </Button>
                <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
                  Sign Out & Log In Again
                </Button>
              </div>
              {!session.user.id && !session.user.sub && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Session Error</AlertTitle>
                  <AlertDescription>
                    Your user ID is not showing. Please sign out and log in again to refresh your session.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )} */}

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Application History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="submitted">Submitted</TabsTrigger>
              <TabsTrigger value="under-review">Under Review</TabsTrigger>
              <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
              <TabsTrigger value="interview">Interview</TabsTrigger>
              <TabsTrigger value="hired">Hired</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <div className="space-y-6">
              {filteredApplications.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No applications found</h3>
                  <p className="text-muted-foreground mb-6">
                    {activeTab === "all"
                      ? "You haven't applied for any positions yet."
                      : `You don't have any applications with status "${activeTab}".`}
                  </p>
                  <Button asChild>
                    <Link href="/vacancies">Browse Vacancies</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredApplications.map((application) => (
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
                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/applications/${application._id}`}>View Details</Link>
                          </Button>
                          {application.status === "draft" && (
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/apply/${application.vacancyId}`}>Continue</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
