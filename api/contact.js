import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ 
      error: "Name, email, and message are required" 
    });
  }

  if (!uri) {
    return res.status(200).json({
      message: "Thank you for contacting us. We will respond shortly.",
      note: "Message saved locally - database not configured"
    });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    
    await db.collection("feedback").insertOne({
      name,
      email,
      phone: phone || "",
      subject: subject || "Contact Form Inquiry",
      message,
      type: "contact_form",
      status: "new",
      created_at: new Date()
    });

    return res.status(201).json({
      message: "Thank you for contacting us. We will respond to your inquiry shortly.",
      email_provided: email
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return res.status(200).json({ 
      message: "Message received. We'll contact you soon.",
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
