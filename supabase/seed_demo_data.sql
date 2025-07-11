-- DEMO DATA SEED FOR SUPABASE E-COMMERCE PLATFORM
-- 3 Brands, 10 Products, with attributes, images, and sizes
-- Run this in Supabase SQL editor or CLI

-- 1. Insert Brands
INSERT INTO brands (id, name, website, logo_url, description, contact_email, contact_phone, status)
VALUES
  ('ea6aa674-c26f-4a00-9c59-6c90a464cdd9', 'Stylsia', 'https://stylsia.com', 'https://picsum.photos/seed/stylsia/80', 'Trendy, affordable fashion for all.', 'contact@stylsia.com', '+911234567890', 'active'),
  ('270335b9-3da9-45ab-88e1-4443dc23395d', 'DenimX', 'https://denimx.com', 'https://picsum.photos/seed/denimx/80', 'Premium denim and casual wear.', 'hello@denimx.com', '+911234567891', 'active'),
  ('c386e480-2e52-46ca-8c81-9f01ffea709c', 'MiniTrends', 'https://minitrends.com', 'https://picsum.photos/seed/minitrends/80', 'Fun, colorful kidswear.', 'info@minitrends.com', '+911234567892', 'active');

-- 2. Insert Products
INSERT INTO products (id, name, source_url, brand_id, original_price, current_price, discount_percentage, category, sub_category, main_image_url, description, sku, status, is_featured)
VALUES
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Classic White Tee', 'https://stylsia.com/p/1', 'ea6aa674-c26f-4a00-9c59-6c90a464cdd9', 599, 499, 17, 'T-Shirts', 'Men', 'https://picsum.photos/300/400?random=1', 'Soft cotton, regular fit, available in all sizes. A wardrobe essential for every season.', 'STY-TEE-001', 'active', true),
  ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'Relaxed Fit Jeans', 'https://denimx.com/p/2', '270335b9-3da9-45ab-88e1-4443dc23395d', 1499, 1299, 13, 'Jeans', 'Men', 'https://picsum.photos/300/400?random=2', 'Denim, relaxed fit, light blue wash. Comfortable and stylish for everyday wear.', 'DNX-JNS-002', 'active', true),
  ('a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3', 'Oversized Hoodie', 'https://stylsia.com/p/3', 'ea6aa674-c26f-4a00-9c59-6c90a464cdd9', 1199, 999, 17, 'Hoodies', 'Women', 'https://picsum.photos/300/400?random=3', 'Fleece, oversized, multiple colors. Stay cozy and on-trend.', 'STY-HDY-003', 'active', false),
  ('a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4', 'Linen Summer Dress', 'https://stylsia.com/p/4', 'ea6aa674-c26f-4a00-9c59-6c90a464cdd9', 1799, 1599, 11, 'Dresses', 'Women', 'https://picsum.photos/300/400?random=4', 'Breathable linen, midi length, 2 colors. Perfect for warm days.', 'STY-DRS-004', 'active', true),
  ('a5a5a5a5-a5a5-a5a5-a5a5-a5a5a5a5a5a5', 'Kids Cartoon Tee', 'https://minitrends.com/p/5', 'c386e480-2e52-46ca-8c81-9f01ffea709c', 499, 399, 20, 'T-Shirts', 'Kids', 'https://picsum.photos/300/400?random=5', 'Fun cartoon print, soft cotton, easy to wash.', 'MTR-TEE-005', 'active', false),
  ('a6a6a6a6-a6a6-a6a6-a6a6-a6a6a6a6a6a6', 'Boys Slim Jeans', 'https://denimx.com/p/6', '270335b9-3da9-45ab-88e1-4443dc23395d', 999, 799, 20, 'Jeans', 'Kids', 'https://picsum.photos/300/400?random=6', 'Slim fit, stretchable denim, durable for play.', 'DNX-JNS-006', 'active', false),
  ('a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7', 'Women’s Printed Kurti', 'https://stylsia.com/p/7', 'ea6aa674-c26f-4a00-9c59-6c90a464cdd9', 1099, 899, 18, 'Kurtis', 'Women', 'https://picsum.photos/300/400?random=7', 'Vibrant prints, lightweight rayon, perfect for summer.', 'STY-KRT-007', 'active', false),
  ('a8a8a8a8-a8a8-a8a8-a8a8-a8a8a8a8a8a8', 'Men’s Polo Shirt', 'https://stylsia.com/p/8', 'ea6aa674-c26f-4a00-9c59-6c90a464cdd9', 899, 699, 22, 'T-Shirts', 'Men', 'https://picsum.photos/300/400?random=8', 'Classic polo, breathable fabric, smart casual.', 'STY-TEE-008', 'active', false),
  ('a9a9a9a9-a9a9-a9a9-a9a9-a9a9a9a9a9a9', 'Girls Party Dress', 'https://minitrends.com/p/9', 'c386e480-2e52-46ca-8c81-9f01ffea709c', 1399, 1199, 14, 'Dresses', 'Kids', 'https://picsum.photos/300/400?random=9', 'Shimmery, twirl-worthy, perfect for special occasions.', 'MTR-DRS-009', 'active', true),
  ('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b0', 'Men’s Track Pants', 'https://denimx.com/p/10', '270335b9-3da9-45ab-88e1-4443dc23395d', 799, 599, 25, 'Track Pants', 'Men', 'https://picsum.photos/300/400?random=10', 'Stretchable, moisture-wicking, ideal for workouts.', 'DNX-TRK-010', 'active', false);

