// This script helps fix applications by associating them with the correct user ID
import { MongoClient } from "mongodb"

// Connection URI
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"

async function fixApplications() {
  // Create a new MongoClient
  const client = new MongoClient(uri)

  try {
    // Connect to the MongoDB server
    await client.connect()
    console.log("Connected to MongoDB")

    // Get reference to the database
    const db = client.db("wegagen_bank")

    // Get reference to the collections
    const usersCollection = db.collection("users")
    const applicationsCollection = db.collection("applications")

    // Get all applications
    const applications = await applicationsCollection.find({}).toArray()
    console.log(`Found ${applications.length} applications in the database`)

    let fixedCount = 0

    // For each application, try to find the user by email and update the userId
    for (const app of applications) {
      if (app.personalInfo && app.personalInfo.email) {
        const email = app.personalInfo.email
        console.log(`Checking application ${app._id} with email ${email}`)

        // Find the user by email
        const user = await usersCollection.findOne({ email })

        if (user) {
          const userId = user._id.toString()
          console.log(`Found user ${userId} for email ${email}`)

          // Update the application with the correct user ID
          if (!app.userId || app.userId !== userId) {
            console.log(`Updating application ${app._id} user ID from ${app.userId || "none"} to ${userId}`)

            await applicationsCollection.updateOne({ _id: app._id }, { $set: { userId: userId } })

            fixedCount++
          } else {
            console.log(`Application ${app._id} already has correct user ID`)
          }
        } else {
          console.log(`No user found for email ${email}`)
        }
      } else {
        console.log(`Application ${app._id} has no email in personalInfo`)
      }
    }

    console.log(`Fixed ${fixedCount} applications`)
  } catch (error) {
    console.error("Error fixing applications:", error)
  } finally {
    // Close the connection
    await client.close()
    console.log("MongoDB connection closed")
  }
}

// Run the fix function
fixApplications().catch(console.error)
