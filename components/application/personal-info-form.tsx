"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { personalInfoSchema, type PersonalInfoFormValues } from "@/lib/validation/application-schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PersonalInfoFormProps {
  defaultValues?: PersonalInfoFormValues
  onSubmit: (data: PersonalInfoFormValues) => void
  onSaveDraft?: (data: PersonalInfoFormValues) => void
}

export function PersonalInfoForm({ defaultValues, onSubmit, onSaveDraft }: PersonalInfoFormProps) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: defaultValues || {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
    },
  })

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "The file size exceeds the 5MB limit.",
        variant: "destructive",
      })
      return
    }

    // Check file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only PDF and Word documents are allowed.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setFileName(file.name)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload file")
      }

      const data = await response.json()
      setValue("resumeUrl", data.fileUrl)

      toast({
        title: "File uploaded",
        description: "Your resume has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload your resume. Please try again.",
        variant: "destructive",
      })
      setFileName(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      const data = {
        firstName: (document.getElementById("firstName") as HTMLInputElement)?.value || "",
        lastName: (document.getElementById("lastName") as HTMLInputElement)?.value || "",
        email: (document.getElementById("email") as HTMLInputElement)?.value || "",
        phone: (document.getElementById("phone") as HTMLInputElement)?.value || "",
        address: (document.getElementById("address") as HTMLInputElement)?.value || "",
        city: (document.getElementById("city") as HTMLInputElement)?.value || "",
        resumeUrl: (document.getElementById("resumeUrl") as HTMLInputElement)?.value || "",
      }
      onSaveDraft(data)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" placeholder="Enter your first name" {...register("firstName")} />
          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" placeholder="Enter your last name" {...register("lastName")} />
          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="Enter your email address" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" placeholder="Enter your phone number" {...register("phone")} />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" placeholder="Enter your address" {...register("address")} />
          {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" placeholder="Enter your city" {...register("city")} />
          {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="resume">Resume/CV</Label>
        <input type="hidden" id="resumeUrl" {...register("resumeUrl")} />
        <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          {fileName ? (
            <p className="text-sm font-medium mb-2">{fileName}</p>
          ) : (
            <p className="text-sm text-muted-foreground mb-2">Drag and drop your resume/CV here, or click to browse</p>
          )}
          <p className="text-xs text-muted-foreground mb-4">Supported formats: PDF, DOCX, DOC (Max 5MB)</p>
          <div className="relative">
            <Button type="button" variant="outline" size="sm" disabled={isUploading} className="relative">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Browse Files"
              )}
            </Button>
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={handleSaveDraft}>
          Save Draft
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Next"
          )}
        </Button>
      </div>
    </form>
  )
}
