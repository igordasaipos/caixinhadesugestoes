-- Add store_id column to suggestions table for the formatted store information
ALTER TABLE public.suggestions 
ADD COLUMN store_id text;

-- Update the existing data to set account_id to visitor_id and store_id to current account_id
UPDATE public.suggestions 
SET 
  store_id = account_id,
  account_id = visitor_id
WHERE store_id IS NULL;