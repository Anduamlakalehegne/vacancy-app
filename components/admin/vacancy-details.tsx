"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  position: z.string().min(1, "Position is required"),
  requiredNumber: z.string().min(1, "Required number is required"),
  education: z.string().min(1, "Education is required"),
  purpose: z.string().min(1, "Purpose is required"),
  experience: z.string().min(1, "Experience is required"),
  responsibilities: z.string().min(1, "Responsibilities are required"),
  placeOfWork: z.string().min(1, "Place of work is required"),
  salary: z.string().default("As Per the Banks Salary Scale and Attractive"),
})

type FormValues = z.infer<typeof formSchema>

interface VacancyDetailsProps {
  onSubmit: (data: FormValues) => void
  initialData?: Partial<FormValues>
}

export default function VacancyDetails({
  onSubmit,
  initialData,
}: VacancyDetailsProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      position: "",
      requiredNumber: "",
      education: "",
      purpose: "",
      experience: "",
      responsibilities: "",
      placeOfWork: "",
      salary: "As Per the Banks Salary Scale and Attractive",
      ...initialData,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Input placeholder="Enter position" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requiredNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required Number</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="education"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Education</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter education requirements"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purpose of the Job</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter job purpose"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter experience requirements"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="responsibilities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Roles and Responsibilities</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter roles and responsibilities"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="placeOfWork"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Place of Work</FormLabel>
                <FormControl>
                  <Input placeholder="Enter place of work" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter salary"
                    defaultValue="As Per the Banks Salary Scale and Attractive"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Create Vacancy
        </Button>
      </form>
    </Form>
  )
} 