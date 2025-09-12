-- Edvance AI Discussion Forum Database Schema and Seed Data
-- This file creates the complete database schema and populates it with all current data

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS class_enrollments CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('STUDENT', 'TEACHER')),
    "isDemo" BOOLEAN DEFAULT false,
    "profilePicture" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Classes table
CREATE TABLE classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    "teacherId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    semester TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Class Enrollments table
CREATE TABLE class_enrollments (
    id TEXT PRIMARY KEY,
    "classId" TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("classId", "userId")
);

-- Create Questions table
CREATE TABLE questions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    "classId" TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    "authorId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Answers table
CREATE TABLE answers (
    id TEXT PRIMARY KEY,
    "questionId" TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    "authorId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Votes table
CREATE TABLE votes (
    id TEXT PRIMARY KEY,
    "questionId" TEXT REFERENCES questions(id) ON DELETE CASCADE,
    "answerId" TEXT REFERENCES answers(id) ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('UP', 'DOWN')),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("questionId", "userId"),
    UNIQUE("answerId", "userId")
);

-- Create indexes for better performance
CREATE INDEX idx_questions_class_id ON questions("classId");
CREATE INDEX idx_questions_author_id ON questions("authorId");
CREATE INDEX idx_questions_created_at ON questions("createdAt");
CREATE INDEX idx_answers_question_id ON answers("questionId");
CREATE INDEX idx_answers_author_id ON answers("authorId");
CREATE INDEX idx_class_enrollments_class_id ON class_enrollments("classId");
CREATE INDEX idx_class_enrollments_user_id ON class_enrollments("userId");
CREATE INDEX idx_votes_question_id ON votes("questionId");
CREATE INDEX idx_votes_answer_id ON votes("answerId");
CREATE INDEX idx_votes_user_id ON votes("userId");
-- Edvance AI Discussion Forum - Database Seed Data
-- This file contains all the current data from the database for seeding new installations

-- Clear existing data (in case of re-seeding)
TRUNCATE TABLE votes, answers, questions, class_enrollments, classes, users RESTART IDENTITY CASCADE;

-- Insert Users
INSERT INTO users (id, name, email, password, role, "isDemo", "profilePicture", "createdAt", "updatedAt") VALUES
('cmf40gkpx0000ope2d8jf24z4', 'Alice Student', 'student@university.edu', 'Alice102!', 'STUDENT', true, null, '2025-09-03 13:26:23.205', '2025-09-03 13:26:23.205'),
('cmf40gkq70001ope2uuban6jq', 'Dr. Sarah Chen', 'teacher@university.edu', 'Chen102!', 'TEACHER', true, null, '2025-09-03 13:26:23.215', '2025-09-03 13:26:23.215'),
('cmf40gkqa0002ope2zz1j4moq', 'Prof. Michael Rodriguez', 'prof.rodriguez@university.edu', 'password123', 'TEACHER', false, null, '2025-09-03 13:26:23.218', '2025-09-03 13:26:23.218'),
('cmf40gkqd0003ope281mgbwam', 'Dr. Emily Watson', 'dr.watson@university.edu', 'password123', 'TEACHER', false, null, '2025-09-03 13:26:23.222', '2025-09-03 13:26:23.222'),
('cmf40gkqh0004ope2808dyljr', 'Prof. David Kim', 'prof.kim@university.edu', 'password123', 'TEACHER', false, null, '2025-09-03 13:26:23.225', '2025-09-03 13:26:23.225'),
('cmf6b4lx80000lye04viqzk5c', 'Demo Teacher', 'demo.teacher@edvance.edu', 'Chen102!', 'TEACHER', true, null, '2025-09-05 04:00:33.02', '2025-09-05 04:00:33.02'),
('cmf6brkw0000ip3g25rpaqm71', 'Geebs Nunii', 'gnunii@university.edu', 'password123', 'STUDENT', false, null, '2025-09-05 04:18:24.768', '2025-09-05 04:18:24.768'),
('cmf6cbmpa000vp3g2x6v4aeu0', 'Jane Smith', 'jane.smith@education.edu.au', 'password123', 'STUDENT', false, null, '2025-09-05 04:34:00.239', '2025-09-05 04:34:00.239'),
('cmf6cke310014p3g2ifchkuo5', 'John Doe', 'john.doe@university.edu.au', 'password123', 'STUDENT', false, null, '2025-09-05 04:40:48.974', '2025-09-05 04:40:48.974'),
('cmf6com830015p3g2pnb066yl', 'Henry Doe', 'henry.doe@university.edu.au', 'password123', 'STUDENT', false, null, '2025-09-05 04:44:06.147', '2025-09-05 04:44:06.147'),
('cmf6cpa1t0016p3g2uwbeeqbv', 'Henry Li', 'henry.li@university.edu.au', 'password123', 'STUDENT', false, null, '2025-09-05 04:44:37.025', '2025-09-05 04:44:37.025'),
('cmf6cpodq0017p3g2pi2wual3', 'ddd', 'dddd@dddd', 'password123', 'STUDENT', false, null, '2025-09-05 04:44:55.598', '2025-09-05 04:44:55.598'),
('cmf6cs92y0018p3g243xkokqk', 'henry wang', 'henry.wang@university.edu.au', 'password123', 'STUDENT', false, null, '2025-09-05 04:46:55.738', '2025-09-05 04:46:55.738');

