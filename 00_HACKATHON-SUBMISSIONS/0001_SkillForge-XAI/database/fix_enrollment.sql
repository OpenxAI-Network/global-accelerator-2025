-- Fix enrollment function and check database structure
-- Run this in your Supabase SQL editor

-- Check if increment_course_enrollments function exists and works
CREATE OR REPLACE FUNCTION increment_course_enrollments(course_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.courses 
  SET total_enrollments = COALESCE(total_enrollments, 0) + 1 
  WHERE id = course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure total_enrollments column has default value
UPDATE public.courses 
SET total_enrollments = COALESCE(total_enrollments, 0) 
WHERE total_enrollments IS NULL;

-- Add default constraint if not exists
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE public.courses ALTER COLUMN total_enrollments SET DEFAULT 0;
  EXCEPTION
    WHEN others THEN NULL;
  END;
END $$;

-- Test the enrollment process with a simple function
CREATE OR REPLACE FUNCTION test_enrollment(user_id UUID, course_id UUID)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- Try to insert enrollment
  INSERT INTO public.enrollments (user_id, course_id, enrolled_at, completion_percentage, last_accessed_at)
  VALUES (user_id, course_id, NOW(), 0, NOW())
  ON CONFLICT (user_id, course_id) DO NOTHING;
  
  -- Update course enrollment count
  UPDATE public.courses 
  SET total_enrollments = COALESCE(total_enrollments, 0) + 1 
  WHERE id = course_id;
  
  result := json_build_object('success', true, 'message', 'Enrollment successful');
  RETURN result;
EXCEPTION
  WHEN others THEN
    result := json_build_object('success', false, 'message', SQLERRM);
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;