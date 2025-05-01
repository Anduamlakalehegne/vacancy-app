import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const location = searchParams.get("location")
    const search = searchParams.get("search")

    const client = await clientPromise
    const db = client.db("wegagen_bank")

    // Build query based on filters
    const query: any = {
      status: "active" // Only show active vacancies
    }

    if (category && category !== "all") {
      query.department = category
    }

    if (location && location !== "all") {
      query.location = location
    }

    if (search) {
      query.$or = [
        { position: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ]
    }

    const vacancies = await db
      .collection("vacancies")
      .find(query)
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
