import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const newsletter = db.collection('newsletter');

  if (req.method === 'POST') {
    const sub = req.body;
    await newsletter.insertOne(sub);
    return res.status(201).json({ success: true });
  }
  if (req.method === 'GET') {
    const all = await newsletter.find({}).toArray();
    return res.status(200).json(all);
  }
  res.status(405).end();
}
