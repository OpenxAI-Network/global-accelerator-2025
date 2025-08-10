-- SkillForge-XAI Seed Data
-- Realistic course content and data for production

-- Insert Categories
INSERT INTO public.categories (id, name, description, icon, color, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Programming', 'Learn programming languages and software development', '💻', '#3B82F6', 1),
('550e8400-e29b-41d4-a716-446655440002', 'Data Science', 'Master data analysis, machine learning, and AI', '📊', '#10B981', 2),
('550e8400-e29b-41d4-a716-446655440003', 'Web Development', 'Build modern web applications and websites', '🌐', '#8B5CF6', 3),
('550e8400-e29b-41d4-a716-446655440004', 'Mobile Development', 'Create mobile apps for iOS and Android', '📱', '#F59E0B', 4),
('550e8400-e29b-41d4-a716-446655440005', 'DevOps & Cloud', 'Learn cloud computing and deployment strategies', '☁️', '#EF4444', 5),
('550e8400-e29b-41d4-a716-446655440006', 'Cybersecurity', 'Protect systems and learn ethical hacking', '🔒', '#6366F1', 6),
('550e8400-e29b-41d4-a716-446655440007', 'AI & Machine Learning', 'Artificial Intelligence and ML algorithms', '🤖', '#EC4899', 7),
('550e8400-e29b-41d4-a716-446655440008', 'Business & Marketing', 'Digital marketing and business strategies', '📈', '#14B8A6', 8);

-- Insert Comprehensive Courses
INSERT INTO public.courses (id, title, description, short_description, category_id, instructor_name, instructor_bio, instructor_avatar, difficulty_level, estimated_duration_hours, thumbnail_url, banner_url, price, is_free, is_published, prerequisites, learning_objectives, tags, rating, total_ratings, total_enrollments) VALUES

-- Programming Courses
('650e8400-e29b-41d4-a716-446655440001', 
'Complete Python Programming Masterclass', 
'Master Python programming from basics to advanced concepts including web development, data science, and automation. This comprehensive course covers everything you need to become a proficient Python developer with hands-on projects and real-world applications.',
'Learn Python from zero to hero with practical projects',
'550e8400-e29b-41d4-a716-446655440001',
'Dr. Sarah Chen',
'Senior Software Engineer at Google with 10+ years of Python experience. PhD in Computer Science from Stanford University.',
'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
'beginner',
45,
'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop',
'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=400&fit=crop',
99.99,
false,
true,
ARRAY['Basic computer skills', 'No programming experience required'],
ARRAY['Master Python syntax and fundamentals', 'Build web applications with Flask/Django', 'Create data analysis scripts', 'Automate repetitive tasks', 'Understand object-oriented programming'],
ARRAY['python', 'programming', 'web-development', 'automation', 'beginner-friendly'],
4.8,
2847,
15420),

('650e8400-e29b-41d4-a716-446655440002',
'JavaScript & React.js Full Stack Development',
'Build modern web applications using JavaScript, React.js, Node.js, and MongoDB. Learn the complete full-stack development process from frontend to backend with industry best practices.',
'Complete full-stack JavaScript development course',
'550e8400-e29b-41d4-a716-446655440003',
'Michael Rodriguez',
'Full Stack Developer at Meta, React.js contributor with 8 years of experience in modern web development.',
'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
'intermediate',
60,
'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
129.99,
false,
true,
ARRAY['Basic HTML/CSS knowledge', 'Understanding of programming concepts'],
ARRAY['Master modern JavaScript ES6+', 'Build responsive React applications', 'Create RESTful APIs with Node.js', 'Implement authentication and authorization', 'Deploy applications to production'],
ARRAY['javascript', 'react', 'nodejs', 'mongodb', 'fullstack'],
4.9,
3521,
18750),

-- Data Science Courses
('650e8400-e29b-41d4-a716-446655440003',
'Data Science with Python and Machine Learning',
'Comprehensive data science course covering Python, pandas, NumPy, scikit-learn, and TensorFlow. Learn to analyze data, build predictive models, and create data visualizations.',
'Complete data science and machine learning bootcamp',
'550e8400-e29b-41d4-a716-446655440002',
'Dr. Emily Watson',
'Data Science Lead at Netflix, former researcher at MIT with expertise in machine learning and statistical analysis.',
'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
'intermediate',
75,
'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
149.99,
false,
true,
ARRAY['Basic Python knowledge', 'High school mathematics'],
ARRAY['Master data manipulation with pandas', 'Create stunning visualizations', 'Build machine learning models', 'Perform statistical analysis', 'Deploy ML models to production'],
ARRAY['data-science', 'python', 'machine-learning', 'pandas', 'tensorflow'],
4.7,
2156,
12890),

-- AI & Machine Learning
('650e8400-e29b-41d4-a716-446655440004',
'Artificial Intelligence and Deep Learning Specialization',
'Advanced AI course covering neural networks, deep learning, computer vision, and natural language processing. Build AI applications using TensorFlow and PyTorch.',
'Master AI and deep learning with hands-on projects',
'550e8400-e29b-41d4-a716-446655440007',
'Prof. David Kim',
'AI Research Director at OpenAI, former professor at Carnegie Mellon University with 15+ years in AI research.',
'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
'advanced',
90,
'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
199.99,
false,
true,
ARRAY['Strong Python skills', 'Linear algebra knowledge', 'Calculus understanding'],
ARRAY['Understand neural network architectures', 'Build computer vision applications', 'Create NLP models', 'Implement reinforcement learning', 'Deploy AI models at scale'],
ARRAY['artificial-intelligence', 'deep-learning', 'tensorflow', 'pytorch', 'computer-vision'],
4.9,
1876,
8945),

-- Web Development
('650e8400-e29b-41d4-a716-446655440005',
'Modern Frontend Development with Next.js',
'Learn cutting-edge frontend development with Next.js, TypeScript, Tailwind CSS, and modern deployment strategies. Build production-ready applications.',
'Master modern frontend development with Next.js',
'550e8400-e29b-41d4-a716-446655440003',
'Alex Thompson',
'Senior Frontend Engineer at Vercel, Next.js core contributor and expert in modern web technologies.',
'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
'intermediate',
40,
'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop',
'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop',
89.99,
false,
true,
ARRAY['React.js knowledge', 'JavaScript proficiency'],
ARRAY['Master Next.js framework', 'Implement server-side rendering', 'Build responsive designs with Tailwind', 'Optimize for performance', 'Deploy to production'],
ARRAY['nextjs', 'typescript', 'tailwind', 'frontend', 'react'],
4.8,
1654,
9876),

-- Mobile Development
('650e8400-e29b-41d4-a716-446655440006',
'React Native Mobile App Development',
'Build cross-platform mobile applications using React Native. Learn to create iOS and Android apps with a single codebase.',
'Create mobile apps with React Native',
'550e8400-e29b-41d4-a716-446655440004',
'Jessica Park',
'Mobile Development Lead at Airbnb, expert in React Native with 6+ years of mobile app development experience.',
'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
'intermediate',
50,
'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop',
119.99,
false,
true,
ARRAY['React.js knowledge', 'JavaScript proficiency', 'Mobile development interest'],
ARRAY['Build cross-platform mobile apps', 'Implement native device features', 'Handle app state management', 'Publish to app stores', 'Optimize app performance'],
ARRAY['react-native', 'mobile', 'ios', 'android', 'cross-platform'],
4.6,
987,
5432),

-- Free Courses
('650e8400-e29b-41d4-a716-446655440007',
'Introduction to Programming Concepts',
'Learn fundamental programming concepts that apply to any programming language. Perfect for absolute beginners starting their coding journey.',
'Free introduction to programming fundamentals',
'550e8400-e29b-41d4-a716-446655440001',
'Robert Johnson',
'Computer Science Professor at UC Berkeley with 20+ years of teaching experience in programming fundamentals.',
'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
'beginner',
20,
'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop',
'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=400&fit=crop',
0.00,
true,
true,
ARRAY['No prerequisites required'],
ARRAY['Understand programming logic', 'Learn problem-solving techniques', 'Master basic algorithms', 'Choose your first programming language'],
ARRAY['programming', 'beginner', 'fundamentals', 'logic', 'free'],
4.5,
5432,
25678),

('650e8400-e29b-41d4-a716-446655440008',
'HTML & CSS Fundamentals',
'Master the building blocks of web development with HTML and CSS. Create beautiful, responsive websites from scratch.',
'Free HTML & CSS course for beginners',
'550e8400-e29b-41d4-a716-446655440003',
'Maria Garcia',
'Frontend Developer at Adobe with expertise in web standards and responsive design.',
'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
'beginner',
25,
'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=400&h=300&fit=crop',
'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&h=400&fit=crop',
0.00,
true,
true,
ARRAY['Basic computer skills'],
ARRAY['Create semantic HTML structure', 'Style with modern CSS', 'Build responsive layouts', 'Understand web accessibility', 'Deploy websites online'],
ARRAY['html', 'css', 'web-development', 'responsive', 'free'],
4.4,
8765,
45321);

-- Insert Achievements
INSERT INTO public.achievements (id, name, description, icon, badge_color, rarity, points_reward, criteria) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'First Steps', 'Complete your first lesson', '🎯', '#10B981', 'common', 10, '{"lessons_completed": 1}'),
('750e8400-e29b-41d4-a716-446655440002', 'Quick Learner', 'Complete 5 lessons in one day', '⚡', '#F59E0B', 'uncommon', 25, '{"lessons_per_day": 5}'),
('750e8400-e29b-41d4-a716-446655440003', 'Quiz Master', 'Score 100% on 3 quizzes', '🏆', '#EF4444', 'rare', 50, '{"perfect_quizzes": 3}'),
('750e8400-e29b-41d4-a716-446655440004', 'Streak Champion', 'Maintain a 7-day learning streak', '🔥', '#8B5CF6', 'rare', 75, '{"streak_days": 7}'),
('750e8400-e29b-41d4-a716-446655440005', 'Course Conqueror', 'Complete your first course', '🎓', '#3B82F6', 'uncommon', 100, '{"courses_completed": 1}'),
('750e8400-e29b-41d4-a716-446655440006', 'Knowledge Seeker', 'Complete 10 courses', '📚', '#EC4899', 'epic', 500, '{"courses_completed": 10}'),
('750e8400-e29b-41d4-a716-446655440007', 'AI Whisperer', 'Have 50 AI chat conversations', '🤖', '#6366F1', 'rare', 150, '{"ai_conversations": 50}'),
('750e8400-e29b-41d4-a716-446655440008', 'Night Owl', 'Study for 2 hours after 10 PM', '🦉', '#374151', 'uncommon', 30, '{"late_night_hours": 2}'),
('750e8400-e29b-41d4-a716-446655440009', 'Early Bird', 'Study for 1 hour before 7 AM', '🌅', '#F59E0B', 'uncommon', 30, '{"early_morning_hours": 1}'),
('750e8400-e29b-41d4-a716-446655440010', 'Marathon Learner', 'Study for 8 hours in one day', '🏃', '#EF4444', 'epic', 200, '{"daily_hours": 8}');

