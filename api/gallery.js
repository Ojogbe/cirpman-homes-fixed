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
    const collection = db.collection("gallery");

    const { category } = req.query;

    let query = {};
    if (category && category !== "all") {
      query.category = category;
    }

    const galleryItems = await collection.find(query).sort({ created_at: -1 }).toArray();
    
    res.status(200).json({
      gallery: galleryItems
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
}
