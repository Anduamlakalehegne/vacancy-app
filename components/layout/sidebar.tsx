"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { BarChart, BriefcaseBusiness, FileText, Home, LogOut, PanelLeft, Settings, User, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

// Since the sidebar component isn't available by default in shadcn/ui,
// let's create a simpler version using standard components
export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  return (
    <div className="hidden md:flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/admin/dashboard" className="flex items-center space-x-2">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo2-mgqcChgJxoI7DWmu9EKyqp4vd5WJtn.png"
            alt="Wegagen Bank Logo"
            width={120}
            height={30}
            className="h-auto"
          />
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
              isActive("/admin/dashboard")
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/admin/vacancies"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
              isActive("/admin/vacancies")
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <BriefcaseBusiness className="h-4 w-4" />
            <span>Vacancies</span>
          </Link>

          <Link
            href="/admin/applications"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
              isActive("/admin/applications")
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Applications</span>
          </Link>

          <Link
            href="/admin/candidates"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
              isActive("/admin/candidates")
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Candidates</span>
          </Link>

          <Link
            href="/admin/reports"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
              isActive("/admin/reports")
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <BarChart className="h-4 w-4" />
            <span>Reports</span>
          </Link>

          <Link
            href="/admin/settings"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
              isActive("/admin/settings")
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>

      <div className="border-t p-4">
        <nav className="grid gap-1">
          <Link
            href="/admin/profile"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>

          <Link
            href="/logout"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Link>
        </nav>
      </div>

      <Button variant="ghost" size="icon" className="absolute left-0 top-4 md:hidden" aria-label="Toggle Menu">
        <PanelLeft className="h-4 w-4" />
      </Button>
    </div>
  )
}
