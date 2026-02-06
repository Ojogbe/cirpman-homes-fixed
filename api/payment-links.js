import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return res.status(200).json({ 
      paymentLinks: [],
      link_url: null,
      error: "MONGODB_URI not configured"
    });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("payment_links");

    // Get query parameters for filtering
    const { section } = req.query;

    let query = {};
    if (section) {
      query.section_name = section;
    }

    const paymentLinks = await collection.find(query).toArray();
    
    res.status(200).json({
      paymentLinks: paymentLinks,
      link_url: paymentLinks[0]?.link_url || null
    });
  } catch (error) {
    console.error('Payment links API error:', error);
    // Return 200 with null link on error for development
    res.status(200).json({ 
      paymentLinks: [],
      link_url: null,
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
