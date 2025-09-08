-- Add new columns to suggestions table for additional user and store data
ALTER TABLE public.suggestions 
ADD COLUMN user_full_name TEXT,
ADD COLUMN user_email TEXT, 
ADD COLUMN store_phone1 TEXT;