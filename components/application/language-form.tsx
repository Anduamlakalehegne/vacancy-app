"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { languageSchema, type LanguageFormValues } from "@/lib/validation/application-schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Check, Loader2, Plus, Trash2 } from "lucide-react"
import { useEffect } from "react"

interface LanguageFormProps {
  defaultValues?: {
    languages?: LanguageFormValues[]
    additionalInfo?: string
    termsAgreement?: boolean
  }
  onSubmit: (data: {
    languages: LanguageFormValues[]
    additionalInfo?: string
    termsAgreement: boolean
  }) => void
  onBack: () => void
  onSaveDraft?: (data: {
    languages?: LanguageFormValues[]
    additionalInfo?: string
    termsAgreement?: boolean
  }) => void
}

const formSchema = z.object({
  languages: z.array(languageSchema).min(1, "At least one language entry is required"),
  additionalInfo: z.string().optional(),
  termsAgreement: z.boolean().refine((val) => val === true, "You must agree to the terms"),
})

export function LanguageForm({ defaultValues, onSubmit, onBack, onSaveDraft }: LanguageFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<{
    languages: LanguageFormValues[]
    additionalInfo?: string
    termsAgreement: boolean
  }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      languages: defaultValues?.languages || [
        {
          language: "",
          proficiency: "intermediate",
        },
      ],
      additionalInfo: defaultValues?.additionalInfo || "",
      termsAgreement: defaultValues?.termsAgreement || false,
    },
  })

  // Log the default values for debugging
  useEffect(() => {
    console.log("Language form default values:", defaultValues)
  }, [defaultValues])

  const { fields, append, remove } = useFieldArray({
    control,
    name: "languages",
  })

  const termsAgreement = watch("termsAgreement")

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      const data = {
        languages: fields.map((field, index) => ({
          language: (document.getElementById(`languages.${index}.language`) as HTMLInputElement)?.value || "",
          proficiency:
            ((document.getElementById(`languages.${index}.proficiency`) as HTMLSelectElement)?.value as any) ||
            "intermediate",
        })),
        additionalInfo: (document.getElementById("additionalInfo") as HTMLTextAreaElement)?.value || "",
        termsAgreement: watch("termsAgreement"),
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
              <Label htmlFor={`languages.${index}.language`}>Language</Label>
              <Input
                id={`languages.${index}.language`}
                placeholder="Enter language"
                {...register(`languages.${index}.language`)}
              />
              {errors.languages?.[index]?.language && (
                <p className="text-sm text-destructive">{errors.languages[index]?.language?.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`languages.${index}.proficiency`}>Proficiency Level</Label>
              <Select
                onValueChange={(value) => setValue(`languages.${index}.proficiency` as any, value)}
                defaultValue={field.proficiency}
              >
                <SelectTrigger id={`languages.${index}.proficiency`}>
                  <SelectValue placeholder="Select proficiency level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="native">Native</SelectItem>
                  <SelectItem value="fluent">Fluent</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                </SelectContent>
              </Select>
              {errors.languages?.[index]?.proficiency && (
                <p className="text-sm text-destructive">{errors.languages[index]?.proficiency?.message}</p>
              )}
            </div>
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
                language: "",
                proficiency: "intermediate",
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Add Language
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
                language: "",
                proficiency: "intermediate",
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Add Another Language
          </Button>
        </div>
      )}

      {errors.languages?.root && (
        <p className="text-sm text-destructive text-center">{errors.languages.root.message}</p>
      )}

      <div className="space-y-6 mt-8">
        <Separator />
        <div>
          <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Is there anything else you'd like to share?</Label>
            <Textarea
              id="additionalInfo"
              placeholder="Enter any additional information that might be relevant to your profile"
              rows={4}
              {...register("additionalInfo")}
            />
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="termsAgreement"
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            {...register("termsAgreement")}
          />
          <Label htmlFor="termsAgreement" className="text-sm">
            I certify that all the information provided is true and complete to the best of my knowledge.
          </Label>
        </div>
        {errors.termsAgreement && <p className="text-sm text-destructive">{errors.termsAgreement.message}</p>}
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
              Submitting...
            </>
          ) : (
            <>
              Save <Check className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
