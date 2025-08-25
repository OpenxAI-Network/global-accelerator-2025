-- Add sample courses for testing
-- Run this in your Supabase SQL editor

-- Insert sample courses
INSERT INTO public.courses (title, description, instructor_name, category_id, difficulty_level, estimated_duration_hours, rating) VALUES
('Introduction to React', 'Learn the fundamentals of React.js and build modern web applications with hooks, components, and state management.', 'AI Instructor', (SELECT id FROM categories WHERE name = 'Web Development'), 'beginner', 8, 4.8),
('Advanced JavaScript', 'Master advanced JavaScript concepts including closures, promises, async/await, and ES6+ features.', 'AI Instructor', (SELECT id FROM categories WHERE name = 'Programming'), 'intermediate', 12, 4.7),
('Full Stack Development', 'Build complete web applications from frontend to backend using modern technologies.', 'AI Instructor', (SELECT id FROM categories WHERE name = 'Web Development'), 'advanced', 20, 4.9);

-- Insert sample lessons for React course
INSERT INTO public.lessons (course_id, title, duration_minutes, sort_order) VALUES
((SELECT id FROM courses WHERE title = 'Introduction to React'), 'What is React and Why Use It?', 45, 1),
((SELECT id FROM courses WHERE title = 'Introduction to React'), 'Setting Up Your Development Environment', 30, 2),
((SELECT id FROM courses WHERE title = 'Introduction to React'), 'Creating Your First React Component', 60, 3),
((SELECT id FROM courses WHERE title = 'Introduction to React'), 'Understanding Props and State', 75, 4),
((SELECT id FROM courses WHERE title = 'Introduction to React'), 'Handling Events in React', 50, 5);

-- Insert lessons for JavaScript course
INSERT INTO public.lessons (course_id, title, duration_minutes, sort_order) VALUES
((SELECT id FROM courses WHERE title = 'Advanced JavaScript'), 'Understanding Closures and Scope', 55, 1),
((SELECT id FROM courses WHERE title = 'Advanced JavaScript'), 'Promises and Async Programming', 70, 2),
((SELECT id FROM courses WHERE title = 'Advanced JavaScript'), 'ES6+ Features and Modern Syntax', 65, 3),
((SELECT id FROM courses WHERE title = 'Advanced JavaScript'), 'Working with APIs and Fetch', 80, 4);