"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MapPin, Phone, Building2, Users, Target, Heart, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6 max-w-3xl mx-auto"
          >
            <h1 className="text-5xl font-bold tracking-tight">About Wegagen Bank</h1>
            <p className="text-xl text-muted-foreground">
              Wegagen Bank S.C. is one of the leading private commercial banks in Ethiopia, providing a wide range of financial services to individuals, businesses, and institutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold">Who We Are</h2>
            <p className="text-lg text-muted-foreground">
              Established in 1997, Wegagen Bank S.C. has grown to become one of Ethiopia's most prominent private banks, with an extensive branch network across the country.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/5 p-4 rounded-lg">
                <Users className="h-6 w-6 text-primary mb-2" />
                <p className="font-semibold">400+ Branches</p>
                <p className="text-sm text-muted-foreground">Nationwide</p>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg">
                <Building2 className="h-6 w-6 text-primary mb-2" />
                <p className="font-semibold">Headquarters</p>
                <p className="text-sm text-muted-foreground">Wegagen Tower</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl" />
              <Building2 className="h-48 w-48 text-primary relative" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-3 gap-8"
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To provide innovative, customer-focused financial solutions that foster economic growth and prosperity for individuals and businesses in Ethiopia.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To be the most preferred and trusted bank in Ethiopia, recognized for excellence in service, technology, and social responsibility.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Our Values</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Integrity
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Customer Focus
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Innovation
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Teamwork
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Social Responsibility
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-primary/5 rounded-2xl p-12 text-center space-y-6"
        >
          <h2 className="text-3xl font-bold">Join Our Journey</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're looking for a rewarding career or reliable banking services, Wegagen Bank is here for you.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/vacancies">
              <Button size="lg" className="gap-2">
                View Vacancies
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="gap-2">
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
} 