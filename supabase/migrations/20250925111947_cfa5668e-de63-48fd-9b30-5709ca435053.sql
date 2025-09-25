-- Add store_name column to suggestions table
ALTER TABLE public.suggestions 
ADD COLUMN store_name TEXT;