"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Search, Loader2, Calendar, MapPin, GraduationCap, Briefcase } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

// Define the Vacancy type
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

export default function VacanciesPage() {
  const { toast } = useToast()
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("all")
  const [location, setLocation] = useState("all")

  // Fetch vacancies on initial load
  useEffect(() => {
    fetchVacancies()
  }, [])

  // Fetch vacancies with filters
  const fetchVacancies = async (filters = {}) => {
    setLoading(true)
    try {
      // Build query string from filters
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (category !== "all") params.append("category", category)
      if (location !== "all") params.append("location", location)

      const response = await fetch(`/api/vacancies?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error response from API:", errorData)
        throw new Error(errorData.error || "Failed to fetch vacancies")
      }

      const data = await response.json()
      setVacancies(data)
    } catch (error) {
      console.error("Error fetching vacancies:", error)
      toast({
        title: "Error",
        description: "Failed to load vacancies. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle search
  const handleSearch = () => {
    fetchVacancies({ search: searchTerm, category, location })
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy")
  }

  // Calculate days remaining until deadline
  const getDaysRemaining = (endDate: string) => {
    const deadlineDate = new Date(endDate)
    const today = new Date()
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? `${diffDays} days remaining` : "Deadline passed"
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-orange/10 to-brand-orange/5 rounded-lg p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Current Vacancies</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Explore our open positions and find the perfect opportunity to grow your career with Wegagen Bank.
          </p>

          {/* Search and Filter */}
          <div className="bg-background rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Banking Operations">Banking Operations</SelectItem>
                  <SelectItem value="Finance & Accounting">Finance & Accounting</SelectItem>
                  <SelectItem value="IT & Technology">IT & Technology</SelectItem>
                  <SelectItem value="Management">Management & Leadership</SelectItem>
                  <SelectItem value="Internships">Internships & Trainee</SelectItem>
                </SelectContent>
              </Select>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Addis Ababa">Addis Ababa</SelectItem>
                  <SelectItem value="Bahir Dar">Bahir Dar</SelectItem>
                  <SelectItem value="Hawassa">Hawassa</SelectItem>
                  <SelectItem value="Multiple Locations">Multiple Locations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleSearch}>Search Vacancies</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : vacancies.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">No vacancies found</h2>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setCategory("all")
                setLocation("all")
                fetchVacancies()
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 w-[80%] mx-auto">
            {vacancies.map((job) => (
              <Card key={job._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="mb-4 md:mb-0">
                      <div>
                        <h3 className="font-semibold">{job.position}</h3>
                        <span className="text-sm text-muted-foreground">
                          Vacancy Number: {job.vacancyNumber}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                          <MapPin className="h-3 w-3 mr-1" />
                          {job.placeOfWork}
                        </span>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                          <Briefcase className="h-3 w-3 mr-1" />
                          Required: {job.requiredNumber}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold">
                          <Calendar className="h-3 w-3 mr-1" />
                          Posted: {formatDate(job.startDate)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {job.purpose 
                          ? `${job.purpose.substring(0, 100)}...`
                          : 'No description available'}
                      </p>
                      <div className="space-y-2">
                      {/* <p className="text-sm font-medium">
                          <GraduationCap className="h-4 w-4 inline mr-1" />
                          Education: <span className="text-muted-foreground">{job.education}</span>
                        </p>
                        <p className="text-sm font-medium">
                          <Briefcase className="h-4 w-4 inline mr-1" />
                          Experience: <span className="text-muted-foreground">{job.experience}</span>
                        </p>
                        <p className="text-sm font-medium">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Deadline: <span className="text-primary">{formatDate(job.endDate)}</span>
                          <span className="ml-2 text-xs text-muted-foreground">({getDaysRemaining(job.endDate)})</span>
                      </p> */}
                      </div>
                    </div>
                    <div className="flex flex-col justify-center gap-2 md:min-w-32">
                      <Button asChild>
                        <Link href={`/vacancies/${job._id}`}>View Details</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href={`/apply/${job._id}`}>Apply Now</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Pagination - simplified for now */}
      {!loading && vacancies.length > 0 && (
        <section className="pb-6">
          <div className="flex justify-center">
            <nav className="flex items-center gap-1">
              <Button variant="outline" size="icon" disabled>
                <ArrowRight className="h-4 w-4 rotate-180" />
                <span className="sr-only">Previous page</span>
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="icon">
                <ArrowRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </nav>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-muted rounded-lg p-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Don't See What You're Looking For?</h2>
          <p className="text-muted-foreground mb-6">
            Submit your resume to our talent pool and we'll contact you when a suitable position becomes available.
          </p>
          <Button asChild>
            <Link href="/talent-pool">Join Our Talent Pool</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
