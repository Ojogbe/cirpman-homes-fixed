import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("customer_subscriptions");

    if (req.method === "POST") {
      const subscriptionData = req.body;

      // Validate required fields
      if (!subscriptionData.email || !subscriptionData.surname || !subscriptionData.firstName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const result = await collection.insertOne({
        ...subscriptionData,
        created_at: new Date(),
        updated_at: new Date()
      });

      return res.status(201).json({
        message: "Subscription created successfully",
        id: result.insertedId
      });
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
}
