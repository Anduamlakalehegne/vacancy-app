"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Search, Filter, Calendar } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { DatePicker } from "@/components/ui/date-picker"
import { useRouter } from "next/navigation"

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
}

interface Vacancy {
  _id: string
  vacancyNumber: string
  position: string
  status: string
}

export default function ApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [selectedVacancy, setSelectedVacancy] = useState<string>("")
  const [selectedPosition, setSelectedPosition] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [searchQuery, setSearchQuery] = useState("")

  // Get unique positions for the selected vacancy
  const positions = selectedVacancy !== "all"
    ? [...new Set(applications
        .filter(app => app.vacancyNumber === selectedVacancy)
        .map(app => app.position))]
    : []

  // Filter applications based on selected criteria
  const filteredApplications = applications.filter(application => {
    // If "All Vacancies" is selected, show all applications without position filtering
    if (selectedVacancy === "all") {
      const matchesDate = !selectedDate || 
        format(new Date(application.appliedDate), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
      const matchesSearch = !searchQuery || 
        application.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        application.email.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesDate && matchesSearch
    }
    
    // If specific vacancy is selected
    const matchesVacancy = application.vacancyNumber === selectedVacancy
    
    // If specific position is selected, filter by position
    const matchesPosition = selectedPosition === "all" ? true : application.position === selectedPosition
    
    const matchesDate = !selectedDate || 
      format(new Date(application.appliedDate), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    const matchesSearch = !searchQuery || 
      application.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      application.email.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesVacancy && matchesPosition && matchesDate && matchesSearch
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch vacancies
        const vacanciesResponse = await fetch('/api/admin/vacancies')
        if (!vacanciesResponse.ok) {
          throw new Error('Failed to fetch vacancies')
        }
        const vacanciesData = await vacanciesResponse.json()
        setVacancies(vacanciesData)

        // Fetch applications
        const applicationsResponse = await fetch('/api/admin/applications')
        if (!applicationsResponse.ok) {
          throw new Error('Failed to fetch applications')
        }
        const applicationsData = await applicationsResponse.json()
        setApplications(applicationsData)
  } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleVacancyChange = (value: string) => {
    setSelectedVacancy(value)
    setSelectedPosition("") // Reset position when vacancy changes
  }

  const handlePositionChange = (value: string) => {
    setSelectedPosition(value)
  }

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleViewDetails = (id: string) => {
    router.push(`/admin/applications/${id}`)
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Applications</h1>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Vacancy Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">By Vacancy Number</label>
              <Select value={selectedVacancy} onValueChange={handleVacancyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vacancy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vacancies</SelectItem>
                  {vacancies.map((vacancy) => (
                    <SelectItem key={vacancy._id} value={vacancy.vacancyNumber}>
                      {vacancy.vacancyNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Position Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">By Position</label>
              <Select 
                value={selectedPosition} 
                onValueChange={handlePositionChange}
                disabled={!selectedVacancy}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">By Date</label>
              <DatePicker
                date={selectedDate}
                setDate={handleDateChange}
                placeholder="Select date"
              />
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Application List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Vacancy Number</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">No applications found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((application) => (
                  <TableRow key={application._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{application.applicantName}</p>
                        <p className="text-sm text-muted-foreground">{application.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{application.position}</TableCell>
                    <TableCell>{application.vacancyNumber}</TableCell>
                    <TableCell>
                      {format(new Date(application.appliedDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
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
                      >
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(application._id)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
