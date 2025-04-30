"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ArrowLeft, Calendar, MapPin, GraduationCap, Briefcase, Users, DollarSign, FileText } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import Link from "next/link"

interface Vacancy {
  _id: string
  vacancyNumber: string
  startDate: string
  endDate: string
  position: string
  requiredNumber: string
  education: string
  purpose: string
  experience: string
  responsibilities: string[]
  placeOfWork: string
  salary: string
  status: string
  requirements: string[]
  createdAt: string
  updatedAt: string
}

export default function VacancyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [vacancy, setVacancy] = useState<Vacancy | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVacancy = async () => {
      try {
        const { id } = await params
        const response = await fetch(`/api/vacancies/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch vacancy')
        }
        const data = await response.json()
        setVacancy(data)
      } catch (error) {
        console.error('Error fetching vacancy:', error)
        setError('Failed to load vacancy details')
      } finally {
        setLoading(false)
      }
    }

    fetchVacancy()
  }, [params])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !vacancy) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-red-500">{error || 'Vacancy not found'}</p>
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
          <div>
            <h1 className="text-3xl font-bold">{vacancy.position}</h1>
            <p className="text-muted-foreground">Vacancy Number: {vacancy.vacancyNumber}</p>
          </div>
        </div>
        <Badge
          variant={vacancy.status === "active" ? "default" : "secondary"}
          className="text-lg px-4 py-1"
        >
          {vacancy.status}
        </Badge>
        </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Place of Work</p>
                  <p className="text-sm text-muted-foreground">{vacancy.placeOfWork}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Required Number</p>
                  <p className="text-sm text-muted-foreground">{vacancy.requiredNumber}</p>
                </div>
                </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Salary</p>
                  <p className="text-sm text-muted-foreground">{vacancy.salary}</p>
                </div>
                </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Application Period</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(vacancy.startDate), "MMM d, yyyy")} - {format(new Date(vacancy.endDate), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                <h3 className="font-medium mb-2">Education</h3>
                <p className="text-sm text-muted-foreground">{vacancy.education}</p>
                </div>
                <div>
                <h3 className="font-medium mb-2">Experience</h3>
                <p className="text-sm text-muted-foreground">{vacancy.experience}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Info */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Purpose</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{vacancy.purpose}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Responsibilities</h3>
                <ul className="list-disc list-inside space-y-2">
                  {vacancy.responsibilities.map((responsibility, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {responsibility}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Additional Requirements</h3>
                <ul className="list-disc list-inside space-y-2">
                  {vacancy.requirements.map((requirement, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button asChild size="lg">
              <Link href={`/apply/${vacancy._id}`}>
                Apply Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
