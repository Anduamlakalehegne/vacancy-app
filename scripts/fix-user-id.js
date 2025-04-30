// This script helps fix user IDs in the database
import { MongoClient } from "mongodb"

// Connection URI
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"

async function fixUserIds() {
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

    // Get all users
    const users = await usersCollection.find({}).toArray()
    console.log(`Found ${users.length} users in the database`)

    // Log user IDs
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`)
      console.log(`ID: ${user._id} (${typeof user._id})`)
      console.log(`Email: ${user.email}`)
      console.log(`Name: ${user.name}`)
      console.log(`Role: ${user.role || "user"}`)
      console.log("---")
    })

    // Get all applications
    const applications = await applicationsCollection.find({}).toArray()
    console.log(`Found ${applications.length} applications in the database`)

    // Log application user IDs
    applications.forEach((app, index) => {
      console.log(`Application ${index + 1}:`)
      console.log(`ID: ${app._id}`)
      console.log(`User ID: ${app.userId} (${typeof app.userId})`)
      console.log(`Vacancy ID: ${app.vacancyId}`)
      console.log(`Status: ${app.status}`)
      console.log("---")
    })

    // Ask for confirmation before fixing
    console.log("\nWould you like to fix user IDs in applications? (yes/no)")
    // In a real script, you'd get user input here
    const shouldFix = true // For demonstration

    if (shouldFix) {
      // Fix applications with string user IDs that should be ObjectIds
      for (const app of applications) {
        // Find the user by email from the application's personal info
        if (app.personalInfo && app.personalInfo.email) {
          const user = await usersCollection.findOne({ email: app.personalInfo.email })

          if (user) {
            const userId = user._id.toString()

            // Update the application with the correct user ID
            if (app.userId !== userId) {
              console.log(`Updating application ${app._id} user ID from ${app.userId} to ${userId}`)
              await applicationsCollection.updateOne({ _id: app._id }, { $set: { userId: userId } })
            }
          }
        }
      }

      console.log("User IDs fixed successfully")
    }
  } catch (error) {
    console.error("Error fixing user IDs:", error)
  } finally {
    // Close the connection
    await client.close()
    console.log("MongoDB connection closed")
  }
}

// Run the fix function
fixUserIds().catch(console.error)
