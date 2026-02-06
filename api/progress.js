import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const progress = db.collection('progress');

  if (req.method === 'POST') {
    const item = req.body;
    await progress.insertOne(item);
    return res.status(201).json({ success: true });
  }
  if (req.method === 'GET') {
    const all = await progress.find({}).toArray();
    return res.status(200).json(all);
  }
  res.status(405).end();
}
