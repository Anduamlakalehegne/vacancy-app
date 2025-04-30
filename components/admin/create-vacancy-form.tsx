"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"

interface VacancyNumber {
  _id: string
  vacancyNumber: string
  startDate: string
  endDate: string
}

interface FormData {
  vacancyNumber: string
  startDate: string
  endDate: string
  position: string
  requiredNumber: string
  education: string
  purpose: string
  experience: string
  responsibilities: string
  placeOfWork: string
  salary: string
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
    salary: "As Per the Banks Salary Scale and Attractive"
  })

  const handleVacancyNumberSubmit = async (e: React.FormEvent) => {
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
          vacancyNumber: formData.vacancyNumber,
          startDate: formData.startDate,
          endDate: formData.endDate,
          status: "draft"
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create vacancy number')
      }

      // Fetch updated vacancy numbers list
      const numbersResponse = await fetch('/api/admin/vacancies/list')
      if (numbersResponse.ok) {
        const data = await numbersResponse.json()
        setVacancyNumbers(data)
      }

      setActiveTab("vacancy-details")
    } catch (error) {
      console.error("Error creating vacancy number:", error)
      setError("Failed to create vacancy number. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVacancyDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/vacancies/${formData.vacancyNumber}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          position: formData.position,
          requiredNumber: formData.requiredNumber,
          education: formData.education,
          purpose: formData.purpose,
          experience: formData.experience,
          responsibilities: formData.responsibilities,
          placeOfWork: formData.placeOfWork,
          salary: formData.salary,
          status: "active"
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update vacancy details')
      }

      router.push("/admin/vacancies")
    } catch (error) {
      console.error("Error updating vacancy details:", error)
      setError("Failed to update vacancy details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && <div className="text-red-500">{error}</div>}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vacancy-number">Vacancy Number</TabsTrigger>
          <TabsTrigger value="vacancy-details" disabled={!formData.vacancyNumber}>
            Vacancy Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vacancy-number">
          <form onSubmit={handleVacancyNumberSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="vacancyNumber">Vacancy Number</Label>
                <Input
                  id="vacancyNumber"
                  value={formData.vacancyNumber}
                  onChange={(e) => setFormData({ ...formData, vacancyNumber: e.target.value })}
                  placeholder="WB/EXT/0001/2025"
                  required
                />
              </div>

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
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Vacancy Number"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="vacancy-details">
          <form onSubmit={handleVacancyDetailsSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Label htmlFor="purpose">Purpose of the Job</Label>
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
                <Label htmlFor="responsibilities">Role and Responsibilities</Label>
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
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Vacancy Details"}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
} 