-- Fix security warning by setting search_path on validation function
CREATE OR REPLACE FUNCTION validate_suggestion_length()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF char_length(NEW.suggestion) < 10 THEN
    RAISE EXCEPTION 'Suggestion too short (minimum 10 characters)';
  END IF;
  IF char_length(NEW.suggestion) > 5000 THEN
    RAISE EXCEPTION 'Suggestion too long (maximum 5000 characters)';
  END IF;
  RETURN NEW;
END;
$$;