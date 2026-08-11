import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Reuse the same connection across hot reloads in dev / serverless invocations
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

export default clientPromise;

/** Save a blog post directly to MongoDB Atlas from Next.js/Vercel */
export async function saveBlogToMongo(blog: Record<string, any>): Promise<void> {
  try {
    const mongoClient = await clientPromise;
    const db = mongoClient.db(); // uses default db from URI
    const blogs = db.collection("blogs");

    // Upsert by slug so re-generating the same topic doesn't duplicate
    await blogs.updateOne(
      { slug: blog.slug },
      { $set: { ...blog, updatedAt: new Date() } },
      { upsert: true }
    );
    console.log(`✅ Blog saved to MongoDB: "${blog.title}"`);
  } catch (err) {
    console.error("❌ Failed to save blog to MongoDB:", err);
  }
}