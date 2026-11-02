import mongoose from "mongoose";
import dns from "node:dns";

// Share a pending connection across concurrent requests and development reloads.
const globalWithMongo = globalThis as typeof globalThis & {
  cookbookMongo?: Promise<typeof mongoose>;
};

export default async function dbConnect() {
  if (mongoose.connection.readyState === 1) return mongoose;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (!globalWithMongo.cookbookMongo) {
    // Optional override for networks whose DNS cannot resolve Atlas SRV records.
    const servers = process.env.MONGODB_DNS_SERVERS?.split(",").map(server => server.trim()).filter(Boolean);
    if (servers?.length) {
      dns.setServers(servers);
      dns.promises.setServers(servers);
    }
    globalWithMongo.cookbookMongo = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
  }
  try {
    return await globalWithMongo.cookbookMongo;
  } catch (error) {
    globalWithMongo.cookbookMongo = undefined;
    throw error;
  }
}
