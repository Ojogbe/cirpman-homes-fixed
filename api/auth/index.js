import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export default async function handler(req, res) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const users = db.collection('users');

    if (req.method === 'POST') {
      const { email, password, action } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      if (action === 'register') {
        const existing = await users.findOne({ email });
        if (existing) {
          return res.status(400).json({ error: 'User already exists' });
        }

        const hash = await bcrypt.hash(password, 10);
        const result = await users.insertOne({
          email,
          password: hash,
          role: 'client',
          created_at: new Date()
        });

        const token = jwt.sign(
          { 
            email, 
            userId: result.insertedId.toString(),
            role: 'client'
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return res.status(201).json({ 
          token,
          user: { email, role: 'client' }
        });
      }

      if (action === 'login') {
        const user = await users.findOne({ email });
        if (!user) {
          return res.status(400).json({ error: 'Invalid email or password' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
          { 
            email, 
            userId: user._id.toString(),
            role: user.role || 'client'
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return res.status(200).json({ 
          token,
          user: { email, role: user.role || 'client' }
        });
      }

      if (action === 'validate') {
        const token = req.body.token || req.headers.authorization?.slice(7);
        if (!token) {
          return res.status(401).json({ valid: false });
        }

        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          return res.status(200).json({ 
            valid: true, 
            user: decoded 
          });
        } catch (error) {
          return res.status(401).json({ valid: false });
        }
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Server error' });
  } finally {
    try {
      await client.close();
    } catch (e) {
      // Ignore close errors
    }
  }
}
