"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CreateVacancyForm from "@/components/admin/vacancies/CreateVacancyForm"

export default function CreateVacancyPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Vacancy</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Vacancy Information</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateVacancyForm />
        </CardContent>
      </Card>
    </div>
  )
} 