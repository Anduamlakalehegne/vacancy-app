import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Get total users
    const totalUsers = await db.collection("users").countDocuments({ role: "user" })

    // Get total vacancies
    const totalVacancies = await db.collection("vacancies").countDocuments()

    // Get total applications
    const totalApplications = await db.collection("applications").countDocuments()

    // Get pending applications
    const pendingApplications = await db.collection("applications").countDocuments({ status: "pending" })

    // Get recent applications
    const recentApplications = await db.collection("applications")
      .aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $lookup: {
            from: "vacancies",
            localField: "vacancyId",
            foreignField: "_id",
            as: "vacancy"
          }
        }
      ])
      .toArray()

    // Get application counts by month for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const chartData = await db.collection("applications")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" }
            },
            total: { $sum: 1 }
          }
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 }
        },
        {
          $project: {
            _id: 0,
            name: {
              $concat: [
                { $toString: "$_id.year" },
                "-",
                { $toString: "$_id.month" }
              ]
            },
            total: 1
          }
        }
      ])
      .toArray()

    return NextResponse.json({
      totalUsers,
      totalVacancies,
      totalApplications,
      pendingApplications,
      recentApplications,
      chartData
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    )
  }
} 