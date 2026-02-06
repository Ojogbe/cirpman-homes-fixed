import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const testimonials = db.collection('testimonials');

  if (req.method === 'POST') {
    const testimonial = req.body;
    await testimonials.insertOne(testimonial);
    return res.status(201).json({ success: true });
  }
  if (req.method === 'GET') {
    const all = await testimonials.find({}).toArray();
    return res.status(200).json(all);
  }
  res.status(405).end();
}