-- Insert sample lessons for the first course (Python Programming)
INSERT INTO public.lessons (id, course_id, title, description, content, lesson_type, duration_minutes, sort_order, is_preview, key_concepts) VALUES
('850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 
'Introduction to Python', 
'Welcome to Python programming! Learn what Python is and why it''s so popular.',
'# Introduction to Python

Python is a high-level, interpreted programming language known for its simplicity and readability. Created by Guido van Rossum in 1991, Python has become one of the most popular programming languages in the world.

## Why Learn Python?

1. **Easy to Learn**: Python''s syntax is clean and intuitive
2. **Versatile**: Used in web development, data science, AI, automation
3. **Large Community**: Extensive libraries and community support
4. **High Demand**: Top skill in job market

## Python Applications

- **Web Development**: Django, Flask
- **Data Science**: pandas, NumPy, matplotlib
- **Machine Learning**: scikit-learn, TensorFlow
- **Automation**: Scripting and task automation
- **Game Development**: Pygame

## Your First Python Program

```python
print("Hello, World!")
print("Welcome to Python programming!")
```

This simple program demonstrates Python''s readable syntax. The `print()` function displays text on the screen.

## Setting Up Python

1. Download Python from python.org
2. Install Python on your system
3. Verify installation: `python --version`
4. Choose a code editor (VS Code, PyCharm, etc.)

Ready to start your Python journey? Let''s dive in!',
'text', 15, 1, true, 
ARRAY['Python basics', 'Programming introduction', 'Setup and installation']),

