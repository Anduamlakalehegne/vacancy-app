"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface Application {
  _id: string
  status: string
  createdAt: string
  user: { name: string; email: string }[]
  vacancy: { title: string }[]
}

export default function RecentApplicationsTable({ applications }: { applications: Application[] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "shortlisted":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applied</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.length > 0 ? (
            applications.map((application) => (
              <TableRow key={application._id}>
                <TableCell className="font-medium">
                  {application.user[0]?.name || "Unknown"}
                  <div className="text-xs text-muted-foreground">{application.user[0]?.email || "No email"}</div>
                </TableCell>
                <TableCell>{application.vacancy[0]?.title || "Unknown Position"}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(application.status)}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                </TableCell>
                {/* <TableCell>{formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}</TableCell> */}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No recent applications
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
