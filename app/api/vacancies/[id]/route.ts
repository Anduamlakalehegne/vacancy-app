import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("wegagen_bank")

    // Fetch vacancy by ID
    let vacancy

    // Check if ID is a valid ObjectId
    if (ObjectId.isValid(id)) {
      vacancy = await db.collection("vacancies").findOne({ _id: new ObjectId(id) })
    }

    // If not found by ObjectId, try finding by custom ID
    if (!vacancy) {
      vacancy = await db.collection("vacancies").findOne({ id: id })
    }

    if (!vacancy) {
      return NextResponse.json({ error: "Vacancy not found" }, { status: 404 })
    }

    return NextResponse.json(vacancy)
  } catch (error) {
    console.error("Error fetching vacancy:", error)
    return NextResponse.json({ error: "Failed to fetch vacancy" }, { status: 500 })
  }
}
