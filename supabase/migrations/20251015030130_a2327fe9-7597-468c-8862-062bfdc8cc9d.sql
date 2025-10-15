-- Rename account_id to user_id for clarity
ALTER TABLE suggestions RENAME COLUMN account_id TO user_id;

-- Remove visitor_id as it's duplicate of store_id
ALTER TABLE suggestions DROP COLUMN visitor_id;

-- Fill NULL values in store_name before making it NOT NULL
UPDATE suggestions SET store_name = '' WHERE store_name IS NULL;

-- Make store_name NOT NULL with default
ALTER TABLE suggestions ALTER COLUMN store_name SET NOT NULL;
ALTER TABLE suggestions ALTER COLUMN store_name SET DEFAULT '';

-- Add source field to track data origin
ALTER TABLE suggestions ADD COLUMN source text DEFAULT 'webapp';

-- Create index for faster queries by user_id and created_at
CREATE INDEX idx_suggestions_user_created ON suggestions(user_id, created_at DESC);

-- Create a trigger function to validate suggestion length (more flexible than CHECK constraint)
CREATE OR REPLACE FUNCTION validate_suggestion_length()
RETURNS TRIGGER AS $$
BEGIN
  IF char_length(NEW.suggestion) < 10 THEN
    RAISE EXCEPTION 'Suggestion too short (minimum 10 characters)';
  END IF;
  IF char_length(NEW.suggestion) > 5000 THEN
    RAISE EXCEPTION 'Suggestion too long (maximum 5000 characters)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for suggestion length validation
CREATE TRIGGER check_suggestion_length
  BEFORE INSERT OR UPDATE ON suggestions
  FOR EACH ROW
  EXECUTE FUNCTION validate_suggestion_length();