-- Insert Classes
INSERT INTO classes (id, name, code, description, "teacherId", semester, "createdAt", "updatedAt") VALUES
('cmf40gkqj0006ope2fuvn2hhq', 'Derivative Securities', 'FINC3012', 'Advanced study of derivative instruments and their applications in financial markets.', 'cmf40gkq70001ope2uuban6jq', 'Semester 1, 2024', '2025-09-03 13:26:23.228', '2025-09-03 13:26:23.228'),
('cmf40gkqp0008ope2gptjjid3', 'Engineering Analysis', 'AMME2000', 'Mathematical and computational methods for engineering problem solving.', 'cmf40gkqa0002ope2zz1j4moq', 'Semester 1, 2024', '2025-09-03 13:26:23.233', '2025-09-03 13:26:23.233'),
('cmf40gkqr000aope2vkabk5fz', 'Future of Business', 'BUSS1000', 'Exploring emerging business trends and digital transformation strategies.', 'cmf40gkqd0003ope281mgbwam', 'Semester 1, 2024', '2025-09-03 13:26:23.236', '2025-09-03 13:26:23.236'),
('cmf40gkqu000cope2b4dfqpe1', 'Introduction to Engineering Computing', 'ENGG1810', 'Fundamentals of programming and computational thinking for engineers.', 'cmf40gkqh0004ope2808dyljr', 'Semester 1, 2024', '2025-09-03 13:26:23.238', '2025-09-03 13:26:23.238'),
('cmf6bkqai0005p3g2mdq13omx', 'Investment and Portfolio Management', 'FINC3017', 'This unit is designed to provide a comprehensive analytical approach to the modern theory of investments. Topics covered include: mean-variance analysis; Markowitz type portfolio analysis; portfolio construction; asset pricing theories; market efficiency and anomalies; hedge funds and investment fund performance evaluation. Although analytical aspects of investments theory are stressed, there is also an equal amount of coverage on the practical aspects of portfolio management. Current research on investments is emphasised in the course.', 'cmf40gkq70001ope2uuban6jq', 'Semester 2, 2025', '2025-09-05 04:13:05.177', '2025-09-05 04:13:05.177');

-- Insert Class Enrollments
INSERT INTO class_enrollments (id, "classId", "userId", "enrolledAt") VALUES
('cmf40gkqx000eope272xsyio1', 'cmf40gkqj0006ope2fuvn2hhq', 'cmf40gkpx0000ope2d8jf24z4', '2025-09-03 13:26:23.241'),
('cmf40gkr1000gope2046eubzd', 'cmf40gkqp0008ope2gptjjid3', 'cmf40gkpx0000ope2d8jf24z4', '2025-09-03 13:26:23.245'),
('cmf40gkr3000iope25gn4g9l7', 'cmf40gkqr000aope2vkabk5fz', 'cmf40gkpx0000ope2d8jf24z4', '2025-09-03 13:26:23.248'),
('cmf40gkr5000kope2bgcu6fcz', 'cmf40gkqu000cope2b4dfqpe1', 'cmf40gkpx0000ope2d8jf24z4', '2025-09-03 13:26:23.25'),
('cmf6blt5h000bp3g2hdnl4dq6', 'cmf6bkqai0005p3g2mdq13omx', 'cmf40gkpx0000ope2d8jf24z4', '2025-09-05 04:13:55.541'),
('cmf6brpmm000kp3g2vitc1rw5', 'cmf6bkqai0005p3g2mdq13omx', 'cmf6brkw0000ip3g25rpaqm71', '2025-09-05 04:18:30.91'),
('cmf6brua5000mp3g2pbtvcooh', 'cmf40gkqj0006ope2fuvn2hhq', 'cmf6brkw0000ip3g25rpaqm71', '2025-09-05 04:18:36.942');

