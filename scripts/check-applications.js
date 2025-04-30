// This script helps check if applications are properly stored in MongoDB
import { MongoClient } from "mongodb"

// Connection URI
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"

async function checkApplications() {
  // Create a new MongoClient
  const client = new MongoClient(uri)

  try {
    // Connect to the MongoDB server
    await client.connect()
    console.log("Connected to MongoDB")

    // Get reference to the database
    const db = client.db("wegagen_bank")

    // List all collections
    const collections = await db.listCollections().toArray()
    console.log(
      "Available collections:",
      collections.map((c) => c.name),
    )

    // Check if applications collection exists
    if (collections.some((c) => c.name === "applications")) {
      // Get reference to the applications collection
      const applicationsCollection = db.collection("applications")

      // Count applications
      const count = await applicationsCollection.countDocuments()
      console.log(`Found ${count} applications in the database`)

      // Get the most recent applications
      const recentApplications = await applicationsCollection.find({}).sort({ lastUpdated: -1 }).limit(5).toArray()

      console.log("Most recent applications:")
      recentApplications.forEach((app, index) => {
        console.log(`\nApplication ${index + 1}:`)
        console.log(`ID: ${app._id}`)
        console.log(`User ID: ${app.userId}`)
        console.log(`Vacancy ID: ${app.vacancyId}`)
        console.log(`Status: ${app.status}`)
        console.log(`Submitted: ${app.submittedAt || "Not submitted"}`)
        console.log(`Last Updated: ${app.lastUpdated}`)
      })
    } else {
      console.log("No 'applications' collection found in the database")
    }
  } catch (error) {
    console.error("Error checking applications:", error)
  } finally {
    // Close the connection
    await client.close()
    console.log("MongoDB connection closed")
  }
}

// Run the check function
checkApplications().catch(console.error)
