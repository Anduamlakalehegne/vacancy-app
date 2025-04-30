import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 })
    }

    // Check if user has admin role
    const isAdmin = session.user.role === "admin"

    return NextResponse.json({ isAdmin })
  } catch (error) {
    console.error("Error checking admin status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
