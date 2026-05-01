/*
  # Add sold_at timestamp to products table

  ## Summary
  Adds a sold_at column to track when products were marked as sold.

  ## Changes
  - Add sold_at timestamp column to products table
  - Set to NULL by default
  - Populated when status changes to 'sold'
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sold_at'
  ) THEN
    ALTER TABLE products ADD COLUMN sold_at timestamptz DEFAULT NULL;
  END IF;
END $$;
