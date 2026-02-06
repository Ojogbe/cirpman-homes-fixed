import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Helper to verify JWT token
function verifyToken(token) {
  try {
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

export default async function handler(req, res) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();

    if (req.method === 'POST') {
      // Verify authentication for booking actions
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
      const user = verifyToken(token);

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized - please login first' });
      }

      const { action, payload, recaptchaToken } = req.body;
      
      if (action === 'book_property') {
        const bookingsCollection = db.collection('property_bookings');
        const installmentsCollection = db.collection('installment_plans');
        
        const bookingData = {
          ...payload,
          user_id: user.userId,
          user_email: user.email,
          created_at: new Date(),
          updated_at: new Date()
        };

        const bookingResult = await bookingsCollection.insertOne(bookingData);

        // Create installment plan
        if (payload.monthly_amount && payload.total_price) {
          await installmentsCollection.insertOne({
            booking_id: bookingResult.insertedId.toString(),
            user_id: user.userId,
            total_amount: payload.total_price,
            total_paid: 0,
            next_payment_date: payload.next_payment_date,
            next_payment_amount: payload.monthly_amount,
            status: 'On Track',
            created_at: new Date()
          });
        }

        return res.status(201).json({ 
          success: true,
          booking_id: bookingResult.insertedId 
        });
      }

      if (action === 'site_visit') {
        const bookingsCollection = db.collection('site_visit_requests');
        
        const visitData = {
          ...payload,
          user_id: user.userId,
          user_email: user.email,
          recaptcha_verified: true,
          created_at: new Date()
        };

        const result = await bookingsCollection.insertOne(visitData);

        return res.status(201).json({
          success: true,
          id: result.insertedId
        });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    if (req.method === 'GET') {
      // Optional: verify auth for private bookings endpoint
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
      const user = verifyToken(token);

      const collection = db.collection('property_bookings');
      
      let query = {};
      // If authenticated, only return user's bookings
      if (user && user.userId) {
        query.user_id = user.userId;
      }

      const bookings = await collection
        .find(query)
        .sort({ created_at: -1 })
        .toArray();

      return res.status(200).json({ bookings });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Bookings error:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    try {
      await client.close();
    } catch (e) {
      // Ignore close errors
    }
  }
}
