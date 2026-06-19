import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://jaytalekar82_db_user:Jay1522007@cluster0.qonw1yu.mongodb.net/?appName=Cluster0";

async function check() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");
  
  const users = await mongoose.connection.db.collection("users").find({}).toArray();
  console.log("Users in DB:");
  users.forEach(u => {
    console.log(`- ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, XP: ${u.xp}`);
  });
  
  await mongoose.disconnect();
}

check().catch(console.error);