-- 3. Insert Product Attributes
INSERT INTO product_attributes (id, product_id, fabric, fit, collar, sleeve, closure, pattern, occasion, care_instructions, material, color, style)
VALUES
  (gen_random_uuid(), 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Cotton', 'Regular', 'Round', 'Short', NULL, 'Solid', 'Casual', 'Machine wash', 'Cotton', 'White', 'Basic'),
  (gen_random_uuid(), 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'Denim', 'Relaxed', NULL, NULL, 'Button', 'Washed', 'Casual', 'Machine wash', 'Denim', 'Blue', 'Jeans'),
  (gen_random_uuid(), 'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3', 'Fleece', 'Oversized', 'Hooded', 'Long', 'Zipper', 'Solid', 'Casual', 'Machine wash', 'Fleece', 'Black', 'Hoodie'),
  (gen_random_uuid(), 'a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4', 'Linen', 'Regular', NULL, 'Short', NULL, 'Solid', 'Casual', 'Hand wash', 'Linen', 'Pink', 'Dress'),
  (gen_random_uuid(), 'a5a5a5a5-a5a5-a5a5-a5a5-a5a5a5a5a5a5', 'Cotton', 'Regular', 'Round', 'Short', NULL, 'Cartoon', 'Casual', 'Machine wash', 'Cotton', 'Yellow', 'Tee'),
  (gen_random_uuid(), 'a6a6a6a6-a6a6-a6a6-a6a6-a6a6a6a6a6a6', 'Denim', 'Slim', NULL, NULL, 'Button', 'Solid', 'Casual', 'Machine wash', 'Denim', 'Blue', 'Jeans'),
  (gen_random_uuid(), 'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7', 'Rayon', 'Regular', 'Round', '3/4', NULL, 'Printed', 'Ethnic', 'Hand wash', 'Rayon', 'Red', 'Kurti'),
  (gen_random_uuid(), 'a8a8a8a8-a8a8-a8a8-a8a8-a8a8a8a8a8a8', 'Cotton', 'Regular', 'Polo', 'Short', 'Button', 'Solid', 'Casual', 'Machine wash', 'Cotton', 'Green', 'Polo'),
  (gen_random_uuid(), 'a9a9a9a9-a9a9-a9a9-a9a9-a9a9a9a9a9a9', 'Polyester', 'Fit & Flare', NULL, 'Sleeveless', NULL, 'Shimmery', 'Party', 'Hand wash', 'Polyester', 'Purple', 'Dress'),
  (gen_random_uuid(), 'b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b0', 'Polyester', 'Regular', 'Elastic', NULL, 'Drawstring', 'Solid', 'Sports', 'Machine wash', 'Polyester', 'Black', 'Track');

-- 4. Insert Product Images (main + extra)
INSERT INTO product_images (id, product_id, image_url, alt_text, is_main, display_order)
VALUES
  (gen_random_uuid(), 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'https://picsum.photos/300/400?random=1', 'Classic White Tee', true, 1),
  (gen_random_uuid(), 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'https://picsum.photos/300/400?random=11', 'Classic White Tee Alt', false, 2),
  (gen_random_uuid(), 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'https://picsum.photos/300/400?random=2', 'Relaxed Fit Jeans', true, 1),
  (gen_random_uuid(), 'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3', 'https://picsum.photos/300/400?random=3', 'Oversized Hoodie', true, 1),
  (gen_random_uuid(), 'a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4', 'https://picsum.photos/300/400?random=4', 'Linen Summer Dress', true, 1),
  (gen_random_uuid(), 'a5a5a5a5-a5a5-a5a5-a5a5-a5a5a5a5a5a5', 'https://picsum.photos/300/400?random=5', 'Kids Cartoon Tee', true, 1),
  (gen_random_uuid(), 'a6a6a6a6-a6a6-a6a6-a6a6-a6a6a6a6a6a6', 'https://picsum.photos/300/400?random=6', 'Boys Slim Jeans', true, 1),
  (gen_random_uuid(), 'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7', 'https://picsum.photos/300/400?random=7', 'Women’s Printed Kurti', true, 1),
  (gen_random_uuid(), 'a8a8a8a8-a8a8-a8a8-a8a8-a8a8a8a8a8a8', 'https://picsum.photos/300/400?random=8', 'Men’s Polo Shirt', true, 1),
  (gen_random_uuid(), 'a9a9a9a9-a9a9-a9a9-a9a9-a9a9a9a9a9a9', 'https://picsum.photos/300/400?random=9', 'Girls Party Dress', true, 1),
  (gen_random_uuid(), 'b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b0', 'https://picsum.photos/300/400?random=10', 'Men’s Track Pants', true, 1);

-- 5. Insert Product Sizes (XS-XL, etc.)
INSERT INTO product_sizes (id, product_id, size, is_available, stock_count)
VALUES
  (gen_random_uuid(), 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'S', true, 10),
  (gen_random_uuid(), 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'M', true, 8),
  (gen_random_uuid(), 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'L', true, 5),
  (gen_random_uuid(), 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'M', true, 7),
  (gen_random_uuid(), 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'L', true, 6),
  (gen_random_uuid(), 'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3', 'M', true, 12),
  (gen_random_uuid(), 'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3', 'L', true, 9),
  (gen_random_uuid(), 'a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4', 'S', true, 4),
  (gen_random_uuid(), 'a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4', 'M', true, 6),
  (gen_random_uuid(), 'a5a5a5a5-a5a5-a5a5-a5a5-a5a5a5a5a5a5', 'XS', true, 10),
  (gen_random_uuid(), 'a5a5a5a5-a5a5-a5a5-a5a5-a5a5a5a5a5a5', 'S', true, 8),
  (gen_random_uuid(), 'a6a6a6a6-a6a6-a6a6-a6a6-a6a6a6a6a6a6', 'S', true, 7),
  (gen_random_uuid(), 'a6a6a6a6-a6a6-a6a6-a6a6-a6a6a6a6a6a6', 'M', true, 5),
  (gen_random_uuid(), 'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7', 'M', true, 6),
  (gen_random_uuid(), 'a8a8a8a8-a8a8-a8a8-a8a8-a8a8a8a8a8a8', 'L', true, 7),
  (gen_random_uuid(), 'a9a9a9a9-a9a9-a9a9-a9a9-a9a9a9a9a9a9', 'XS', true, 3),
  (gen_random_uuid(), 'b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b0', 'M', true, 8);
