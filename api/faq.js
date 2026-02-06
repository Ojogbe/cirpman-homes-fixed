import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("faq");

    const faqs = await collection.find({ is_active: true }).sort({ order_index: 1, created_at: -1 }).toArray();
    
    res.status(200).json({
      faq: faqs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
}
