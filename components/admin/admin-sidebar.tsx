"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { LayoutDashboard, Users, Briefcase, FileText, Settings, ChevronLeft, X, BarChart } from "lucide-react"

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/vacancies", label: "Vacancies", icon: Briefcase },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/applications", label: "Applications", icon: FileText },
    { href: "/admin/reports", label: "Reports", icon: BarChart },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]

  // Check if current path matches the given path
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!session?.user?.name) return "A"
    const nameParts = session.user.name.split(" ")
    return nameParts.length > 1 ? (nameParts[0][0] + nameParts[1][0]).toUpperCase() : nameParts[0][0].toUpperCase()
  }

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-20 bg-black/80 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30
          bg-background border-r
          transform transition-all duration-200 ease-in-out
          ${isCollapsed ? "w-20" : "w-64"}
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            {!isCollapsed && (
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo2-mgqcChgJxoI7DWmu9EKyqp4vd5WJtn.png"
                alt="Wegagen Bank Logo"
                width={120}
                height={30}
                className="h-auto"
              />
            )}
          </Link>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden lg:flex" 
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronLeft className={`h-5 w-5 transition-transform duration-200 ${isCollapsed ? "rotate-180" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
              return (
                <Link
                key={item.href}
                  href={item.href}
                className={`
                  flex items-center gap-3 rounded-md px-3 py-2
                  transition-colors duration-200
                  ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </nav>

        <Separator className="my-4" />

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "Admin"} />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
