"use client"

import type React from "react"
import { useSession } from "next-auth/react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { MainLayout } from "@/components/layout/main-layout"

export default function VacanciesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useSession()

  // If user is authenticated, use DashboardLayout
  if (status === "authenticated") {
    return <DashboardLayout>{children}</DashboardLayout>
  }

  // For non-authenticated users, use MainLayout
  return <MainLayout>{children}</MainLayout>
}