('850e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001',
'Variables and Data Types',
'Learn about Python variables and the different types of data you can work with.',
'# Variables and Data Types

Variables are containers that store data values. In Python, you don''t need to declare variable types explicitly.

## Creating Variables

```python
# String variable
name = "Alice"
message = ''Hello, World!''

# Integer variable
age = 25
score = 100

# Float variable
height = 5.8
price = 19.99

# Boolean variable
is_student = True
is_working = False
```

## Data Types

### 1. Strings (str)
Text data enclosed in quotes:
```python
first_name = "John"
last_name = ''Doe''
full_name = first_name + " " + last_name
```

### 2. Integers (int)
Whole numbers:
```python
count = 42
year = 2024
negative = -10
```

### 3. Floats (float)
Decimal numbers:
```python
pi = 3.14159
temperature = 98.6
```

### 4. Booleans (bool)
True or False values:
```python
is_sunny = True
is_raining = False
```

## Variable Naming Rules

1. Must start with letter or underscore
2. Can contain letters, numbers, underscores
3. Case-sensitive (age ≠ Age)
4. Cannot use Python keywords

```python
# Good variable names
user_name = "Alice"
total_score = 95
is_valid = True

# Bad variable names (avoid these)
2name = "Bob"  # Starts with number
class = "Math"  # Python keyword
```

## Checking Data Types

```python
name = "Alice"
age = 25

print(type(name))  # <class ''str''>
print(type(age))   # <class ''int''>
```

Practice creating variables with different data types!',
'text', 20, 2, false,
ARRAY['Variables', 'Data types', 'String', 'Integer', 'Float', 'Boolean']),

