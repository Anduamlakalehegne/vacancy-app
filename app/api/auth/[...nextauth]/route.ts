import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcrypt"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required")
        }

        try {
          const client = await clientPromise
          const db = client.db("wegagen_bank")
          const user = await db.collection("users").findOne({
            email: credentials.email,
          })

          if (!user) {
            throw new Error("No user found with this email")
          }

          const passwordMatch = await compare(credentials.password, user.password)

          if (!passwordMatch) {
            throw new Error("Incorrect password")
          }

          // Convert MongoDB ObjectId to string
          const userId = user._id instanceof ObjectId ? user._id.toString() : user._id.toString()

          console.log("User authenticated:", {
            id: userId,
            email: user.email,
            name: user.name,
            role: user.role || "user",
          })

          // Return user with explicit id field
          return {
            id: userId,
            email: user.email,
            name: user.name,
            role: user.role || "user",
          }
        } catch (error) {
          console.error("Authentication error:", error)
          throw new Error("Authentication failed")
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    newUser: "/register",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      // When signing in, add user data to token
      if (user) {
        token.id = user.id
        token.role = user.role
        token.sub = user.id // Ensure sub is set to user.id for consistency
      }
      return token
    },
    async session({ session, token }) {
      // Add token data to session
      if (token && session.user) {
        // Explicitly set these properties on the session.user object
        session.user.id = token.id
        session.user.role = token.role || "user"
        // Add sub as a fallback ID field
        session.user.sub = token.sub
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
