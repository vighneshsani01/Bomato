/*
  # Create Restaurants Table

  1. New Tables
    - `restaurants`
      - `id` (uuid, primary key)
      - `name` (text) - Restaurant name
      - `image_url` (text) - URL to restaurant image
      - `rating` (numeric) - Rating out of 5
      - `cuisine_tags` (text[]) - Array of cuisine types
      - `price_level` (text) - Price indicator ($ to $$$$)
      - `description` (text) - Brief description
      - `created_at` (timestamptz) - Timestamp

  2. Security
    - Enable RLS on `restaurants` table
    - Add policy for public read access (for browsing restaurants)
*/

CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL,
  rating numeric(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  cuisine_tags text[] DEFAULT '{}',
  price_level text DEFAULT '$' CHECK (price_level IN ('$', '$$', '$$$', '$$$$')),
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view restaurants"
  ON restaurants
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert restaurants"
  ON restaurants
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update restaurants"
  ON restaurants
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete restaurants"
  ON restaurants
  FOR DELETE
  TO authenticated
  USING (true);