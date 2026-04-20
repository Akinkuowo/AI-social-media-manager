import { PrismaClient } from '../prisma/generated/prisma/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error("DATABASE_URL not found in .env")
  process.exit(1)
}

const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function promoteAdmin(email) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    })
    console.log(`[SUCCESS] User ${email} promoted to ADMIN sovereign.`)
    console.log(`Identity ID: ${user.id}`)
  } catch (err) {
    console.error(`[FAILED] Could not promote user: ${email}`, err)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

const targetEmail = process.argv[2]
if (!targetEmail) {
  console.log("Usage: node scratch/promote-admin.mjs <email>")
} else {
  promoteAdmin(targetEmail)
}
