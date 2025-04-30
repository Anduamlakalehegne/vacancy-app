import Link from "next/link"
import Image from "next/image"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, BriefcaseBusiness, GraduationCap, Users } from "lucide-react"

export default function Home() {
  // Featured job categories
  const jobCategories = [
    {
      title: "Banking Operations",
      icon: BriefcaseBusiness,
      description: "Teller, Customer Service, Loan Officer, Branch Manager",
      count: 1,
    },
    {
      title: "Finance & Accounting",
      icon: GraduationCap,
      description: "Financial Analyst, Accountant, Auditor",
      count: 0,
    },
    {
      title: "IT & Technology",
      icon: Users,
      description: "Software Developer, IT Support, Cybersecurity Analyst",
      count: 0,
    },
  ]

  // Featured job listings
  const featuredJobs = [
    {
      title: "Senior Loan Officer",
      location: "Addis Ababa",
      type: "Full-Time",
      department: "Banking Operations",
      postedDate: "2 days ago",
    },
    {
      title: "IT Security Specialist",
      location: "Addis Ababa",
      type: "Full-Time",
      department: "IT & Technology",
      postedDate: "1 week ago",
    },
    {
      title: "Branch Manager",
      location: "Bahir Dar",
      type: "Full-Time",
      department: "Management",
      postedDate: "3 days ago",
    },
    {
      title: "Financial Analyst",
      location: "Addis Ababa",
      type: "Full-Time",
      department: "Finance",
      postedDate: "5 days ago",
    },
  ]

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-orange/10 to-brand-orange/5 py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Build Your Career at <span className="text-brand-orange">Wegagen Bank</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Discover exciting opportunities and join our team of dedicated professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg">
                  <Link href="/vacancies">Browse Vacancies</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/register">Create Account</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <Image
                src="/job.jpg?height=500&width=600"
                alt="Career at Wegagen Bank"
                width={500}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Job Categories Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Explore Job Categories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We offer diverse career opportunities across various departments. Find the perfect role that matches your
              skills and aspirations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {jobCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-primary/10 mb-4">
                      <category.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                    <p className="text-muted-foreground mb-4">{category.description}</p>
                    <div className="text-sm font-medium text-primary mb-4">{category.count} open positions</div>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/vacancies?category=${category.title}`}>View Jobs</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button asChild variant="link" className="text-primary">
              <Link href="/vacancies" className="flex items-center">
                View All Categories <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      {/* <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Opportunities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our latest job openings and take the next step in your career journey with Wegagen Bank.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredJobs.map((job, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                      <p className="text-muted-foreground mb-4">{job.department}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                          {job.location}
                        </span>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                          {job.type}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold">
                          {job.postedDate}
                        </span>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="shrink-0">
                      <Link href={`/vacancies/${index + 1}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/vacancies/${index + 1}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button asChild>
              <Link href="/vacancies">View All Vacancies</Link>
            </Button>
          </div>
        </div>
      </section> */}

      {/* Why Join Us Section */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <Image
                src="/job.jpg?height=400&width=500"
                alt="Why Join Wegagen Bank"
                width={500}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Why Join Wegagen Bank?</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Career Growth</h3>
                    <p className="text-muted-foreground">
                      We provide extensive training and clear career advancement paths for all employees.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Competitive Benefits</h3>
                    <p className="text-muted-foreground">
                      Enjoy competitive salaries, health benefits, and performance bonuses.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Inclusive Culture</h3>
                    <p className="text-muted-foreground">
                      We foster a diverse and inclusive workplace where everyone's contributions are valued.
                    </p>
                  </div>
                </div>
              </div>
              <Button asChild>
                <Link href="/about">Learn More About Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
            <p className="text-white/90 mb-8">
              Join our team and be part of a dynamic organization committed to excellence and innovation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="/vacancies">Browse Vacancies</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white/10"
              >
                <Link href="/register">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
