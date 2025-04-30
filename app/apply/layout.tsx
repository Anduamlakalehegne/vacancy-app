"use client"

import type React from "react"

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Remove the DashboardLayout wrapper since it's causing duplication
  // The MainLayout is already being used in the page component
  return <>{children}</>
}
