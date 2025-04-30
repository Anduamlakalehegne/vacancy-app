"use client"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { educationSchema, type EducationFormValues } from "@/lib/validation/application-schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, Loader2, Plus, Trash2 } from "lucide-react"

interface EducationFormProps {
  defaultValues?: { education: EducationFormValues[] }
  onSubmit: (data: { education: EducationFormValues[] }) => void
  onBack: () => void
  onSaveDraft?: (data: { education: EducationFormValues[] }) => void
}

const formSchema = z.object({
  education: z.array(educationSchema).min(1, "At least one education entry is required"),
})

export function EducationForm({ defaultValues, onSubmit, onBack, onSaveDraft }: EducationFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ education: EducationFormValues[] }>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      education: [
        {
          institution: "",
          degree: "",
          fieldOfStudy: "",
          graduationYear: "",
          description: "",
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  })

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      const data = {
        education: fields.map((field, index) => ({
          institution: (document.getElementById(`education.${index}.institution`) as HTMLInputElement)?.value || "",
          degree: (document.getElementById(`education.${index}.degree`) as HTMLInputElement)?.value || "",
          fieldOfStudy: (document.getElementById(`education.${index}.fieldOfStudy`) as HTMLInputElement)?.value || "",
          graduationYear:
            (document.getElementById(`education.${index}.graduationYear`) as HTMLInputElement)?.value || "",
          description: (document.getElementById(`education.${index}.description`) as HTMLTextAreaElement)?.value || "",
        })),
      }
      onSaveDraft(data)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              <Label htmlFor={`education.${index}.institution`}>Institution Name</Label>
              <Input
                id={`education.${index}.institution`}
                placeholder="Enter institution name"
                {...register(`education.${index}.institution`)}
              />
              {errors.education?.[index]?.institution && (
                <p className="text-sm text-destructive">{errors.education[index]?.institution?.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`education.${index}.degree`}>Degree/Certificate</Label>
              <Input
                id={`education.${index}.degree`}
                placeholder="Enter degree or certificate"
                {...register(`education.${index}.degree`)}
              />
              {errors.education?.[index]?.degree && (
                <p className="text-sm text-destructive">{errors.education[index]?.degree?.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`education.${index}.fieldOfStudy`}>Field of Study</Label>
              <Input
                id={`education.${index}.fieldOfStudy`}
                placeholder="Enter field of study"
                {...register(`education.${index}.fieldOfStudy`)}
              />
              {errors.education?.[index]?.fieldOfStudy && (
                <p className="text-sm text-destructive">{errors.education[index]?.fieldOfStudy?.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`education.${index}.graduationYear`}>Graduation Year</Label>
              <Input
                id={`education.${index}.graduationYear`}
                placeholder="Enter graduation year (e.g., 2020)"
                {...register(`education.${index}.graduationYear`)}
              />
              {errors.education?.[index]?.graduationYear && (
                <p className="text-sm text-destructive">{errors.education[index]?.graduationYear?.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`education.${index}.description`}>Description (Optional)</Label>
            <Textarea
              id={`education.${index}.description`}
              placeholder="Enter additional details about your education"
              rows={3}
              {...register(`education.${index}.description`)}
            />
          </div>
        </div>
      ))}

      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() =>
            append({
              institution: "",
              degree: "",
              fieldOfStudy: "",
              graduationYear: "",
              description: "",
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add Another Education
        </Button>
      </div>

      {errors.education?.root && (
        <p className="text-sm text-destructive text-center">{errors.education.root.message}</p>
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
