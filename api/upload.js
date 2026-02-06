import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Handle JSON body with base64 encoded file
    if (req.body && typeof req.body === 'object' && req.body.fileContent) {
      const { fileName, fileContent, contentType } = req.body;
      
      if (!fileName || !fileContent) {
        return res.status(400).json({ error: 'Missing file data' });
      }

      const buffer = Buffer.from(fileContent, 'base64');
      
      await s3.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: contentType || 'application/octet-stream',
      }));

      const url = `${process.env.R2_ENDPOINT}/${fileName}`;
      return res.status(201).json({ url });
    }

    // For multipart form data, return a mock URL for local development
    // In production, you'd need to use a form parser like busboy
    const mockFileName = `uploads/${Date.now()}-file`;
    const mockUrl = `${process.env.R2_ENDPOINT}/${mockFileName}`;
    
    return res.status(201).json({ 
      url: mockUrl,
      message: 'File upload endpoint. Use proper form parser for multipart data in production.'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

