import connectDB from "./lib/db.js";
import User from "./lib/models/User.js";

async function testUsers() {
  try {
    await connectDB();
    console.log("Connected to database");

    const users = await User.find({}).limit(5);
    console.log("Found users:", users.length);
    console.log(
      "Users:",
      users.map((u) => ({
        id: u._id,
        name: `${u.firstName} ${u.lastName || ""}`.trim(),
        email: u.email,
      }))
    );

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testUsers();
