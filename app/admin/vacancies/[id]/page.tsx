"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit2, Trash2, Calendar, MapPin, Users, DollarSign, GraduationCap, Briefcase, ClipboardList } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DeleteVacancyDialog } from "@/components/admin/vacancies/DeleteVacancyDialog"
import { use } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"

interface Vacancy {
  _id: string
  vacancyNumber: string
  position: string
  placeOfWork: string
  status: string
  startDate: string
  endDate: string
  createdAt: string
  requiredNumber: string
  education: string
  purpose: string
  experience: string
  responsibilities: string
  salary: string
}

export default function VacancyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vacancy, setVacancy] = useState<Vacancy | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { id } = use(params)

  useEffect(() => {
    const fetchVacancy = async () => {
      try {
        const response = await fetch(`/api/admin/vacancies/${id}`)
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
  }, [id])

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/vacancies/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete vacancy')
      }

      router.push('/admin/vacancies')
    } catch (error) {
      console.error('Error deleting vacancy:', error)
      setError('Failed to delete vacancy')
    }
  }

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
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vacancies
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/vacancies/${id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit Vacancy
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Vacancy
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">{vacancy.position}</CardTitle>
                <CardDescription className="mt-1">
                  Vacancy Number: {vacancy.vacancyNumber}
                </CardDescription>
              </div>
              <Badge variant={vacancy.status === 'active' ? 'default' : 'secondary'}>
                {vacancy.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{vacancy.placeOfWork}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Required: {vacancy.requiredNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{vacancy.salary}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(vacancy.startDate), 'MMM d, yyyy')} - {format(new Date(vacancy.endDate), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purpose Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Purpose
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{vacancy.purpose}</p>
          </CardContent>
        </Card>

        {/* Requirements Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{vacancy.education}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Experience Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{vacancy.experience}</p>
            </CardContent>
          </Card>
        </div>

        {/* Responsibilities Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Key Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {typeof vacancy.responsibilities === 'string' 
                ? vacancy.responsibilities.split('\n').map((responsibility, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      <p className="text-muted-foreground">{responsibility}</p>
                    </div>
                  ))
                : <p className="text-muted-foreground">No responsibilities specified</p>
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteVacancyDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
      />
    </div>
  )
} 