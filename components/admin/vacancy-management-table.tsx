"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, Edit, Trash, MoreHorizontal, Search, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Vacancy {
  _id: string
  vacancyNumber: string
  position: string
  placeOfWork: string
  status: string
  startDate: string
  endDate: string
  createdAt: string
  requiredNumber: string
}

export default function VacancyManagementTable({ vacancies: initialVacancies }: { vacancies: Vacancy[] }) {
  const [vacancies, setVacancies] = useState(initialVacancies)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [vacancyToDelete, setVacancyToDelete] = useState<string | null>(null)
  const router = useRouter()

  const filteredVacancies = vacancies.filter(
    (vacancy) =>
      vacancy.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacancy.placeOfWork?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacancy.vacancyNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleStatusChange = async (vacancyId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/vacancies/${vacancyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setVacancies(
          vacancies.map((vacancy) => (vacancy._id === vacancyId ? { ...vacancy, status: newStatus } : vacancy)),
        )
      }
    } catch (error) {
      console.error("Error updating vacancy status:", error)
    }
  }

  const handleDeleteVacancy = async () => {
    if (!vacancyToDelete) return

    try {
      const response = await fetch(`/api/admin/vacancies/${vacancyToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setVacancies(vacancies.filter((vacancy) => vacancy._id !== vacancyToDelete))
        setDeleteDialogOpen(false)
        setVacancyToDelete(null)
      }
    } catch (error) {
      console.error("Error deleting vacancy:", error)
    }
  }

  const confirmDelete = (vacancyId: string) => {
    setVacancyToDelete(vacancyId)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vacancies..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vacancy Number</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Place of Work</TableHead>
              <TableHead>Required Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVacancies.length > 0 ? (
              filteredVacancies.map((vacancy) => (
                <TableRow key={vacancy._id}>
                  <TableCell className="font-medium">{vacancy.vacancyNumber}</TableCell>
                  <TableCell>{vacancy.position}</TableCell>
                  <TableCell>{vacancy.placeOfWork}</TableCell>
                  <TableCell>{vacancy.requiredNumber}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        vacancy.status === "active"
                          ? "bg-green-500"
                          : vacancy.status === "closed"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                      }
                    >
                      {(vacancy.status || "draft").charAt(0).toUpperCase() + (vacancy.status || "draft").slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {vacancy.endDate ? format(new Date(vacancy.endDate), "MMM d, yyyy") : "No deadline"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/vacancies/${vacancy._id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/vacancies/${vacancy._id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(vacancy._id, "active")}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Activate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(vacancy._id, "closed")}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Close
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={() => confirmDelete(vacancy._id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No vacancies found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vacancy and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVacancy} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
