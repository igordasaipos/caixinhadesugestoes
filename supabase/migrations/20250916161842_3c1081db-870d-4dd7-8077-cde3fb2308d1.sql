-- Add new columns for contact preferences to suggestions table
ALTER TABLE public.suggestions 
ADD COLUMN preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'whatsapp')),
ADD COLUMN contact_value TEXT,
ADD COLUMN contact_whatsapp TEXT;