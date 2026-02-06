import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (!uri) {
    return res.status(200).json({
      feedback: [],
      error: "Database not configured"
    });
  }

  const client = new MongoClient(uri);

  try {
    if (req.method === "POST") {
      const { name, email, subject, message, rating, property_id } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({ 
          error: "Name, email, and message are required" 
        });
      }

      await client.connect();
      const db = client.db();
      
      const result = await db.collection("feedback").insertOne({
        name,
        email,
        subject: subject || "",
        message,
        rating: rating || 5,
        property_id: property_id || null,
        status: "new",
        created_at: new Date(),
        updated_at: new Date()
      });

      return res.status(201).json({
        message: "Feedback submitted successfully",
        id: result.insertedId
      });
    }

    if (req.method === "GET") {
      await client.connect();
      const db = client.db();
      const feedback = await db.collection("feedback")
        .find({})
        .sort({ created_at: -1 })
        .toArray();

      return res.status(200).json({ feedback });
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Feedback API error:", error);
    res.status(200).json({ 
      error: error.message,
      feedback: []
    });
  } finally {
    try {
      await client.close();
    } catch (e) {
      // Ignore close errors
    }
  }
}