('850e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001',
'Basic Operations and Expressions',
'Master arithmetic operations, string manipulation, and basic expressions in Python.',
'# Basic Operations and Expressions

Learn how to perform calculations and manipulate data using Python operators.

## Arithmetic Operators

```python
# Basic arithmetic
a = 10
b = 3

addition = a + b        # 13
subtraction = a - b     # 7
multiplication = a * b  # 30
division = a / b        # 3.333...
floor_division = a // b # 3
modulus = a % b         # 1
exponentiation = a ** b # 1000
```

## String Operations

```python
# String concatenation
first_name = "John"
last_name = "Doe"
full_name = first_name + " " + last_name

# String repetition
laugh = "Ha" * 3  # "HaHaHa"

# String methods
message = "hello world"
print(message.upper())      # HELLO WORLD
print(message.capitalize()) # Hello world
print(message.title())      # Hello World
```

## Comparison Operators

```python
x = 5
y = 10

print(x == y)  # False (equal to)
print(x != y)  # True (not equal to)
print(x < y)   # True (less than)
print(x > y)   # False (greater than)
print(x <= y)  # True (less than or equal)
print(x >= y)  # False (greater than or equal)
```

## Logical Operators

```python
age = 25
has_license = True

# AND operator
can_drive = age >= 18 and has_license

# OR operator
is_weekend = day == "Saturday" or day == "Sunday"

# NOT operator
is_not_minor = not (age < 18)
```

## Assignment Operators

```python
score = 100

# Compound assignment
score += 10  # score = score + 10 (110)
score -= 5   # score = score - 5 (105)
score *= 2   # score = score * 2 (210)
score /= 3   # score = score / 3 (70.0)
```

## Practical Examples

```python
# Calculate area of rectangle
length = 10
width = 5
area = length * width
print(f"Area: {area} square units")

# Temperature conversion
celsius = 25
fahrenheit = (celsius * 9/5) + 32
print(f"{celsius}°C = {fahrenheit}°F")

# String formatting
name = "Alice"
age = 30
print(f"My name is {name} and I am {age} years old")
```

Practice these operations to build your Python foundation!',
'text', 25, 3, false,
ARRAY['Arithmetic operators', 'String operations', 'Comparison operators', 'Logical operators', 'Expressions']);

-- Insert quizzes for the Python course
INSERT INTO public.quizzes (id, course_id, title, description, quiz_type, time_limit_minutes, passing_score, max_attempts) VALUES
('950e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001',
'Python Basics Quiz',
'Test your understanding of Python fundamentals, variables, and data types.',
'practice', 15, 70, 3),

('950e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001',
'Operations and Expressions Quiz',
'Evaluate your knowledge of Python operators and expressions.',
'practice', 20, 70, 3);

-- Insert quiz questions
INSERT INTO public.quiz_questions (id, quiz_id, question_text, question_type, options, correct_answer, explanation, points, sort_order) VALUES
-- Python Basics Quiz Questions
('a50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001',
'Which of the following is the correct way to create a variable in Python?',
'multiple_choice',
'["x = 5", "var x = 5", "int x = 5", "declare x = 5"]',
'x = 5',
'In Python, you simply assign a value to a variable name without declaring its type.',
1, 1),

('a50e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440001',
'What data type is the value 3.14?',
'multiple_choice',
'["int", "float", "string", "boolean"]',
'float',
'3.14 is a decimal number, which is represented as a float data type in Python.',
1, 2),

('a50e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440001',
'Python is case-sensitive when it comes to variable names.',
'true_false',
'["True", "False"]',
'True',
'Python treats "age" and "Age" as different variables because it is case-sensitive.',
1, 3),

-- Operations Quiz Questions
('a50e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440002',
'What is the result of 10 // 3 in Python?',
'multiple_choice',
'["3.33", "3", "4", "3.0"]',
'3',
'The // operator performs floor division, returning the integer part of the division.',
1, 1),

('a50e8400-e29b-41d4-a716-446655440005', '950e8400-e29b-41d4-a716-446655440002',
'Which operator is used for string concatenation in Python?',
'multiple_choice',
'["+", "&", ".", "concat()"]',
'+',
'The + operator is used to concatenate (join) strings in Python.',
1, 2);