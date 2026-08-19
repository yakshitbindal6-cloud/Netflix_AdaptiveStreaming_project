import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client/client";

function createPrismaClient() {
    const ConnectionString = process.env.DATABASE_URL;
    if (!ConnectionString) {
        throw new Error("DATABASE_URL is not defined in the environment variables.");
    }

    const adapter = new PrismaPg(ConnectionString);
    return new PrismaClient({ adapter });
}
export const prisma = createPrismaClient();