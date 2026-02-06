import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return res.status(500).json({ 
      error: "MONGODB_URI not configured",
      properties: [],
      total: 0
    });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("properties");

    // Get query parameters for filtering
    const { status } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const properties = await collection.find(query).toArray();
    
    res.status(200).json({
      properties: properties,
      total: properties.length
    });
  } catch (error) {
    console.error('Properties API error:', error);
    // Return 200 with empty array on error for development
    res.status(200).json({ 
      properties: [],
      total: 0,
      error: error.message 
    });
  } finally {
    try {
      await client.close();
    } catch (e) {
      // Ignore close errors
    }
  }
}
