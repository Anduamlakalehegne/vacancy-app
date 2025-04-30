"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { previousExperienceSchema, type PreviousExperienceFormValues } from "@/lib/validation/application-schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, Loader2, Plus, Trash2 } from "lucide-react"

interface PreviousExperienceFormProps {
  defaultValues?: { previousExperience?: PreviousExperienceFormValues[] }
  onSubmit: (data: { previousExperience?: PreviousExperienceFormValues[] }) => void
  onBack: () => void
  onSaveDraft?: (data: { previousExperience?: PreviousExperienceFormValues[] }) => void
}

const formSchema = z.object({
  previousExperience: z.array(previousExperienceSchema).optional(),
})

export function PreviousExperienceForm({ defaultValues, onSubmit, onBack, onSaveDraft }: PreviousExperienceFormProps) {
  // Add debugging logs
  console.log("PreviousExperienceForm rendering with defaultValues:", defaultValues)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ previousExperience?: PreviousExperienceFormValues[] }>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      previousExperience: [
        {
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          responsibilities: "",
        },
      ],
    },
  })

  // Add debugging for fields
  const { fields, append, remove } = useFieldArray({
    control,
    name: "previousExperience",
  })

  console.log("Fields in PreviousExperienceForm:", fields)

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      const data = {
        previousExperience: fields.map((field, index) => ({
          company: (document.getElementById(`previousExperience.${index}.company`) as HTMLInputElement)?.value || "",
          position: (document.getElementById(`previousExperience.${index}.position`) as HTMLInputElement)?.value || "",
          startDate:
            (document.getElementById(`previousExperience.${index}.startDate`) as HTMLInputElement)?.value || "",
          endDate: (document.getElementById(`previousExperience.${index}.endDate`) as HTMLInputElement)?.value || "",
          responsibilities:
            (document.getElementById(`previousExperience.${index}.responsibilities`) as HTMLTextAreaElement)?.value ||
            "",
        })),
      }
      onSaveDraft(data)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Always ensure we have at least one field */}
      {fields.length === 0 && (
        <div className="flex justify-center mb-6">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              append({
                company: "",
                position: "",
                startDate: "",
                endDate: "",
                responsibilities: "",
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Add Previous Experience
          </Button>
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="space-y-6 border rounded-md p-6 relative">
          {fields.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor={`previousExperience.${index}.company`}>Company Name</Label>
              <Input
                id={`previousExperience.${index}.company`}
                placeholder="Enter company name"
                {...register(`previousExperience.${index}.company`)}
              />
              {errors.previousExperience?.[index]?.company && (
                <p className="text-sm text-destructive">{errors.previousExperience[index]?.company?.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`previousExperience.${index}.position`}>Position</Label>
              <Input
                id={`previousExperience.${index}.position`}
                placeholder="Enter your position"
                {...register(`previousExperience.${index}.position`)}
              />
              {errors.previousExperience?.[index]?.position && (
                <p className="text-sm text-destructive">{errors.previousExperience[index]?.position?.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`previousExperience.${index}.startDate`}>Start Date</Label>
              <Input
                id={`previousExperience.${index}.startDate`}
                type="date"
                {...register(`previousExperience.${index}.startDate`)}
              />
              {errors.previousExperience?.[index]?.startDate && (
                <p className="text-sm text-destructive">{errors.previousExperience[index]?.startDate?.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`previousExperience.${index}.endDate`}>End Date</Label>
              <Input
                id={`previousExperience.${index}.endDate`}
                type="date"
                {...register(`previousExperience.${index}.endDate`)}
              />
              {errors.previousExperience?.[index]?.endDate && (
                <p className="text-sm text-destructive">{errors.previousExperience[index]?.endDate?.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`previousExperience.${index}.responsibilities`}>Responsibilities</Label>
            <Textarea
              id={`previousExperience.${index}.responsibilities`}
              placeholder="Describe your responsibilities and achievements"
              rows={4}
              {...register(`previousExperience.${index}.responsibilities`)}
            />
            {errors.previousExperience?.[index]?.responsibilities && (
              <p className="text-sm text-destructive">{errors.previousExperience[index]?.responsibilities?.message}</p>
            )}
          </div>
        </div>
      ))}

      {fields.length > 0 && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              append({
                company: "",
                position: "",
                startDate: "",
                endDate: "",
                responsibilities: "",
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Add Another Previous Experience
          </Button>
        </div>
      )}

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
