import Image from "next/image"
import type { Metadata } from "next"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Register | Wegagen Bank Careers",
  description: "Create a new account for Wegagen Bank Careers",
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Column - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-primary flex-col justify-between p-12 text-white">
        <div>
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo2-mgqcChgJxoI7DWmu9EKyqp4vd5WJtn.png"
            alt="Wegagen Bank Logo"
            width={180}
            height={50}
            className="h-auto mb-12"
          />
          <h1 className="text-4xl font-bold mb-6">Join Our Team</h1>
          <p className="text-xl mb-8">
            Create an account to apply for job opportunities and start your career journey with Wegagen Bank.
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">What to expect</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Easy application process</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Job alerts for new opportunities</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Track your application status</span>
              </li>
            </ul>
          </div>

          <div className="text-sm">© {new Date().getFullYear().toString()} Wegagen Bank. All rights reserved.</div>
        </div>
      </div>

      {/* Right Column - Registration Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo2-mgqcChgJxoI7DWmu9EKyqp4vd5WJtn.png"
              alt="Wegagen Bank Logo"
              width={150}
              height={40}
              className="h-auto mx-auto"
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Create an account</h1>
              <p className="text-muted-foreground">Enter your details to create your account</p>
            </div>

            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  )
}