-- Insert Questions
INSERT INTO questions (id, title, content, tags, "classId", "authorId", "createdAt", "updatedAt") VALUES
('cmf40gkr7000mope2mk2ocrzl', 'Understanding recursion', 'Can someone explain how recursion works in programming? I understand the concept but struggle with implementing it.', '["recursion","programming","help"]', 'cmf40gkqu000cope2b4dfqpe1', 'cmf40gkpx0000ope2d8jf24z4', '2025-09-03 13:26:23.252', '2025-09-03 13:26:23.252'),
('cmf40gkra000qope21f8uffi4', 'Assignment 1 word count', 'What is the word limit for Assignment 1?', '["assignment","word-count"]', 'cmf40gkqj0006ope2fuvn2hhq', 'cmf40gkpx0000ope2d8jf24z4', '2025-09-03 13:26:23.255', '2025-09-03 13:26:23.255'),
('cmf421yr6000m2eez1hx2hfjg', 'Understanding recursion', 'Can someone explain how recursion works in programming? I understand the concept but struggle with implementing it.', '["recursion","programming","help"]', 'cmf40gkqu000cope2b4dfqpe1', 'cmf40gkpx0000ope2d8jf24z4', '2025-09-03 14:11:00.786', '2025-09-03 14:11:00.786'),
('cmf421yrj000q2eezpgjpxsld', 'Assignment 1 word count', 'What is the word limit for Assignment 1?', '["assignment","word-count"]', 'cmf40gkqj0006ope2fuvn2hhq', 'cmf40gkpx0000ope2d8jf24z4', '2025-09-03 14:11:00.8', '2025-09-03 14:11:00.8'),
('cmf423gl3000msh2zmz7yjfo7', 'Understanding recursion', 'Can someone explain how recursion works in programming? I understand the concept but struggle with implementing it.', '["recursion","programming","help"]', 'cmf40gkqu000cope2b4dfqpe1', 'cmf40gkpx0000ope2d8jf24z4', '2025-09-03 14:12:10.552', '2025-09-03 14:12:10.552'),
('cmf423gle000qsh2zkxh9sjez', 'Assignment 1 word count', 'What is the word limit for Assignment 1?', '["assignment","word-count"]', 'cmf40gkqj0006ope2fuvn2hhq', 'cmf40gkpx0000ope2d8jf24z4', '2025-09-03 14:12:10.562', '2025-09-03 14:12:10.562'),
('cmf428ouj0001e51vvo8l5z9o', 'Futures and Forwards', '<p>What is the difference between futures and forward contracts? </p>', '[]', 'cmf40gkqj0006ope2fuvn2hhq', 'cmf40gkpx0000ope2d8jf24z4', '2025-09-03 14:16:14.538', '2025-09-03 14:16:14.538'),
('cmf6bnequ000dp3g29csvuniw', 'Matrix Algebra', '<p>In lecture 1 the professor mentioned we needed to know basic matrix algebra rules. Can someone please summarise them? </p>', '["lecture-1"]', 'cmf6bkqai0005p3g2mdq13omx', 'cmf40gkpx0000ope2d8jf24z4', '2025-09-05 04:15:10.181', '2025-09-05 04:15:10.181'),
('cmf6bpeng000hp3g2kyglphjx', 'Efficient Portfolios', '<p>When looking at the risk vs return plot, what is the difference between efficient and inefficient portfolios? </p>', '["lecture-3"]', 'cmf6bkqai0005p3g2mdq13omx', 'cmf40gkpx0000ope2d8jf24z4', '2025-09-05 04:16:43.369', '2025-09-05 04:16:43.369'),
('cmf6bttin000sp3g2cany3k7u', 'Different Risk in CAPM', '<p>Could someone clarify the difference between systematic vs. unsystematic risk in the CAPM context?</p><p></p>', '["lecture-4"]', 'cmf6bkqai0005p3g2mdq13omx', 'cmf6brkw0000ip3g25rpaqm71', '2025-09-05 04:20:09.263', '2025-09-05 04:20:09.263'),
('cmf6cc8vd000xp3g2me9p5km8', 'forward price and the futures price when interest rates are stochastic', '<p>What''s the exact difference between the forward price and the futures price when interest rates are stochastic?</p>', '[]', 'cmf40gkqj0006ope2fuvn2hhq', 'cmf6cbmpa000vp3g2x6v4aeu0', '2025-09-05 04:34:28.966', '2025-09-05 04:34:28.966'),
('cmf6ccoh6000zp3g2x6wchylo', 'cost-of-carry model', '<ul><li><p>In the cost-of-carry model, how do we treat dividends or storage costs for equity index vs. commodity futures?</p></li></ul><p></p>', '[]', 'cmf40gkqj0006ope2fuvn2hhq', 'cmf6cbmpa000vp3g2x6v4aeu0', '2025-09-05 04:34:49.194', '2025-09-05 04:34:49.194'),
('cmf6cd8av0011p3g2r5yv80h7', 'futures and forwards', '<ul><li><p>Why do futures contracts require daily marking-to-market while forwards don''t?</p></li></ul><p></p>', '[]', 'cmf40gkqj0006ope2fuvn2hhq', 'cmf6cbmpa000vp3g2x6v4aeu0', '2025-09-05 04:35:14.888', '2025-09-05 04:35:14.888'),
('cmf6cegfw0013p3g2ierf2w31', 'tutorial 1, question 6', '<p>How do I correctly draw the payoff diagram for a covered call or protective put for tutorial 1, question 6.</p>', '[]', 'cmf40gkqj0006ope2fuvn2hhq', 'cmf6cbmpa000vp3g2x6v4aeu0', '2025-09-05 04:36:12.091', '2025-09-05 04:36:12.091'),
('cmf6cwif5001ap3g266cuxpq5', 'How do I declare and use arrays in MATLAB for storing multiple sensor readings?', '<p>How do I declare and use arrays in MATLAB for storing multiple sensor readings?</p>', '[]', 'cmf40gkqu000cope2b4dfqpe1', 'cmf6cs92y0018p3g243xkokqk', '2025-09-05 04:50:14.465', '2025-09-05 04:50:14.465'),
('cmf6cwshn001cp3g2v7ymxwwb', 'What''s the difference between a for loop and a while loop in terms of when to use them?', '<p>What''s the difference between a for loop and a while loop in terms of when to use them?</p>', '[]', 'cmf40gkqu000cope2b4dfqpe1', 'cmf6cs92y0018p3g243xkokqk', '2025-09-05 04:50:27.515', '2025-09-05 04:50:27.515'),
('cmf6cx6v3001ep3g2mu26mmey', 'How do we set up and solve a second-order ODE with non-homogeneous boundary conditions?', '<p>How do we set up and solve a second-order ODE with non-homogeneous boundary conditions?</p>', '[]', 'cmf40gkqp0008ope2gptjjid3', 'cmf6cs92y0018p3g243xkokqk', '2025-09-05 04:50:46.143', '2025-09-05 04:50:46.143'),
('cmf6cxe92001gp3g28c4fl1m6', 'What''s the difference between separation of variables and the method of eigenfunction expansion?', '<p>What''s the difference between separation of variables and the method of eigenfunction expansion?</p>', '[]', 'cmf40gkqp0008ope2gptjjid3', 'cmf6cs92y0018p3g243xkokqk', '2025-09-05 04:50:55.718', '2025-09-05 04:50:55.718');

