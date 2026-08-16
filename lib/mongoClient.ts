import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> | null {
  if (!MONGODB_URI) {
    console.warn("⚠️ MONGODB_URI is not defined — skipping MongoDB connection");
    return null;
  }

  if (clientPromise) return clientPromise;

  // In development, reuse connection across hot reloads
  if (process.env.NODE_ENV === "development") {
    const g = global as any;
    if (!g._mongoClientPromise) {
      const client = new MongoClient(MONGODB_URI);
      g._mongoClientPromise = client.connect();
    }
    clientPromise = g._mongoClientPromise;
  } else {
    const client = new MongoClient(MONGODB_URI);
    clientPromise = client.connect();
  }

  return clientPromise;
}

export default getClientPromise;

/** Save a blog post directly to MongoDB Atlas from Next.js/Vercel */
export async function saveBlogToMongo(blog: Record<string, any>): Promise<void> {
  try {
    const promise = getClientPromise();
    if (!promise) {
      console.warn("⚠️ Skipping MongoDB save — MONGODB_URI not configured");
      return;
    }
    const mongoClient = await promise;
    const db = mongoClient.db();
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

/** Fetch all blog posts directly from MongoDB Atlas */
export async function getBlogsFromMongo(): Promise<any[]> {
  try {
    const promise = getClientPromise();
    if (!promise) return [];
    const mongoClient = await promise;
    const db = mongoClient.db();
    const blogsCollection = db.collection("blogs");
    const docs = await blogsCollection.find({}).sort({ datePublished: -1 }).toArray();
    return docs.map(({ _id, ...rest }) => rest);
  } catch (err) {
    console.error("❌ Failed to fetch blogs from MongoDB:", err);
    return [];
  }
}