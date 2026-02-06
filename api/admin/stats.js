import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!uri) {
    return res.status(200).json({
      clients: 0,
      properties: 0,
      siteVisits: 0,
      subscriptions: 0,
      revenue: 0
    });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();

    const [
      clientCount,
      propertyCount,
      siteVisitCount,
      subscriptionCount,
      revenueData
    ] = await Promise.all([
      db.collection("users").countDocuments({ role: "client" }),
      db.collection("properties").countDocuments(),
      db.collection("site_visit_requests").countDocuments(),
      db.collection("customer_subscriptions").countDocuments(),
      db.collection("property_bookings").aggregate([
        { $group: { _id: null, total: { $sum: "$total_price" } } }
      ]).toArray()
    ]);

    res.status(200).json({
      clients: clientCount,
      properties: propertyCount,
      siteVisits: siteVisitCount,
      subscriptions: subscriptionCount,
      revenue: revenueData[0]?.total || 0,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Stats API error:", error);
    res.status(200).json({
      clients: 0,
      properties: 0,
      siteVisits: 0,
      subscriptions: 0,
      revenue: 0,
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
