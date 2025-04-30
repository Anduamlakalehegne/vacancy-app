import { MongoClient } from "mongodb"

// Sample vacancy data
const vacancyData = [
  {
    title: "Senior Loan Officer",
    location: "Addis Ababa",
    type: "Full-Time",
    department: "Banking Operations",
    postedDate: new Date("2025-03-15"),
    deadline: new Date("2025-04-30"),
    salary: "Competitive",
    description:
      "We are seeking an experienced Senior Loan Officer to join our team at Wegagen Bank. The ideal candidate will have a strong background in banking and loan processing, with excellent analytical skills and attention to detail.",
    responsibilities: [
      "Evaluate, authorize, or recommend approval of loan applications for individuals and businesses",
      "Analyze applicants' financial status, credit, and property evaluations to determine feasibility of granting loans",
      "Meet with applicants to obtain information for loan applications and to answer questions about the process",
      "Explain to customers the different types of loans and credit options that are available",
      "Obtain and compile copies of loan applicants' credit histories, corporate financial statements, and other financial information",
      "Review and update credit and loan files",
      "Approve loans within specified limits, and refer loan applications outside those limits to management for approval",
      "Ensure all legal regulations are followed for loan applications",
    ],
    requirements: [
      "Bachelor's degree in Finance, Banking, Economics, or related field",
      "Minimum of 5 years of experience in banking, with at least 3 years in loan processing",
      "Strong knowledge of banking regulations and loan procedures",
      "Excellent analytical and decision-making skills",
      "Strong communication and interpersonal abilities",
      "Proficiency in financial analysis software",
      "Customer service orientation",
    ],
    benefits: [
      "Competitive salary package",
      "Health insurance",
      "Performance bonuses",
      "Professional development opportunities",
      "Retirement benefits",
      "Paid time off",
    ],
  },
  {
    title: "IT Security Specialist",
    location: "Addis Ababa",
    type: "Full-Time",
    department: "IT & Technology",
    postedDate: new Date("2025-03-10"),
    deadline: new Date("2025-05-15"),
    salary: "Negotiable based on experience",
    description:
      "Wegagen Bank is looking for a skilled IT Security Specialist to strengthen our cybersecurity posture. The successful candidate will be responsible for implementing and maintaining security measures to protect our digital assets and customer information.",
    responsibilities: [
      "Develop and implement security policies, standards, and procedures",
      "Monitor security access and investigate security breaches",
      "Perform vulnerability assessments and penetration testing",
      "Implement security tools and technologies to protect bank systems and data",
      "Conduct security awareness training for employees",
      "Stay updated on the latest security threats and countermeasures",
      "Collaborate with IT teams to ensure security is integrated into all systems",
      "Respond to security incidents and lead forensic investigations when necessary",
    ],
    requirements: [
      "Bachelor's degree in Computer Science, Information Security, or related field",
      "Minimum of 3 years of experience in IT security",
      "Relevant certifications such as CISSP, CEH, or CompTIA Security+",
      "Strong knowledge of network security, encryption, and authentication protocols",
      "Experience with security tools and technologies (firewalls, IDS/IPS, SIEM)",
      "Familiarity with regulatory requirements in the banking sector",
      "Excellent problem-solving and analytical skills",
      "Strong communication abilities and teamwork orientation",
    ],
    benefits: [
      "Competitive salary package",
      "Health insurance",
      "Performance bonuses",
      "Professional development opportunities",
      "Retirement benefits",
      "Paid time off",
      "Flexible working arrangements",
    ],
  },
  {
    title: "Branch Manager",
    location: "Bahir Dar",
    type: "Full-Time",
    department: "Management",
    postedDate: new Date("2025-03-18"),
    deadline: new Date("2025-04-25"),
    salary: "Competitive",
    description:
      "Wegagen Bank is seeking an experienced Branch Manager to lead our Bahir Dar branch operations. The ideal candidate will have strong leadership skills, banking experience, and the ability to drive business growth while ensuring excellent customer service.",
    responsibilities: [
      "Oversee daily branch operations and ensure compliance with bank policies and procedures",
      "Lead, coach, and develop branch staff to achieve performance targets",
      "Build and maintain relationships with key customers and the local community",
      "Identify and pursue business development opportunities",
      "Monitor branch performance metrics and implement strategies for improvement",
      "Ensure high standards of customer service are maintained",
      "Manage branch budget and expenses",
      "Address and resolve customer complaints and escalated issues",
    ],
    requirements: [
      "Bachelor's degree in Business Administration, Finance, or related field",
      "Minimum of 7 years of banking experience with at least 3 years in a management role",
      "Strong understanding of banking products, services, and regulations",
      "Excellent leadership and people management skills",
      "Strong business acumen and customer service orientation",
      "Ability to analyze financial data and make sound business decisions",
      "Excellent communication and interpersonal skills",
      "Proficiency in banking software and MS Office applications",
    ],
    benefits: [
      "Competitive salary and performance-based bonuses",
      "Comprehensive health insurance",
      "Retirement benefits",
      "Professional development opportunities",
      "Relocation assistance",
      "Paid time off",
      "Management allowance",
    ],
  },
]

async function seedVacancies() {
  // Connection URI
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"

  // Create a new MongoClient
  const client = new MongoClient(uri)

  try {
    // Connect to the MongoDB server
    await client.connect()
    console.log("Connected to MongoDB")

    // Get reference to the database
    const db = client.db("wegagen_bank")

    // Get reference to the collection
    const collection = db.collection("vacancies")

    // Check if collection already has data
    const count = await collection.countDocuments()
    if (count > 0) {
      console.log("Vacancies collection already has data. Clearing existing data...")
      await collection.deleteMany({})
    }

    // Insert the sample vacancy data
    const result = await collection.insertMany(vacancyData)

    console.log(`${result.insertedCount} vacancies successfully inserted into the database`)
  } catch (error) {
    console.error("Error seeding vacancies:", error)
  } finally {
    // Close the connection
    await client.close()
    console.log("MongoDB connection closed")
  }
}

// Run the seed function
seedVacancies().catch(console.error)

console.log("Sample vacancy data for MongoDB:")
console.log(JSON.stringify(vacancyData, null, 2))
