import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const consultants = db.collection('consultants');

  if (req.method === 'POST') {
    const consultant = req.body;
    await consultants.insertOne(consultant);
    return res.status(201).json({ success: true });
  }
  if (req.method === 'GET') {
    const all = await consultants.find({}).toArray();
    return res.status(200).json(all);
  }
  res.status(405).end();
}
