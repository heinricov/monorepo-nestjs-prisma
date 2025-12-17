import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const envPath = resolve(process.cwd(), ".env");
config({ path: envPath });

console.log("=== DEBUG INFO ===");
console.log("CWD:", process.cwd());
console.log("ENV Path:", envPath);
console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("==================");

const connectionString = process.env.DATABASE_URL || "postgres://b5aa0b020bf8199f3f6638a91747b86f71a27f2688a2f43f99b488e1581e9aba:sk_Hirmn0NdkSg1_HJkG-I5T@db.prisma.io:5432/postgres?sslmode=require";

const adapter = new PrismaPg({
  connectionString
});

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
