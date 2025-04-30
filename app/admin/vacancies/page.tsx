"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import VacancyManagementTable from "@/components/admin/vacancy-management-table"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface Vacancy {
  _id: string
  title: string
  department: string
  location: string
  status: string
  deadline: string
  createdAt: string
}

export default function AdminVacancies() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        const response = await fetch('/api/admin/vacancies/list')
        if (!response.ok) {
          throw new Error('Failed to fetch vacancies')
        }
        const data = await response.json()
        setVacancies(data)
      } catch (error) {
        console.error('Error fetching vacancies:', error)
        setError('Failed to load vacancies')
      } finally {
        setLoading(false)
      }
    }

    fetchVacancies()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vacancy Management</h1>
        <Link href="/admin/vacancies/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Vacancy
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Vacancies</CardTitle>
        </CardHeader>
        <CardContent>
          <VacancyManagementTable vacancies={vacancies} />
        </CardContent>
      </Card>
    </div>
  )
}
