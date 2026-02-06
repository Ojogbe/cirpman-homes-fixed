import { MongoClient, ObjectId } from "mongodb";

export default async function handler(req, res) {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("blog_posts");

    if (req.method === "GET") {
      const { search, category, page = "1", limit = "6", slug } = req.query;

      // If slug is provided, fetch single post
      if (slug) {
        const post = await collection.findOne({ slug, status: "published" });
        if (!post) {
          return res.status(404).json({ error: "Post not found" });
        }
        return res.status(200).json({ post });
      }

      // Otherwise fetch list with pagination
      let query = { status: "published" };

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
          { excerpt: { $regex: search, $options: "i" } }
        ];
      }

      if (category && category !== "all") {
        query.tags = { $in: [category] };
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const total = await collection.countDocuments(query);
      const posts = await collection
        .find(query)
        .sort({ published_at: -1 })
        .skip(skip)
        .limit(limitNum)
        .toArray();

      return res.status(200).json({
        posts,
        total,
        page: pageNum,
        limit: limitNum
      });
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
}
