import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("wegagen_bank")

    const vacancies = await db
      .collection("vacancies")
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(vacancies)
  } catch (error) {
    console.error("Error fetching vacancies:", error)
    return NextResponse.json(
      { error: "Failed to fetch vacancies" },
      { status: 500 }
    )
  }
}
