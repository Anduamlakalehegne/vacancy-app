import mongoose from "mongoose"

// Global variable to track connection status
let isConnected = false

export async function connectToDatabase() {
  // If already connected, return
  if (isConnected) {
    console.log("Using existing MongoDB connection")
    return
  }

  // Check if MongoDB URI is defined
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables")
  }

  try {
    // Ensure we're using the wegagen_bank database
    const uri = process.env.MONGODB_URI.includes('wegagen_bank') 
      ? process.env.MONGODB_URI 
      : process.env.MONGODB_URI.replace(/\/[^/]*$/, '/wegagen_bank')

    // Connect to MongoDB
    const db = await mongoose.connect(uri)

    // Set connection flag
    isConnected = !!db.connections[0].readyState

    console.log("MongoDB connected successfully")
    console.log("Connection state:", mongoose.connection.readyState)
    
    if (mongoose.connection.db) {
      console.log("Database name:", mongoose.connection.db.databaseName)

      // List collections to verify
      const collections = await mongoose.connection.db.listCollections().toArray()
      console.log(
        "Available collections:",
        collections.map((c) => c.name),
      )
    }

    return db
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}

export async function disconnectFromDatabase() {
  if (!isConnected) {
    return
  }

  try {
    await mongoose.disconnect()
    isConnected = false
    console.log("MongoDB disconnected successfully")
  } catch (error) {
    console.error("MongoDB disconnection error:", error)
    throw error
  }
}
