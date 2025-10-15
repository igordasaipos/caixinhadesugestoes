-- Add category column to suggestions table
ALTER TABLE public.suggestions 
ADD COLUMN category text;

-- Add index for better query performance on category
CREATE INDEX idx_suggestions_category ON public.suggestions(category);

-- Add check constraint to ensure valid categories
ALTER TABLE public.suggestions
ADD CONSTRAINT valid_category CHECK (
  category IS NULL OR 
  category IN ('atendimento', 'mal-funcionamento', 'melhorias', 'outros')
);