const mongoose = require("mongoose");
const dns = require("node:dns");
process.loadEnvFile();
(async () => {
  if (process.env.MONGODB_DNS_SERVERS) {
    const servers = process.env.MONGODB_DNS_SERVERS.split(",").map((value) =>
      value.trim(),
    );
    dns.setServers(servers);
    dns.promises.setServers(servers);
  }
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
  });
  try {
    for (const name of ["bookmarks", "shoppinggroups"]) {
      const collection = mongoose.connection.db.collection(name);
      await collection.createIndex(
        { userId: 1, recipeId: 1 },
        { unique: true },
      );
      await collection.createIndex({ userId: 1, createdAt: -1, _id: -1 });
    }
    console.log("Kitchen collection indexes are ready.");
  } finally {
    await mongoose.disconnect();
  }
})().catch((error) => {
  console.error("Index creation failed:", error.name);
  process.exitCode = 1;
});
