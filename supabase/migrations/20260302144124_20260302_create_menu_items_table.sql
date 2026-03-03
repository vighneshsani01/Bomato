/*
  # Create menu items table

  1. New Tables
    - `menu_items`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key to restaurants)
      - `name` (text, food item name)
      - `description` (text, food description)
      - `price` (numeric, item price)
      - `category` (text, menu category like Appetizers, Mains, etc)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `menu_items` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Menu items are publicly readable"
  ON menu_items
  FOR SELECT
  TO public
  USING (true);
