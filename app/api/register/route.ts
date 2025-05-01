import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import clientPromise from "@/lib/mongodb"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // Validate the data
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("wegagen_bank")

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash the password
    const hashedPassword = await hash(password, 10)

    // Create the user
    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      role: "user",
      createdAt: new Date(),
    })

    return NextResponse.json(
      {
        message: "User registered successfully",
        userId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "An error occurred during registration" }, { status: 500 })
  }
}
