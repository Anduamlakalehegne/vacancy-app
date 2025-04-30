"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Vacancy {
  _id: string
  title: string
  department: string
  location: string
}

interface Application {
  _id: string
  vacancyId: string
  status: string
  submittedAt: string
}

export default function ApplicationConfirmationPage() {
  const params = useParams()
  const jobId = params.id as string
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [vacancy, setVacancy] = useState<Vacancy | null>(null)
  const [application, setApplication] = useState<Application | null>(null)

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

        // Fetch application details
        const applicationsResponse = await fetch(`/api/applications?vacancyId=${jobId}`)
        if (!applicationsResponse.ok) {
          throw new Error("Failed to fetch application")
        }
        const applications = await applicationsResponse.json()

        if (applications.length > 0) {
          setApplication(applications[0])
        } else {
          // No application found, redirect to vacancy page
          toast({
            title: "No Application Found",
            description: "You haven't applied for this position yet.",
            variant: "destructive",
          })
          // Redirect to vacancy page
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
  }, [jobId, status, toast])

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8 flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardContent className="pt-12 pb-10 px-8">
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>

              <p className="text-muted-foreground mb-8">
                Thank you for applying to Wegagen Bank. Your application for the position of
                <span className="font-medium text-foreground"> {vacancy?.title} </span>
                has been successfully submitted.
              </p>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-muted rounded-md">
                  <h2 className="font-semibold mb-2">What happens next?</h2>
                  <ol className="text-sm text-muted-foreground text-left list-decimal pl-5 space-y-2">
                    <li>Our recruitment team will review your application</li>
                    <li>If your profile matches our requirements, we'll contact you for an interview</li>
                    <li>You can track the status of your application in your account dashboard</li>
                  </ol>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/dashboard/applications">View Application Status</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/vacancies">Browse More Vacancies</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
