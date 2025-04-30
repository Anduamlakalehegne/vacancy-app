export interface FormData {
  vacancyNumber: string
  startDate: string
  endDate: string
  position: string
  requiredNumber: string
  education: string
  purpose: string
  experience: string
  responsibilities: string
  placeOfWork: string
  salary: string
  status: "draft" | "active" | "closed"
} 