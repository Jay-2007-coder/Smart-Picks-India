import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  if (!MONGODB_URI) {
    console.error("No MONGODB_URI found");
    process.exit(1);
  }
  console.log("Connecting to MongoDB Atlas...");
  const conn = await mongoose.connect(MONGODB_URI);
  
  const admin = conn.connection.db.admin();
  const dbs = await admin.listDatabases();
  console.log("Databases on Cluster:");
  for (const db of dbs.databases) {
    console.log(`- ${db.name} (Size: ${db.sizeOnDisk})`);
    
    // Connect to this specific DB and list collections
    const tempConn = mongoose.createConnection(`${MONGODB_URI.split('?')[0]}${db.name}?${MONGODB_URI.split('?')[1] || ''}`);
    await new Promise((resolve) => tempConn.once('open', resolve));
    const collections = await tempConn.db.listCollections().toArray();
    console.log("  Collections:");
    for (const col of collections) {
      console.log(`    * ${col.name}`);
      // Check count of documents
      const count = await tempConn.db.collection(col.name).countDocuments();
      console.log(`      Count: ${count}`);
    }
    await tempConn.close();
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);
