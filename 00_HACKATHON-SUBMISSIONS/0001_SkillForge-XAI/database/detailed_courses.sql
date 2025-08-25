-- Detailed courses with full content
-- Run this in your Supabase SQL editor

-- Clear existing data
DELETE FROM public.lessons;
DELETE FROM public.courses;

-- Insert detailed courses
INSERT INTO public.courses (title, description, instructor_name, category_id, difficulty_level, estimated_duration_hours, rating) VALUES
('Introduction to React', 'Master React.js from fundamentals to advanced concepts. Learn components, hooks, state management, and build real-world applications with modern React patterns.', 'AI Instructor', (SELECT id FROM categories WHERE name = 'Web Development'), 'beginner', 8, 4.8),
('Advanced JavaScript', 'Deep dive into advanced JavaScript concepts including closures, prototypes, async programming, and ES6+ features. Perfect for developers ready to level up.', 'AI Instructor', (SELECT id FROM categories WHERE name = 'Programming'), 'intermediate', 12, 4.7),
('Full Stack Development', 'Build complete web applications from frontend to backend. Learn React, Node.js, databases, authentication, deployment, and modern development practices.', 'AI Instructor', (SELECT id FROM categories WHERE name = 'Web Development'), 'advanced', 20, 4.9);

-- React course lessons with detailed content
INSERT INTO public.lessons (course_id, title, content, duration_minutes, sort_order) VALUES
((SELECT id FROM courses WHERE title = 'Introduction to React'), 
'What is React and Why Use It?', 
'React is a powerful JavaScript library for building user interfaces, developed by Facebook. In this lesson, you will learn:

• What React is and its core philosophy
• The Virtual DOM and how it improves performance  
• Component-based architecture benefits
• React vs other frameworks comparison
• Setting up your first React project
• Understanding JSX syntax and its advantages

By the end of this lesson, you will understand why React has become the most popular frontend library and how it can help you build better web applications.', 
45, 1),

((SELECT id FROM courses WHERE title = 'Introduction to React'), 
'Setting Up Your Development Environment', 
'Learn to set up a professional React development environment from scratch:

• Installing Node.js and npm/yarn
• Using Create React App vs Vite
• Setting up VS Code with React extensions
• Configuring ESLint and Prettier
• Understanding the project structure
• Running your first React application
• Development tools and browser extensions

This lesson ensures you have all the tools needed for efficient React development.', 
30, 2),

((SELECT id FROM courses WHERE title = 'Introduction to React'), 
'Creating Your First React Component', 
'Dive into React components - the building blocks of every React application:

• Understanding functional vs class components
• Writing your first functional component
• JSX syntax and JavaScript expressions
• Component naming conventions
• Importing and exporting components
• Creating reusable UI elements
• Best practices for component structure

Practice creating multiple components and see how they work together to build user interfaces.', 
60, 3),

((SELECT id FROM courses WHERE title = 'Introduction to React'), 
'Understanding Props and State', 
'Master data flow in React applications with props and state:

• What are props and how to pass data
• Props validation with PropTypes
• Understanding component state
• useState Hook fundamentals
• State vs props differences
• Lifting state up pattern
• Controlled vs uncontrolled components
• Managing form inputs with state

Learn to build interactive components that respond to user input and display dynamic data.', 
75, 4),

((SELECT id FROM courses WHERE title = 'Introduction to React'), 
'Handling Events in React', 
'Learn to make your React components interactive with event handling:

• React event system overview
• Synthetic events vs native events
• Common event handlers (onClick, onChange, onSubmit)
• Event object and preventDefault
• Passing parameters to event handlers
• Event delegation in React
• Handling form submissions
• Building interactive UI components

Create engaging user experiences with proper event handling techniques.', 
50, 5);

-- JavaScript course lessons
INSERT INTO public.lessons (course_id, title, content, duration_minutes, sort_order) VALUES
((SELECT id FROM courses WHERE title = 'Advanced JavaScript'), 
'Understanding Closures and Scope', 
'Master one of JavaScript most powerful features - closures:

• Lexical scope and execution context
• What are closures and how they work
• Practical closure examples
• Module pattern with closures
• Memory management and closures
• Common closure pitfalls
• Using closures for data privacy
• Real-world closure applications

Understand how closures enable powerful programming patterns and solve complex problems.', 
55, 1),

((SELECT id FROM courses WHERE title = 'Advanced JavaScript'), 
'Promises and Async Programming', 
'Master asynchronous JavaScript programming:

• Understanding the event loop
• Callbacks and callback hell
• Introduction to Promises
• Promise chaining and error handling
• Async/await syntax
• Error handling with try/catch
• Promise.all, Promise.race, Promise.allSettled
• Building async functions
• Handling API calls effectively

Learn to write clean, maintainable asynchronous code that handles complex operations.', 
70, 2),

((SELECT id FROM courses WHERE title = 'Advanced JavaScript'), 
'ES6+ Features and Modern Syntax', 
'Explore modern JavaScript features that improve code quality:

• Arrow functions and lexical this
• Template literals and string interpolation
• Destructuring assignment
• Spread and rest operators
• Default parameters
• Classes and inheritance
• Modules (import/export)
• Map, Set, and WeakMap
• Symbols and iterators

Update your JavaScript skills with modern syntax that makes code more readable and maintainable.', 
65, 3),

((SELECT id FROM courses WHERE title = 'Advanced JavaScript'), 
'Working with APIs and Fetch', 
'Learn to interact with external APIs and handle HTTP requests:

• Understanding REST APIs
• Fetch API fundamentals
• Making GET, POST, PUT, DELETE requests
• Handling JSON data
• Error handling and status codes
• CORS and security considerations
• Authentication with APIs
• Building a complete API client
• Best practices for API integration

Build applications that communicate with external services and handle real-world data.', 
80, 4);

-- Full Stack course lessons
INSERT INTO public.lessons (course_id, title, content, duration_minutes, sort_order) VALUES
((SELECT id FROM courses WHERE title = 'Full Stack Development'), 
'Full Stack Architecture Overview', 
'Understand the complete web application architecture:

• Frontend vs Backend responsibilities
• Client-server communication
• Database design principles
• API design and RESTful services
• Authentication and authorization
• Deployment and hosting options
• Development workflow and tools
• Choosing the right technology stack

Get a comprehensive overview of how all pieces fit together in modern web development.', 
90, 1),

((SELECT id FROM courses WHERE title = 'Full Stack Development'), 
'Building RESTful APIs with Node.js', 
'Create robust backend APIs using Node.js and Express:

• Setting up Node.js and Express
• Routing and middleware
• Request/response handling
• Database integration
• Error handling and validation
• Authentication with JWT
• API testing with Postman
• Security best practices
• Documentation with Swagger

Build production-ready APIs that power modern web applications.', 
120, 2),

((SELECT id FROM courses WHERE title = 'Full Stack Development'), 
'Database Design and Integration', 
'Master database design and integration:

• Relational vs NoSQL databases
• Database schema design
• SQL fundamentals and advanced queries
• ORM vs raw SQL
• Database migrations
• Connection pooling
• Performance optimization
• Backup and recovery strategies

Learn to design and implement efficient database solutions for your applications.', 
100, 3);