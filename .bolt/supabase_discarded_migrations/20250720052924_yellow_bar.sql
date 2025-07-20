/*
  # Insert Sample Professionals Data

  1. Professional Users
    - Create sample professional profiles
    - Add Kerala-based names and TVM locations
    - Include contact info and service details

  2. Professional Services
    - Add specific services for each professional
    - Set realistic pricing and duration

  3. Sample Reviews
    - Add customer reviews for professionals
    - Include ratings and feedback
*/

-- Insert sample professional user profiles
INSERT INTO user_profiles (id, email, full_name, phone, role, is_verified, is_active) VALUES
-- Plumbing Professionals
(uuid_generate_v4(), 'suresh.kumar@example.com', 'Suresh Kumar', '+919876543201', 'professional', true, true),
(uuid_generate_v4(), 'anil.nair@example.com', 'Anil Nair', '+919876543202', 'professional', true, true),
(uuid_generate_v4(), 'ravi.menon@example.com', 'Ravi Menon', '+919876543203', 'professional', true, true),
(uuid_generate_v4(), 'krishnan.p@example.com', 'Krishnan P.', '+919876543204', 'professional', true, true),

-- Electrical Professionals
(uuid_generate_v4(), 'rajesh.kumar@example.com', 'Rajesh Kumar', '+919876543205', 'professional', true, true),
(uuid_generate_v4(), 'vinod.thomas@example.com', 'Vinod Thomas', '+919876543206', 'professional', true, true),
(uuid_generate_v4(), 'santhosh.r@example.com', 'Santhosh R.', '+919876543207', 'professional', true, true),
(uuid_generate_v4(), 'deepak.nair@example.com', 'Deepak Nair', '+919876543208', 'professional', true, true),

-- AC Repair Professionals
(uuid_generate_v4(), 'anju.r@example.com', 'Anju R.', '+919876543209', 'professional', true, true),
(uuid_generate_v4(), 'arun.m@example.com', 'Arun M.', '+919876543210', 'professional', true, true),
(uuid_generate_v4(), 'priya.devi@example.com', 'Priya Devi', '+919876543211', 'professional', true, true),
(uuid_generate_v4(), 'manoj.kumar@example.com', 'Manoj Kumar', '+919876543212', 'professional', true, true),

-- House Cleaning Professionals
(uuid_generate_v4(), 'meera.kumari@example.com', 'Meera Kumari', '+919876543213', 'professional', true, true),
(uuid_generate_v4(), 'latha.nair@example.com', 'Latha Nair', '+919876543214', 'professional', true, true),
(uuid_generate_v4(), 'suma.r@example.com', 'Suma R.', '+919876543215', 'professional', true, true),
(uuid_generate_v4(), 'geetha.menon@example.com', 'Geetha Menon', '+919876543216', 'professional', true, true),

-- Car Repair Professionals
(uuid_generate_v4(), 'biju.thomas@example.com', 'Biju Thomas', '+919876543217', 'professional', true, true),
(uuid_generate_v4(), 'sajan.kumar@example.com', 'Sajan Kumar', '+919876543218', 'professional', true, true),
(uuid_generate_v4(), 'renjith.p@example.com', 'Renjith P.', '+919876543219', 'professional', true, true),
(uuid_generate_v4(), 'shibu.nair@example.com', 'Shibu Nair', '+919876543220', 'professional', true, true);

-- Insert professionals with location data
WITH professional_users AS (
  SELECT id, full_name, email, phone FROM user_profiles WHERE role = 'professional'
),
locations AS (
  SELECT * FROM (VALUES
    ('Pattom', 8.5241, 76.9366),
    ('Kazhakkoottam', 8.5569, 76.8747),
    ('Technopark', 8.5569, 76.8747),
    ('Vazhuthacaud', 8.5074, 76.9570),
    ('Ulloor', 8.5241, 76.9366),
    ('Medical College', 8.5241, 76.9366),
    ('Sasthamangalam', 8.5241, 76.9366),
    ('Peroorkada', 8.5241, 76.9366),
    ('Thirumala', 8.5241, 76.9366),
    ('Palayam', 8.5074, 76.9570),
    ('East Fort', 8.4855, 76.9492),
    ('Thampanoor', 8.4855, 76.9492),
    ('Vellayambalam', 8.5241, 76.9366),
    ('Kowdiar', 8.5241, 76.9366),
    ('Jagathy', 8.5241, 76.9366),
    ('Mannanthala', 8.5569, 76.8747),
    ('Enchakkal', 8.5569, 76.8747),
    ('Balaramapuram', 8.5569, 76.8747),
    ('Neyyattinkara', 8.4014, 77.0847),
    ('Attingal', 8.6969, 76.8153)
  ) AS t(area, lat, lng)
)