-- Insert Answers
INSERT INTO answers (id, "questionId", content, "authorId", "createdAt", "updatedAt") VALUES
('cmf40gkr9000oope2zuwykpf4', 'cmf40gkr7000mope2mk2ocrzl', 'Recursion is when a function calls itself. You need a base case to stop and a recursive case that solves a smaller version of the problem. Think of it like Russian dolls - each one contains a smaller version. For example: factorial(n) = n * factorial(n-1) with base case factorial(0) = 1.', 'cmf40gkqh0004ope2808dyljr', '2025-09-03 13:26:23.253', '2025-09-03 13:26:23.253'),
('cmf421yrh000o2eez5l9svbqg', 'cmf421yr6000m2eez1hx2hfjg', 'Recursion is when a function calls itself. You need a base case to stop and a recursive case that solves a smaller version of the problem. Think of it like Russian dolls - each one contains a smaller version. For example: factorial(n) = n * factorial(n-1) with base case factorial(0) = 1.', 'cmf40gkqh0004ope2808dyljr', '2025-09-03 14:11:00.798', '2025-09-03 14:11:00.798'),
('cmf423glc000osh2z43g266pk', 'cmf423gl3000msh2zmz7yjfo7', 'Recursion is when a function calls itself. You need a base case to stop and a recursive case that solves a smaller version of the problem. Think of it like Russian dolls - each one contains a smaller version. For example: factorial(n) = n * factorial(n-1) with base case factorial(0) = 1.', 'cmf40gkqh0004ope2808dyljr', '2025-09-03 14:12:10.56', '2025-09-03 14:12:10.56'),
('cmf6bss4d000op3g2kx6djvv3', 'cmf6bnequ000dp3g29csvuniw', '<p><strong>Basic Operations</strong></p><ul><li><p><strong>Addition</strong>: A+BA + BA+B only if same dimensions. Element-wise.</p></li><li><p><strong>Scalar Multiplication</strong>: cAcAcA, multiply each element by ccc.</p></li><li><p><strong>Matrix Multiplication</strong>: Am×nBn×p→Cm×pA_{m \times n} B_{n \times p} \to C_{m \times p}Am×n​Bn×p​→Cm×p​. Row × column rule.</p></li><li><p><strong>Transpose</strong>: (AT)ij=Aji(A^T)_{ij} = A_{ji}(AT)ij​=Aji​.</p></li><li><p><strong>Conjugate Transpose</strong>: AH=A‾TA^H = \overline{A}^TAH=AT.</p></li></ul><p><strong>Properties</strong></p><ul><li><p>(A+B)T=AT+BT(A + B)^T = A^T + B^T(A+B)T=AT+BT</p></li><li><p>(AB)T=BTAT(A B)^T = B^T A^T(AB)T=BTAT</p></li><li><p>(AB)C=A(BC)(AB)C = A(BC)(AB)C=A(BC) (associative)</p></li><li><p>A(B+C)=AB+ACA(B + C) = AB + ACA(B+C)=AB+AC (distributive)</p></li><li><p>c(AB)=(cA)B=A(cB)c(AB) = (cA)B = A(cB)c(AB)=(cA)B=A(cB)</p></li></ul><p><strong>Special Matrices</strong></p><ul><li><p><strong>Identity</strong>: AI=IA=AAI = IA = AAI=IA=A.</p></li><li><p><strong>Inverse</strong>: AA−1=A−1A=IAA^{-1} = A^{-1} A = IAA−1=A−1A=I (if invertible).</p></li><li><p>(AB)−1=B−1A−1(AB)^{-1} = B^{-1}A^{-1}(AB)−1=B−1A−1.</p></li><li><p>(AT)−1=(A−1)T(A^T)^{-1} = (A^{-1})^T(AT)−1=(A−1)T.</p></li></ul><p><strong>Determinant</strong></p><ul><li><p>det⁡(AB)=det⁡(A)det⁡(B)\det(AB) = \det(A)\det(B)det(AB)=det(A)det(B).</p></li><li><p>det⁡(AT)=det⁡(A)\det(A^T) = \det(A)det(AT)=det(A).</p></li><li><p>Invertible iff det⁡(A)≠0\det(A) \neq 0det(A)≠0.</p></li></ul><p></p>', 'cmf6brkw0000ip3g25rpaqm71', '2025-09-05 04:19:20.797', '2025-09-05 04:19:20.797');

