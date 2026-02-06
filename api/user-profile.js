import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("users");

    if (req.method === "GET") {
      const userEmail = req.headers["x-user-email"] || req.query.email;
      const authHeader = req.headers.authorization;

      if (!authHeader || !userEmail) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await collection.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({
        profile: {
          id: user._id,
          email: user.email,
          full_name: user.full_name || "",
          phone: user.phone || "",
          ...user
        }
      });
    }

    if (req.method === "PUT") {
      const userEmail = req.headers["x-user-email"] || req.body.email;
      const { full_name, phone } = req.body;

      if (!userEmail) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const result = await collection.updateOne(
        { email: userEmail },
        {
          $set: {
            full_name: full_name || "",
            phone: phone || "",
            updated_at: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({ message: "Profile updated successfully" });
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
}
