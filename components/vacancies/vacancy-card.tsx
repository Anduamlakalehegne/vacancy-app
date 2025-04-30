import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface VacancyCardProps {
  vacancy: {
    _id: string
    title: string
    location: string
    type: string
    department: string
    postedDate: string
    description: string
    deadline: string
  }
}

export function VacancyCard({ vacancy }: VacancyCardProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Calculate days remaining until deadline
  const getDaysRemaining = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? `${diffDays} days remaining` : "Deadline passed"
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-semibold mb-2">{vacancy.title}</h3>
            <p className="text-muted-foreground mb-4">{vacancy.department}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                {vacancy.location}
              </span>
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                {vacancy.type}
              </span>
              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold">
                Posted: {formatDate(vacancy.postedDate)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{vacancy.description.substring(0, 200)}...</p>
            <p className="text-sm font-medium">
              Deadline: <span className="text-primary">{formatDate(vacancy.deadline)}</span>
              <span className="ml-2 text-xs text-muted-foreground">({getDaysRemaining(vacancy.deadline)})</span>
            </p>
          </div>
          <div className="flex flex-col justify-center gap-2 md:min-w-32">
            <Button asChild>
              <Link href={`/vacancies/${vacancy._id}`}>View Details</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/apply/${vacancy._id}`}>Apply Now</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