-- Insert Votes
INSERT INTO votes (id, "questionId", "userId", type, "createdAt") VALUES
('cmf6bojzv000fp3g24tzirn17', 'cmf6bnequ000dp3g29csvuniw', 'cmf40gkpx0000ope2d8jf24z4', 'UP', '2025-09-05 04:16:03.642'),
('cmf6bt2rz000qp3g2d3ndt3mr', null, 'cmf6brkw0000ip3g25rpaqm71', 'UP', '2025-09-05 04:19:34.607'),
('cmf6buwnw000up3g2c7uca0nm', 'cmf6bpeng000hp3g2kyglphjx', 'cmf6brkw0000ip3g25rpaqm71', 'UP', '2025-09-05 04:20:59.996');

-- Update sequences to prevent ID conflicts
SELECT setval('users_id_seq', (SELECT MAX(CAST(SUBSTRING(id FROM 4) AS BIGINT)) FROM users));
SELECT setval('classes_id_seq', (SELECT MAX(CAST(SUBSTRING(id FROM 4) AS BIGINT)) FROM classes));
SELECT setval('questions_id_seq', (SELECT MAX(CAST(SUBSTRING(id FROM 4) AS BIGINT)) FROM questions));
SELECT setval('answers_id_seq', (SELECT MAX(CAST(SUBSTRING(id FROM 4) AS BIGINT)) FROM answers));
SELECT setval('votes_id_seq', (SELECT MAX(CAST(SUBSTRING(id FROM 4) AS BIGINT)) FROM votes));
SELECT setval('class_enrollments_id_seq', (SELECT MAX(CAST(SUBSTRING(id FROM 4) AS BIGINT)) FROM class_enrollments));

-- Display summary
SELECT 'Seed data inserted successfully!' as status;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as class_count FROM classes;
SELECT COUNT(*) as question_count FROM questions;
SELECT COUNT(*) as answer_count FROM answers;
SELECT COUNT(*) as vote_count FROM votes;
SELECT COUNT(*) as enrollment_count FROM class_enrollments;
