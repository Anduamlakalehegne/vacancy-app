"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { currentExperienceSchema, type CurrentExperienceFormValues } from "@/lib/validation/application-schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"

interface WorkExperienceFormProps {
  defaultValues?: { currentExperience?: CurrentExperienceFormValues }
  onSubmit: (data: { currentExperience?: CurrentExperienceFormValues }) => void
  onBack: () => void
  onSaveDraft?: (data: { currentExperience?: CurrentExperienceFormValues }) => void
}

const formSchema = z.object({
  currentExperience: currentExperienceSchema.optional(),
})

export function WorkExperienceForm({ defaultValues, onSubmit, onBack, onSaveDraft }: WorkExperienceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ currentExperience?: CurrentExperienceFormValues }>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      currentExperience: {
        company: "",
        position: "",
        startDate: "",
        currentSalary: "",
        responsibilities: "",
      },
    },
  })

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      const data = {
        currentExperience: {
          company: (document.getElementById("currentExperience.company") as HTMLInputElement)?.value || "",
          position: (document.getElementById("currentExperience.position") as HTMLInputElement)?.value || "",
          startDate: (document.getElementById("currentExperience.startDate") as HTMLInputElement)?.value || "",
          currentSalary: (document.getElementById("currentExperience.currentSalary") as HTMLInputElement)?.value || "",
          responsibilities:
            (document.getElementById("currentExperience.responsibilities") as HTMLTextAreaElement)?.value || "",
        },
      }
      onSaveDraft(data)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6 border rounded-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="currentExperience.company">Company Name</Label>
            <Input
              id="currentExperience.company"
              placeholder="Enter company name"
              {...register("currentExperience.company")}
            />
            {errors.currentExperience?.company && (
              <p className="text-sm text-destructive">{errors.currentExperience.company.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentExperience.position">Position</Label>
            <Input
              id="currentExperience.position"
              placeholder="Enter your position"
              {...register("currentExperience.position")}
            />
            {errors.currentExperience?.position && (
              <p className="text-sm text-destructive">{errors.currentExperience.position.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentExperience.startDate">Start Date</Label>
            <Input id="currentExperience.startDate" type="date" {...register("currentExperience.startDate")} />
            {errors.currentExperience?.startDate && (
              <p className="text-sm text-destructive">{errors.currentExperience.startDate.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentExperience.currentSalary">Current Salary (Optional)</Label>
            <Input
              id="currentExperience.currentSalary"
              placeholder="Enter your current salary"
              {...register("currentExperience.currentSalary")}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentExperience.responsibilities">Responsibilities</Label>
          <Textarea
            id="currentExperience.responsibilities"
            placeholder="Describe your responsibilities and achievements"
            rows={4}
            {...register("currentExperience.responsibilities")}
          />
          {errors.currentExperience?.responsibilities && (
            <p className="text-sm text-destructive">{errors.currentExperience.responsibilities.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
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
            <>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
