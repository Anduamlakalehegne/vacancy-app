"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { trainingSchema, type TrainingFormValues } from "@/lib/validation/application-schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, Loader2, Plus, Trash2 } from "lucide-react"

interface TrainingFormProps {
  defaultValues?: { training?: TrainingFormValues[] }
  onSubmit: (data: { training?: TrainingFormValues[] }) => void
  onBack: () => void
  onSaveDraft?: (data: { training?: TrainingFormValues[] }) => void
}

const formSchema = z.object({
  training: z.array(trainingSchema).optional(),
})

export function TrainingForm({ defaultValues, onSubmit, onBack, onSaveDraft }: TrainingFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ training?: TrainingFormValues[] }>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      training: [
        {
          name: "",
          provider: "",
          completionDate: "",
          expiryDate: "",
          description: "",
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "training",
  })

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      const data = {
        training: fields.map((field, index) => ({
          name: (document.getElementById(`training.${index}.name`) as HTMLInputElement)?.value || "",
          provider: (document.getElementById(`training.${index}.provider`) as HTMLInputElement)?.value || "",
          completionDate:
            (document.getElementById(`training.${index}.completionDate`) as HTMLInputElement)?.value || "",
          expiryDate: (document.getElementById(`training.${index}.expiryDate`) as HTMLInputElement)?.value || "",
          description: (document.getElementById(`training.${index}.description`) as HTMLTextAreaElement)?.value || "",
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
              <Label htmlFor={`training.${index}.name`}>Training/Certification Name</Label>
              <Input
                id={`training.${index}.name`}
                placeholder="Enter training or certification name"
                {...register(`training.${index}.name`)}
              />
              {errors.training?.[index]?.name && (
                <p className="text-sm text-destructive">{errors.training[index]?.name?.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`training.${index}.provider`}>Provider</Label>
              <Input
                id={`training.${index}.provider`}
                placeholder="Enter provider name"
                {...register(`training.${index}.provider`)}
              />
              {errors.training?.[index]?.provider && (
                <p className="text-sm text-destructive">{errors.training[index]?.provider?.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`training.${index}.completionDate`}>Completion Date</Label>
              <Input
                id={`training.${index}.completionDate`}
                type="date"
                {...register(`training.${index}.completionDate`)}
              />
              {errors.training?.[index]?.completionDate && (
                <p className="text-sm text-destructive">{errors.training[index]?.completionDate?.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`training.${index}.expiryDate`}>Expiry Date (if applicable)</Label>
              <Input id={`training.${index}.expiryDate`} type="date" {...register(`training.${index}.expiryDate`)} />
              {errors.training?.[index]?.expiryDate && (
                <p className="text-sm text-destructive">{errors.training[index]?.expiryDate?.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`training.${index}.description`}>Description (Optional)</Label>
            <Textarea
              id={`training.${index}.description`}
              placeholder="Enter details about this training or certification"
              rows={3}
              {...register(`training.${index}.description`)}
            />
          </div>
        </div>
      ))}

      {fields.length === 0 && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              append({
                name: "",
                provider: "",
                completionDate: "",
                expiryDate: "",
                description: "",
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Add Training/Certification
          </Button>
        </div>
      )}

      {fields.length > 0 && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              append({
                name: "",
                provider: "",
                completionDate: "",
                expiryDate: "",
                description: "",
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Add Another Training/Certification
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
