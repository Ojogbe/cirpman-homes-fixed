import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    
    if (req.method === "GET") {
      const userEmail = req.headers["x-user-email"] || req.query.email;
      
      if (!userEmail) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const collection = db.collection("installment_plans");
      const plans = await collection
        .find({ user_email: userEmail })
        .sort({ created_at: -1 })
        .toArray();

      return res.status(200).json({ plans });
    }

    if (req.method === "POST") {
      const { installmentPlanId } = req.query;
      const { amount, payment_date, notes } = req.body;

      if (!installmentPlanId || !amount) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const collection = db.collection("payment_history");
      const result = await collection.insertOne({
        installment_plan_id: installmentPlanId,
        amount,
        payment_date,
        notes,
        created_at: new Date()
      });

      return res.status(201).json({
        message: "Payment recorded successfully",
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
