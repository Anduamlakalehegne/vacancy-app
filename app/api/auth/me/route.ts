import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse(
        JSON.stringify({
          error: "Unauthorized",
        }),
        { status: 401 }
      )
    }

    return new NextResponse(
      JSON.stringify({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }),
      { status: 200 }
    )
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "Internal server error",
      }),
      { status: 500 }
    )
  }
} 