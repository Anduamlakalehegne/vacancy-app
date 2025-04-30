import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const location = searchParams.get("location")
    const search = searchParams.get("search")

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("wegagen_bank")

    // Build query based on filters
    const query: any = {}

    if (category && category !== "all") {
      query.department = category
    }

    if (location && location !== "all") {
      query.location = location
    }

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    console.log("Fetching vacancies with query:", query)

    // Fetch vacancies from MongoDB
    const vacancies = await db.collection("vacancies").find(query).sort({ postedDate: -1 }).toArray()

    console.log(`Found ${vacancies.length} vacancies`)

    return NextResponse.json(vacancies)
  } catch (error) {
    console.error("Error fetching vacancies:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch vacancies",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
