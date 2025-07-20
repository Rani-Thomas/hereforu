/*
  # Complete HereForYou Database Schema

  1. New Tables
    - `users` - User authentication and basic info
    - `user_profiles` - Extended user profile information
    - `user_locations` - User saved locations with coordinates
    - `service_categories` - Available service categories
    - `professionals` - Professional service providers
    - `professional_services` - Services offered by professionals
    - `bookings` - Service bookings
    - `booking_timeline` - Booking status tracking
    - `reviews` - Customer reviews and ratings

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure data access based on user roles

  3. Features
    - Location-based professional filtering
    - Real-time booking management
    - Review and rating system
    - Professional availability tracking
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create enum types
CREATE TYPE user_role AS ENUM ('customer', 'professional', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'upi', 'card', 'wallet');
CREATE TYPE service_category AS ENUM (
  'plumbing', 'electrical', 'ac_repair', 'appliance_repair', 
  'house_cleaning', 'car_repair', 'gardening', 'pest_control', 
  'caretaker', 'cook', 'maid', 'laundry', 'healthcare', 
  'babysitting', 'tailoring', 'other'
);

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text UNIQUE,
  role user_role DEFAULT 'customer',
  avatar_url text,
  date_of_birth date,
  gender text,
  bio text,
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User locations table
CREATE TABLE IF NOT EXISTS user_locations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Home',
  address text NOT NULL,
  city text NOT NULL DEFAULT 'Trivandrum',
  state text DEFAULT 'Kerala',
  pincode text NOT NULL,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Service categories table
CREATE TABLE IF NOT EXISTS service_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  category service_category NOT NULL,
  description text,
  icon text,
  base_price_min integer DEFAULT 200,
  base_price_max integer DEFAULT 1000,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Professionals table
CREATE TABLE IF NOT EXISTS professionals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  business_name text,
  services service_category[] NOT NULL,
  experience_years integer DEFAULT 0,
  hourly_rate integer NOT NULL,
  description text,
  skills text[],
  city text NOT NULL,
  areas_served text[],
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  is_verified boolean DEFAULT false,
  is_available boolean DEFAULT true,
  rating_average decimal(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  total_bookings integer DEFAULT 0,
  completed_bookings integer DEFAULT 0,
  response_time_minutes integer DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Professional services (detailed service offerings)
CREATE TABLE IF NOT EXISTS professional_services (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  service_category service_category NOT NULL,
  service_name text NOT NULL,
  description text,
  price_min integer,
  price_max integer,
  estimated_duration_hours decimal(3,1),
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id text UNIQUE NOT NULL,
  customer_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  service_category service_category NOT NULL,
  service_name text,
  service_description text,
  scheduled_date date NOT NULL,
  scheduled_time time NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  pincode text NOT NULL,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  estimated_cost_min integer,
  estimated_cost_max integer,
  actual_cost integer,
  payment_method payment_method NOT NULL,
  status booking_status DEFAULT 'pending',
  special_instructions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Booking timeline table
CREATE TABLE IF NOT EXISTS booking_timeline (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  status booking_status NOT NULL,
  note text,
  updated_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_locations
CREATE POLICY "Users can manage own locations" ON user_locations
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for service_categories
CREATE POLICY "Anyone can view active services" ON service_categories
  FOR SELECT USING (is_active = true);

-- RLS Policies for professionals
CREATE POLICY "Anyone can view verified professionals" ON professionals
  FOR SELECT USING (is_verified = true AND is_available = true);

CREATE POLICY "Professionals can update own profile" ON professionals
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for professional_services
CREATE POLICY "Anyone can view available services" ON professional_services
  FOR SELECT USING (is_available = true);

CREATE POLICY "Professionals can manage own services" ON professional_services
  FOR ALL USING (
    professional_id IN (
      SELECT id FROM professionals WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (
    auth.uid() = customer_id OR 
    auth.uid() IN (
      SELECT user_id FROM professionals WHERE id = professional_id
    )
  );

CREATE POLICY "Customers can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (
    auth.uid() = customer_id OR 
    auth.uid() IN (
      SELECT user_id FROM professionals WHERE id = professional_id
    )
  );

-- RLS Policies for booking_timeline
CREATE POLICY "Users can view booking timeline" ON booking_timeline
  FOR SELECT USING (
    booking_id IN (
      SELECT id FROM bookings 
      WHERE customer_id = auth.uid() OR 
      professional_id IN (
        SELECT id FROM professionals WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can add timeline entries" ON booking_timeline
  FOR INSERT WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings 
      WHERE customer_id = auth.uid() OR 
      professional_id IN (
        SELECT id FROM professionals WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for reviews
CREATE POLICY "Anyone can view public reviews" ON reviews
  FOR SELECT USING (is_public = true);

CREATE POLICY "Customers can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = customer_id);

-- Functions for triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION generate_booking_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_id = 'BK' || to_char(now(), 'YYYYMMDD') || LPAD(nextval('booking_id_seq')::text, 6, '0');
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for booking IDs
CREATE SEQUENCE IF NOT EXISTS booking_id_seq START 1;

-- Create triggers
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professionals_updated_at
  BEFORE UPDATE ON professionals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER generate_booking_id_trigger
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION generate_booking_id();

-- Insert service categories
INSERT INTO service_categories (name, category, description, icon, base_price_min, base_price_max) VALUES
('Plumbing', 'plumbing', 'Pipe repairs, leaks, installations', 'fas fa-wrench', 200, 800),
('Electrical', 'electrical', 'Wiring, repairs, installations', 'fas fa-bolt', 250, 1000),
('AC Repair', 'ac_repair', 'AC service, installation, maintenance', 'fas fa-snowflake', 300, 1200),
('Appliance Repair', 'appliance_repair', 'Home appliance repairs', 'fas fa-tools', 200, 800),
('House Cleaning', 'house_cleaning', 'Deep cleaning, regular cleaning', 'fas fa-broom', 150, 500),
('Car Repair', 'car_repair', 'Auto service, repairs, maintenance', 'fas fa-car', 300, 1500),
('Gardening', 'gardening', 'Garden maintenance, landscaping', 'fas fa-seedling', 200, 600),
('Pest Control', 'pest_control', 'Termite, insects, rodents', 'fas fa-bug', 300, 800),
('Caretaker', 'caretaker', 'Elder care, patient care', 'fas fa-user-nurse', 200, 500),
('Cook', 'cook', 'Home cooking, meal preparation', 'fas fa-utensils', 150, 400),
('Maid Service', 'maid', 'House cleaning, maintenance', 'fas fa-home', 150, 400),
('Laundry', 'laundry', 'Washing, ironing, dry cleaning', 'fas fa-tshirt', 100, 300),
('Healthcare', 'healthcare', 'Nurses, physiotherapy', 'fas fa-heartbeat', 300, 800),
('Babysitting', 'babysitting', 'Child care, nanny services', 'fas fa-baby', 150, 400),
('Tailoring', 'tailoring', 'Stitching, alterations, repairs', 'fas fa-cut', 100, 500),
('Other', 'other', 'Other miscellaneous services', 'fas fa-plus', 150, 500);