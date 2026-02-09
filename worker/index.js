
import { Router, error, status } from "itty-router";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const router = Router();

// Environment variables
// R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, DATABASE_URL

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// CORS handling middleware
const withCors = (response) => {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return new Response(response.body, { ...response, headers });
};

// Preflight request handler for all routes
router.all("*", (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
});

router.post("/upload", async (request, env) => {
  const { file, type } = await request.json();
  const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(2)}`;
  const buffer = Buffer.from(file.split(",")[1], 'base64');
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: type,
  });

  await s3.send(command);

  return new Response(JSON.stringify({ url: `${env.R2_PUBLIC_URL}/${fileName}` }), {
    headers: { "Content-Type": "application/json" },
  });
});

router.post("/create-property", async (request, env) => {
  const property = await request.json();
  await env.DB.prepare(
    "INSERT INTO properties (title, description, location, google_maps, size_min, size_max, price_min, price_max, status, progress, featured_image, images, videos, installment_available, installment_config) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    property.title,
    property.description,
    property.location,
    property.google_maps,
    property.size_min,
    property.size_max,
    property.price_min,
    property.price_max,
    property.status,
    property.progress,
    property.featured_image,
    JSON.stringify(property.images),
    JSON.stringify(property.videos),
    property.installment_available,
    JSON.stringify(property.installment_config)
  ).run();
  return status(200, "OK");
});

router.post("/update-property", async (request, env) => {
  const { id, ...property } = await request.json();
  await env.DB.prepare(
    "UPDATE properties SET title = ?, description = ?, location = ?, google_maps = ?, size_min = ?, size_max = ?, price_min = ?, price_max = ?, status = ?, progress = ?, featured_image = ?, images = ?, videos = ?, installment_available = ?, installment_config = ? WHERE id = ?"
  ).bind(
    property.title,
    property.description,
    property.location,
    property.google_maps,
    property.size_min,
    property.size_max,
    property.price_min,
    property.price_max,
    property.status,
    property.progress,
    property.featured_image,
    JSON.stringify(property.images),
    JSON.stringify(property.videos),
    property.installment_available,
    JSON.stringify(property.installment_config),
    id
  ).run();
  return status(200, "OK");
});

router.post("/delete-property", async (request, env) => {
  const { id } = await request.json();
  await env.DB.prepare("DELETE FROM properties WHERE id = ?").bind(id).run();
  return status(200, "OK");
});

router.post("/get-user-profile", async (request, env) => {
  const { userId, fullName, phone } = await request.json();
  let profile = await env.DB.prepare("SELECT * FROM profiles WHERE id = ?").bind(userId).first();

  if (!profile) {
    await env.DB.prepare("INSERT INTO profiles (id, full_name, phone) VALUES (?, ?, ?)")
      .bind(userId, fullName, phone)
      .run();
    profile = await env.DB.prepare("SELECT * FROM profiles WHERE id = ?").bind(userId).first();
  }

  return new Response(JSON.stringify(profile), { headers: { "Content-Type": "application/json" } });
});

router.post("/create-site-visit-booking", async (request, env) => {
  const { userId, name, phone, email, preferred_date, preferred_time, message } = await request.json();
  const created_at = new Date().toISOString();
  await env.DB.prepare(
    "INSERT INTO site_visit_bookings (user_id, name, phone, email, preferred_date, preferred_time, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(userId, name, phone, email, preferred_date, preferred_time, message, created_at).run();
  return status(200, "OK");
});

router.post("/get-profiles", async (request, env) => {
  const { results } = await env.DB.prepare("SELECT * FROM profiles").all();
  return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
});

router.post("/update-user-role", async (request, env) => {
  const { userId, role } = await request.json();
  await env.DB.prepare("UPDATE profiles SET role = ? WHERE id = ?").bind(role, userId).run();
  return status(200, "OK");
});

router.post("/get-users", async (request, env) => {
  const { results } = await env.DB.prepare("SELECT * FROM profiles").all();
  return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
});


router.post("/get-blog-posts", async (request, env) => {
  const { results } = await env.DB.prepare("SELECT * FROM blog_posts ORDER BY created_at DESC").all();
  return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
});

router.post("/create-blog-post", async (request, env) => {
  const post = await request.json();
  await env.DB.prepare("INSERT INTO blog_posts (title, content, author) VALUES (?, ?, ?)")
    .bind(post.title, post.content, post.author)
    .run();
  return status(200, "OK");
});

router.post("/update-blog-post", async (request, env) => {
  const { id, ...post } = await request.json();
  await env.DB.prepare("UPDATE blog_posts SET title = ?, content = ?, author = ? WHERE id = ?")
    .bind(post.title, post.content, post.author, id)
    .run();
  return status(200, "OK");
});

router.post("/delete-blog-post", async (request, env) => {
  const { id } = await request.json();
  await env.DB.prepare("DELETE FROM blog_posts WHERE id = ?").bind(id).run();
  return status(200, "OK");
});

router.post("/get-faqs", async (request, env) => {
  const { results } = await env.DB.prepare("SELECT * FROM faqs ORDER BY created_at DESC").all();
  return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
});

router.post("/create-faq", async (request, env) => {
  const faq = await request.json();
  await env.DB.prepare("INSERT INTO faqs (question, answer) VALUES (?, ?)")
    .bind(faq.question, faq.answer)
    .run();
  return status(200, "OK");
});

router.post("/update-faq", async (request, env) => {
  const { id, ...faq } = await request.json();
  await env.DB.prepare("UPDATE faqs SET question = ?, answer = ? WHERE id = ?")
    .bind(faq.question, faq.answer, id)
    .run();
  return status(200, "OK");
});

router.post("/delete-faq", async (request, env) => {
  const { id } = await request.json();
  await env.DB.prepare("DELETE FROM faqs WHERE id = ?").bind(id).run();
  return status(200, "OK");
});

router.post("/toggle-faq-status", async (request, env) => {
  const { id, is_active } = await request.json();
  await env.DB.prepare("UPDATE faqs SET is_active = ? WHERE id = ?").bind(is_active, id).run();
  return status(200, "OK");
});

router.post("/move-faq", async (request, env) => {
  const { id, direction } = await request.json();
  const faqToMove = await env.DB.prepare("SELECT * FROM faqs WHERE id = ?").bind(id).first();
  if (!faqToMove) {
    return status(404, "FAQ not found");
  }

  const currentOrder = faqToMove.order_index;
  let otherFaq;

  if (direction === "up") {
    otherFaq = await env.DB.prepare("SELECT * FROM faqs WHERE order_index < ? ORDER BY order_index DESC LIMIT 1").bind(currentOrder).first();
  } else {
    otherFaq = await env.DB.prepare("SELECT * FROM faqs WHERE order_index > ? ORDER BY order_index ASC LIMIT 1").bind(currentOrder).first();
  }

  if (otherFaq) {
    await env.DB.batch([
      env.DB.prepare("UPDATE faqs SET order_index = ? WHERE id = ?").bind(otherFaq.order_index, faqToMove.id),
      env.DB.prepare("UPDATE faqs SET order_index = ? WHERE id = ?").bind(currentOrder, otherFaq.id)
    ]);
  }

  return status(200, "OK");
});

router.post("/get-feedback", async (request, env) => {
  const { results } = await env.DB.prepare("SELECT * FROM feedback ORDER BY created_at DESC").all();
  return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
});

router.post("/update-feedback-status", async (request, env) => {
  const { id, status } = await request.json();
  await env.DB.prepare("UPDATE feedback SET status = ? WHERE id = ?")
    .bind(status, id)
    .run();
  return status(200, "OK");
});

router.post("/reply-to-feedback", async (request, env) => {
  const { feedbackId, replyMessage } = await request.json();
  await env.DB.prepare("UPDATE feedback SET status = 'replied', reply_message = ?, replied_at = ? WHERE id = ?")
    .bind(replyMessage, new Date().toISOString(), feedbackId)
    .run();
  return status(200, "OK");
});

router.post("/get-gallery-items", async (request, env) => {
  const { results } = await env.DB.prepare("SELECT * FROM gallery ORDER BY created_at DESC").all();
  return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
});

router.post("/create-gallery-item", async (request, env) => {
  const item = await request.json();
  await env.DB.prepare("INSERT INTO gallery (title, description, image_url) VALUES (?, ?, ?)")
    .bind(item.title, item.description, item.image_url)
    .run();
  return status(200, "OK");
});

router.post("/create-gallery-items", async (request, env) => {
  const { galleryItems } = await request.json();
  const stmt = env.DB.prepare("INSERT INTO gallery (title, description, category, image_url, video_url) VALUES (?, ?, ?, ?, ?)");
  const promises = galleryItems.map(item => stmt.bind(item.title, item.description, item.category, item.image_url, item.video_url).run());
  await Promise.all(promises);
  return status(200, "OK");
});

router.post("/update-gallery-item", async (request, env) => {
  const { id, ...item } = await request.json();
  await env.DB.prepare("UPDATE gallery SET title = ?, description = ?, image_url = ? WHERE id = ?")
    .bind(item.title, item.description, item.image_url, id)
    .run();
  return status(200, "OK");
});

router.post("/delete-gallery-item", async (request, env) => {
  const { id } = await request.json();
  await env.DB.prepare("DELETE FROM gallery WHERE id = ?").bind(id).run();
  return status(200, "OK");
});

router.post("/get-newsletter-subscriptions", async (request, env) => {
  const { results } = await env.DB.prepare("SELECT * FROM newsletter_subscriptions ORDER BY created_at DESC").all();
  return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
});

router.post("/get-payment-links", async (request, env) => {
  const { results } = await env.DB.prepare("SELECT * FROM payment_links ORDER BY created_at DESC").all();
  return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
});

router.post("/create-payment-link", async (request, env) => {
  const link = await request.json();
  await env.DB.prepare("INSERT INTO payment_links (name, url, amount) VALUES (?, ?, ?)")
    .bind(link.name, link.url, link.amount)
    .run();
  return status(200, "OK");
});

router.post("/update-payment-link", async (request, env) => {
  const { id, ...link } = await request.json();
  await env.DB.prepare("UPDATE payment_links SET name = ?, url = ?, amount = ? WHERE id = ?")
    .bind(link.name, link.url, link.amount, id)
    .run();
  return status(200, "OK");
});

router.post("/delete-payment-link", async (request, env) => {
  const { id } = await request.json();
  await env.DB.prepare("DELETE FROM payment_links WHERE id = ?").bind(id).run();
  return status(200, "OK");
});

router.post("/get-progress-timeline-items", async (request, env) => {
  const { results } = await env.DB.prepare("SELECT * FROM progress_timeline ORDER BY date DESC").all();
  return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
});

router.post("/create-progress-timeline-item", async (request, env) => {
  const item = await request.json();
  await env.DB.prepare("INSERT INTO progress_timeline (title, description, date) VALUES (?, ?, ?)")
    .bind(item.title, item.description, item.date)
    .run();
  return status(200, "OK");
});

router.post("/delete-progress-timeline-item", async (request, env) => {
  const { id } = await request.json();
  await env.DB.prepare("DELETE FROM progress_timeline WHERE id = ?").bind(id).run();
  return status(200, "OK");
});

router.post("/get-properties", async (request, env) => {
  const { status } = await request.json();
  let query = "SELECT * FROM properties";
  let bindings = [];
  if (status) {
    query += " WHERE status = ?";
    bindings.push(status);
  }
  query += " ORDER BY created_at DESC";
  const { results } = await env.DB.prepare(query).bind(...bindings).all();
  return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
});

router.post("/get-site-visit-bookings", async (request, env) => {
  const { results } = await env.DB.prepare("SELECT * FROM site_visit_bookings ORDER BY created_at DESC").all();
  return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
});

router.post("/update-site-visit-status", async (request, env) => {
  const { bookingId, newStatus } = await request.json();
  await env.DB.prepare("UPDATE site_visit_bookings SET follow_up_status = ? WHERE id = ?")
    .bind(newStatus, bookingId)
    .run();
  return status(200, "OK");
});

router.post("/get-customer-subscriptions", async (request, env) => {
  const { results } = await env.DB.prepare("SELECT * FROM customer_subscriptions ORDER BY created_at DESC").all();
  return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
});

router.post("/get-consultant-subscriptions", async (request, env) => {
  const { results } = await env.DB.prepare("SELECT * FROM consultant_subscriptions ORDER BY created_at DESC").all();
  return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
});

router.post("/get-testimonials", async (request, env) => {
  const { results } = await env.DB.prepare(`
    SELECT
      t.*,
      json_object('id', p.id, 'title', p.title, 'location', p.location) as property
    FROM testimonials t
    LEFT JOIN properties p ON t.property_id = p.id
    ORDER BY t.created_at DESC
  `).all();
  return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
});

router.post("/create-testimonial", async (request, env) => {
  const testimonial = await request.json();
  await env.DB.prepare("INSERT INTO testimonials (client_name, client_title, client_company, testimonial_text, rating, featured, status, client_photo_url, property_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(testimonial.client_name, testimonial.client_title, testimonial.client_company, testimonial.testimonial_text, testimonial.rating, testimonial.featured, testimonial.status, testimonial.client_photo_url, testimonial.property_id)
    .run();
  return status(200, "OK");
});

router.post("/update-testimonial", async (request, env) => {
  const { id, ...testimonial } = await request.json();
  await env.DB.prepare("UPDATE testimonials SET client_name = ?, client_title = ?, client_company = ?, testimonial_text = ?, rating = ?, featured = ?, status = ?, client_photo_url = ?, property_id = ? WHERE id = ?")
    .bind(testimonial.client_name, testimonial.client_title, testimonial.client_company, testimonial.testimonial_text, testimonial.rating, testimonial.featured, testimonial.status, testimonial.client_photo_url, testimonial.property_id, id)
    .run();
  return status(200, "OK");
});

router.post("/delete-testimonial", async (request, env) => {
  const { testimonialId } = await request.json();
  await env.DB.prepare("DELETE FROM testimonials WHERE id = ?").bind(testimonialId).run();
  return status(200, "OK");
});

router.post("/update-testimonial-status", async (request, env) => {
  const { testimonialId, newStatus } = await request.json();
  await env.DB.prepare("UPDATE testimonials SET status = ? WHERE id = ?")
    .bind(newStatus, testimonialId)
    .run();
  return status(200, "OK");
});

router.all("*", () => status(404, "Not Found."));

export default {
  fetch: (request, env, ctx) =>
    router
      .handle(request, env, ctx)
      .then(withCors)
      .catch((err) => withCors(error(500, err.stack))),
};
