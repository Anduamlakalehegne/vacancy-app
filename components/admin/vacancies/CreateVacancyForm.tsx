"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FormData } from "@/types/vacancy"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface VacancyNumber {
  _id: string
  vacancyNumber: string
  startDate: string
  endDate: string
}

export default function CreateVacancyForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("vacancy-number")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [vacancyNumbers, setVacancyNumbers] = useState<VacancyNumber[]>([])
  const [formData, setFormData] = useState<FormData>({
    vacancyNumber: "",
    startDate: "",
    endDate: "",
    position: "",
    requiredNumber: "",
    education: "",
    purpose: "",
    experience: "",
    responsibilities: "",
    placeOfWork: "",
    salary: "As Per the Banks Salary Scale and Attractive",
    status: "draft"
  })

  useEffect(() => {
    const fetchVacancyNumbers = async () => {
      try {
        const response = await fetch('/api/admin/vacancies/list-numbers')
        if (!response.ok) {
          throw new Error('Failed to fetch vacancy numbers')
        }
        const data = await response.json()
        if (data.success) {
          setVacancyNumbers(data.vacancyNumbers)
        }
      } catch (error) {
        console.error('Error fetching vacancy numbers:', error)
      }
    }

    fetchVacancyNumbers()
  }, [])

  const handleGenerateVacancyNumber = async () => {
    setLoading(true)
    setError("")

    if (!formData.startDate || !formData.endDate) {
      setError("Please fill in both start date and end date first")
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/vacancies/create-vacancy-number', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: formData.startDate,
          endDate: formData.endDate
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate vacancy number')
      }

      const data = await response.json()
      if (data.success && data.vacancyNumber) {
        setFormData(prev => ({ ...prev, vacancyNumber: data.vacancyNumber }))
        // Refresh the vacancy numbers list
        const numbersResponse = await fetch('/api/admin/vacancies/list-numbers')
        if (numbersResponse.ok) {
          const numbersData = await numbersResponse.json()
          if (numbersData.success) {
            setVacancyNumbers(numbersData.vacancyNumbers)
          }
        }
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error("Error generating vacancy number:", error)
      setError(error instanceof Error ? error.message : "Failed to generate vacancy number. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVacancyNumberSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!formData.startDate || !formData.endDate || !formData.vacancyNumber) {
      setError("Please fill in all required fields and generate a vacancy number")
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/vacancies/create-vacancy-number', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vacancyNumber: formData.vacancyNumber,
          startDate: formData.startDate,
          endDate: formData.endDate
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save vacancy number')
      }

      setActiveTab("vacancy-details")
    } catch (error) {
      console.error("Error saving vacancy number:", error)
      setError(error instanceof Error ? error.message : "Failed to save vacancy number. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVacancyDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/admin/vacancies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: "active"
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create vacancy')
      }

      router.push("/admin/vacancies")
    } catch (error) {
      console.error("Error creating vacancy:", error)
      setError(error instanceof Error ? error.message : "Failed to create vacancy. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVacancyNumberChange = (value: string) => {
    const selectedVacancy = vacancyNumbers.find(v => v.vacancyNumber === value)
    if (selectedVacancy) {
      setFormData(prev => ({
        ...prev,
        vacancyNumber: selectedVacancy.vacancyNumber,
        startDate: selectedVacancy.startDate,
        endDate: selectedVacancy.endDate
      }))
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex space-x-4 mb-6">
        <Button
          variant={activeTab === "vacancy-number" ? "default" : "outline"}
          onClick={() => setActiveTab("vacancy-number")}
        >
          Step 1: Create Vacancy Number
        </Button>
        <Button
          variant={activeTab === "vacancy-details" ? "default" : "outline"}
          onClick={() => setActiveTab("vacancy-details")}
        >
          Step 2: Add Vacancy Details
        </Button>
      </div>

      {activeTab === "vacancy-number" && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Vacancy Number</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVacancyNumberSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vacancyNumber">Vacancy Number</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="vacancyNumber"
                      value={formData.vacancyNumber}
                      readOnly
                      placeholder="Click generate to create vacancy number"
                      className="flex-1"
                    />
                    <Button 
                      type="button"
                      onClick={handleGenerateVacancyNumber}
                      disabled={loading || !formData.startDate || !formData.endDate}
                    >
                      {loading ? "Generating..." : "Generate"}
                    </Button>
                  </div>
                </div>
              </div>
              <Button type="submit" disabled={loading || !formData.vacancyNumber}>
                {loading ? "Saving..." : "Save and Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "vacancy-details" && (
        <Card>
          <CardHeader>
            <CardTitle>Add Vacancy Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVacancyDetailsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vacancyNumber">Vacancy Number</Label>
                <Select
                  value={formData.vacancyNumber}
                  onValueChange={handleVacancyNumberChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vacancy number" />
                  </SelectTrigger>
                  <SelectContent>
                    {vacancyNumbers.map((vn) => (
                      <SelectItem key={vn._id} value={vn.vacancyNumber}>
                        {vn.vacancyNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requiredNumber">Required Number</Label>
                <Input
                  id="requiredNumber"
                  type="number"
                  value={formData.requiredNumber}
                  onChange={(e) => setFormData({ ...formData, requiredNumber: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Textarea
                  id="education"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Textarea
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibilities">Responsibilities</Label>
                <Textarea
                  id="responsibilities"
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="placeOfWork">Place of Work</Label>
                <Input
                  id="placeOfWork"
                  value={formData.placeOfWork}
                  onChange={(e) => setFormData({ ...formData, placeOfWork: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Vacancy"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 