INSERT INTO professionals (user_id, services, experience_years, hourly_rate, description, skills, city, areas_served, latitude, longitude, is_verified, rating_average, rating_count, total_bookings, completed_bookings, response_time_minutes)
SELECT 
  pu.id,
  CASE 
    WHEN pu.full_name IN ('Suresh Kumar', 'Anil Nair', 'Ravi Menon', 'Krishnan P.') THEN ARRAY['plumbing']::service_category[]
    WHEN pu.full_name IN ('Rajesh Kumar', 'Vinod Thomas', 'Santhosh R.', 'Deepak Nair') THEN ARRAY['electrical']::service_category[]
    WHEN pu.full_name IN ('Anju R.', 'Arun M.', 'Priya Devi', 'Manoj Kumar') THEN ARRAY['ac_repair']::service_category[]
    WHEN pu.full_name IN ('Meera Kumari', 'Latha Nair', 'Suma R.', 'Geetha Menon') THEN ARRAY['house_cleaning']::service_category[]
    WHEN pu.full_name IN ('Biju Thomas', 'Sajan Kumar', 'Renjith P.', 'Shibu Nair') THEN ARRAY['car_repair']::service_category[]
  END,
  CASE 
    WHEN pu.full_name IN ('Suresh Kumar', 'Rajesh Kumar', 'Anju R.', 'Biju Thomas') THEN 8
    WHEN pu.full_name IN ('Anil Nair', 'Vinod Thomas', 'Arun M.', 'Sajan Kumar') THEN 5
    WHEN pu.full_name IN ('Ravi Menon', 'Santhosh R.', 'Priya Devi', 'Renjith P.') THEN 6
    WHEN pu.full_name IN ('Krishnan P.', 'Deepak Nair', 'Manoj Kumar', 'Shibu Nair') THEN 4
    ELSE 3
  END,
  CASE 
    WHEN pu.full_name IN ('Suresh Kumar', 'Anil Nair', 'Ravi Menon', 'Krishnan P.') THEN 300 + (RANDOM() * 200)::integer
    WHEN pu.full_name IN ('Rajesh Kumar', 'Vinod Thomas', 'Santhosh R.', 'Deepak Nair') THEN 350 + (RANDOM() * 250)::integer
    WHEN pu.full_name IN ('Anju R.', 'Arun M.', 'Priya Devi', 'Manoj Kumar') THEN 400 + (RANDOM() * 300)::integer
    WHEN pu.full_name IN ('Meera Kumari', 'Latha Nair', 'Suma R.', 'Geetha Menon') THEN 200 + (RANDOM() * 150)::integer
    WHEN pu.full_name IN ('Biju Thomas', 'Sajan Kumar', 'Renjith P.', 'Shibu Nair') THEN 350 + (RANDOM() * 400)::integer
  END,
  CASE 
    WHEN pu.full_name IN ('Suresh Kumar', 'Anil Nair', 'Ravi Menon', 'Krishnan P.') THEN 'Experienced plumber specializing in residential and commercial plumbing solutions.'
    WHEN pu.full_name IN ('Rajesh Kumar', 'Vinod Thomas', 'Santhosh R.', 'Deepak Nair') THEN 'Licensed electrician with expertise in home wiring and electrical installations.'
    WHEN pu.full_name IN ('Anju R.', 'Arun M.', 'Priya Devi', 'Manoj Kumar') THEN 'AC technician specializing in installation, repair, and maintenance of all AC brands.'
    WHEN pu.full_name IN ('Meera Kumari', 'Latha Nair', 'Suma R.', 'Geetha Menon') THEN 'Professional house cleaning service with attention to detail and eco-friendly products.'
    WHEN pu.full_name IN ('Biju Thomas', 'Sajan Kumar', 'Renjith P.', 'Shibu Nair') THEN 'Certified auto mechanic with experience in all types of vehicle repairs and maintenance.'
  END,
  CASE 
    WHEN pu.full_name IN ('Suresh Kumar', 'Anil Nair', 'Ravi Menon', 'Krishnan P.') THEN ARRAY['Pipe Repair', 'Bathroom Fitting', 'Water Heater', 'Drainage']
    WHEN pu.full_name IN ('Rajesh Kumar', 'Vinod Thomas', 'Santhosh R.', 'Deepak Nair') THEN ARRAY['House Wiring', 'Fan Installation', 'Switch Board', 'LED Lights']
    WHEN pu.full_name IN ('Anju R.', 'Arun M.', 'Priya Devi', 'Manoj Kumar') THEN ARRAY['Split AC', 'Window AC', 'Central AC', 'AC Installation']
    WHEN pu.full_name IN ('Meera Kumari', 'Latha Nair', 'Suma R.', 'Geetha Menon') THEN ARRAY['Deep Cleaning', 'Regular Cleaning', 'Kitchen Cleaning', 'Bathroom Cleaning']
    WHEN pu.full_name IN ('Biju Thomas', 'Sajan Kumar', 'Renjith P.', 'Shibu Nair') THEN ARRAY['Engine Repair', 'Brake Service', 'Oil Change', 'Battery Service']
  END,
  'Trivandrum',
  ARRAY['Pattom', 'Kazhakkoottam', 'Technopark', 'Vazhuthacaud', 'Ulloor'],
  (SELECT lat FROM locations ORDER BY RANDOM() LIMIT 1),
  (SELECT lng FROM locations ORDER BY RANDOM() LIMIT 1),
  true,
  4.2 + (RANDOM() * 0.8),
  50 + (RANDOM() * 200)::integer,
  100 + (RANDOM() * 500)::integer,
  80 + (RANDOM() * 400)::integer,
  15 + (RANDOM() * 45)::integer
FROM professional_users pu;

-- Insert professional services
INSERT INTO professional_services (professional_id, service_category, service_name, description, price_min, price_max, estimated_duration_hours)
SELECT 
  p.id,
  unnest(p.services),
  CASE 
    WHEN 'plumbing' = ANY(p.services) THEN 'Plumbing Services'
    WHEN 'electrical' = ANY(p.services) THEN 'Electrical Services'
    WHEN 'ac_repair' = ANY(p.services) THEN 'AC Repair & Maintenance'
    WHEN 'house_cleaning' = ANY(p.services) THEN 'House Cleaning Services'
    WHEN 'car_repair' = ANY(p.services) THEN 'Car Repair & Maintenance'
  END,
  CASE 
    WHEN 'plumbing' = ANY(p.services) THEN 'Complete plumbing solutions including repairs, installations, and maintenance'
    WHEN 'electrical' = ANY(p.services) THEN 'Professional electrical work including wiring, installations, and repairs'
    WHEN 'ac_repair' = ANY(p.services) THEN 'AC installation, repair, servicing, and maintenance for all brands'
    WHEN 'house_cleaning' = ANY(p.services) THEN 'Professional house cleaning with eco-friendly products'
    WHEN 'car_repair' = ANY(p.services) THEN 'Complete automotive repair and maintenance services'
  END,
  p.hourly_rate - 50,
  p.hourly_rate + 100,
  1.5 + (RANDOM() * 2)
FROM professionals p;

-- Insert sample reviews
WITH sample_reviews AS (
  SELECT 
    p.id as professional_id,
    p.user_id,
    CASE 
      WHEN RANDOM() < 0.7 THEN 5
      WHEN RANDOM() < 0.9 THEN 4
      ELSE 3
    END as rating,
    CASE 
      WHEN 'plumbing' = ANY(p.services) THEN 'Excellent plumbing work! Fixed the issue quickly and professionally.'
      WHEN 'electrical' = ANY(p.services) THEN 'Great electrical work. Very knowledgeable and safety-conscious.'
      WHEN 'ac_repair' = ANY(p.services) THEN 'AC is working perfectly now. Professional and timely service.'
      WHEN 'house_cleaning' = ANY(p.services) THEN 'House looks spotless! Very thorough and careful cleaning.'
      WHEN 'car_repair' = ANY(p.services) THEN 'Car is running smoothly. Honest pricing and quality work.'
    END as review_text
  FROM professionals p
  CROSS JOIN generate_series(1, 3) -- 3 reviews per professional
)
INSERT INTO reviews (professional_id, rating, review_text, is_public)
SELECT professional_id, rating, review_text, true
FROM sample_reviews;

-- Update professional ratings based on reviews
UPDATE professionals 
SET 
  rating_average = subquery.avg_rating,
  rating_count = subquery.review_count
FROM (
  SELECT 
    professional_id,
    ROUND(AVG(rating::decimal), 1) as avg_rating,
    COUNT(*) as review_count
  FROM reviews 
  GROUP BY professional_id
) AS subquery
WHERE professionals.id = subquery.professional_id;