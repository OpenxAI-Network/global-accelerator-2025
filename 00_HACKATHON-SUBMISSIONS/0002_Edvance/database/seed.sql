-- Seed data for Edvance application
-- Generated on: 2025-09-05T06:47:31.000Z
-- This file contains all current data from the database

-- Clear existing data (in reverse dependency order)
DELETE FROM "class_accuracy";
DELETE FROM "ai_feedback";
DELETE FROM "chunks";
DELETE FROM "documents";
DELETE FROM "votes";
DELETE FROM "answers";
DELETE FROM "questions";
DELETE FROM "class_enrollments";
DELETE FROM "classes";
DELETE FROM "users";

-- Reset sequences
ALTER SEQUENCE IF EXISTS "users_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "classes_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "class_enrollments_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "questions_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "answers_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "votes_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "documents_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "chunks_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "ai_feedback_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "class_accuracy_id_seq" RESTART WITH 1;

-- Users
INSERT INTO "users" ("id", "email", "name", "password", "role", "isDemo", "bio", "profilePicture", "graduationYear", "degree", "major", "createdAt", "updatedAt") VALUES
('cmf40gkpx0000ope2d8jf24z4', 'student@university.edu', 'Alice Student', 'Alice102!', 'STUDENT', true, NULL, NULL, NULL, NULL, NULL, '2025-09-03 13:26:23.205', '2025-09-03 13:26:23.205'),
('cmf40gkq70001ope2uuban6jq', 'teacher@university.edu', 'Dr. Sarah Chen', 'Chen102!', 'TEACHER', true, NULL, NULL, NULL, NULL, NULL, '2025-09-03 13:26:23.215', '2025-09-03 13:26:23.215'),
('cmf40gkqa0002ope2zz1j4moq', 'prof.rodriguez@university.edu', 'Prof. Michael Rodriguez', 'Alice102!', 'TEACHER', false, NULL, NULL, NULL, NULL, NULL, '2025-09-03 13:26:23.218', '2025-09-03 13:26:23.218'),
('cmf40gkqd0003ope281mgbwam', 'dr.watson@university.edu', 'Dr. Emily Watson', 'Alice102!', 'TEACHER', false, NULL, NULL, NULL, NULL, NULL, '2025-09-03 13:26:23.222', '2025-09-03 13:26:23.222'),
('cmf40gkqh0004ope2808dyljr', 'prof.kim@university.edu', 'Prof. David Kim', 'Alice102!', 'TEACHER', false, NULL, NULL, NULL, NULL, NULL, '2025-09-03 13:26:23.225', '2025-09-03 13:26:23.225'),
('cmf6b4lx80000lye04viqzk5c', 'demo.teacher@edvance.edu', 'Demo Teacher', 'Alice102!', 'TEACHER', true, NULL, NULL, NULL, NULL, NULL, '2025-09-05 04:00:33.02', '2025-09-05 04:00:33.02'),
('cmf6brkw0000ip3g25rpaqm71', 'gnunii@university.edu', 'Geebs Nunii', 'Alice102!', 'STUDENT', false, NULL, NULL, NULL, NULL, NULL, '2025-09-05 04:18:24.768', '2025-09-05 04:18:24.768'),
('cmf6cbmpa000vp3g2x6v4aeu0', 'jane.smith@education.edu.au', 'Jane Smith', 'Alice102!', 'STUDENT', false, NULL, NULL, NULL, NULL, NULL, '2025-09-05 04:34:00.239', '2025-09-05 04:34:00.239'),
('cmf6cke310014p3g2ifchkuo5', 'john.doe@university.edu.au', 'John Doe', 'Alice102!', 'STUDENT', false, NULL, NULL, NULL, NULL, NULL, '2025-09-05 04:40:48.974', '2025-09-05 04:40:48.974'),
('cmf6com830015p3g2pnb066yl', 'henry.doe@university.edu.au', 'Henry Doe', 'Alice102!', 'STUDENT', false, NULL, NULL, NULL, NULL, NULL, '2025-09-05 04:44:06.147', '2025-09-05 04:44:06.147'),
('cmf6cpa1t0016p3g2uwbeeqbv', 'henry.li@university.edu.au', 'Henry Li', 'Alice102!', 'STUDENT', false, NULL, NULL, NULL, NULL, NULL, '2025-09-05 04:44:37.025', '2025-09-05 04:44:37.025'),
('cmf6cpodq0017p3g2pi2wual3', 'dddd@dddd', 'ddd', 'Alice102!', 'STUDENT', false, NULL, NULL, NULL, NULL, NULL, '2025-09-05 04:44:55.598', '2025-09-05 04:44:55.598'),
('cmf6cs92y0018p3g243xkokqk', 'henry.wang@university.edu.au', 'henry wang', 'Alice102!', 'STUDENT', false, NULL, NULL, NULL, NULL, NULL, '2025-09-05 04:46:55.738', '2025-09-05 04:46:55.738');

-- Classes
INSERT INTO "classes" ("id", "name", "code", "description", "semester", "createdAt", "updatedAt", "teacherId") VALUES
('cmf40gkqj0006ope2fuvn2hhq', 'Derivative Securities', 'FINC3012', 'Advanced study of derivative instruments and their applications in financial markets.', 'Semester 1, 2024', '2025-09-03 13:26:23.228', '2025-09-03 13:26:23.228', 'cmf40gkq70001ope2uuban6jq'),
('cmf40gkqp0008ope2gptjjid3', 'Engineering Analysis', 'AMME2000', 'Mathematical and computational methods for engineering problem solving.', 'Semester 1, 2024', '2025-09-03 13:26:23.233', '2025-09-03 13:26:23.233', 'cmf40gkqa0002ope2zz1j4moq'),
('cmf40gkqr000aope2vkabk5fz', 'Future of Business', 'BUSS1000', 'Exploring emerging business trends and digital transformation strategies.', 'Semester 1, 2024', '2025-09-03 13:26:23.236', '2025-09-03 13:26:23.236', 'cmf40gkqd0003ope281mgbwam'),
('cmf40gkqu000cope2b4dfqpe1', 'Introduction to Engineering Computing', 'ENGG1810', 'Fundamentals of programming and computational thinking for engineers.', 'Semester 1, 2024', '2025-09-03 13:26:23.238', '2025-09-03 13:26:23.238', 'cmf40gkqh0004ope2808dyljr'),
('cmf6bkqai0005p3g2mdq13omx', 'Investment and Portfolio Management', 'FINC3017', 'This unit is designed to provide a comprehensive analytical approach to the modern theory of investments. Topics covered include: mean-variance analysis; Markowitz type portfolio analysis; portfolio construction; asset pricing theories; market efficiency and anomalies; hedge funds and investment fund performance evaluation. Although analytical aspects of investments theory are stressed, there is also an equal amount of coverage on the practical aspects of portfolio management. Current research on investments is emphasised in the course.', 'Semester 2, 2025', '2025-09-05 04:13:05.177', '2025-09-05 04:13:05.177', 'cmf40gkq70001ope2uuban6jq');

-- Class Enrollments
INSERT INTO "class_enrollments" ("id", "userId", "classId", "enrolledAt") VALUES
('cmf40gkqx000eope272xsyio1', 'cmf40gkpx0000ope2d8jf24z4', 'cmf40gkqj0006ope2fuvn2hhq', '2025-09-03 13:26:23.241'),
('cmf40gkr1000gope2046eubzd', 'cmf40gkpx0000ope2d8jf24z4', 'cmf40gkqp0008ope2gptjjid3', '2025-09-03 13:26:23.245'),
('cmf40gkr3000iope25gn4g9l7', 'cmf40gkpx0000ope2d8jf24z4', 'cmf40gkqr000aope2vkabk5fz', '2025-09-03 13:26:23.248'),
('cmf40gkr5000kope2bgcu6fcz', 'cmf40gkpx0000ope2d8jf24z4', 'cmf40gkqu000cope2b4dfqpe1', '2025-09-03 13:26:23.25'),
('cmf6blt5h000bp3g2hdnl4dq6', 'cmf40gkpx0000ope2d8jf24z4', 'cmf6bkqai0005p3g2mdq13omx', '2025-09-05 04:13:55.541'),
('cmf6brpmm000kp3g2vitc1rw5', 'cmf6brkw0000ip3g25rpaqm71', 'cmf6bkqai0005p3g2mdq13omx', '2025-09-05 04:18:30.91'),
('cmf6brua5000mp3g2pbtvcooh', 'cmf6brkw0000ip3g25rpaqm71', 'cmf40gkqj0006ope2fuvn2hhq', '2025-09-05 04:18:36.942');

-- Questions
INSERT INTO "questions" ("id", "title", "content", "tags", "createdAt", "updatedAt", "authorId", "classId") VALUES
('cmf40gkr7000mope2mk2ocrzl', 'Understanding recursion', 'Can someone explain how recursion works in programming? I understand the concept but struggle with implementing it.', '["recursion","programming","help"]', '2025-09-03 13:26:23.252', '2025-09-03 13:26:23.252', 'cmf40gkpx0000ope2d8jf24z4', 'cmf40gkqu000cope2b4dfqpe1'),
('cmf40gkra000qope21f8uffi4', 'Assignment 1 word count', 'What is the word limit for Assignment 1?', '["assignment","word-count"]', '2025-09-03 13:26:23.255', '2025-09-03 13:26:23.255', 'cmf40gkpx0000ope2d8jf24z4', 'cmf40gkqj0006ope2fuvn2hhq'),
('cmf421yr6000m2eez1hx2hfjg', 'Understanding recursion', 'Can someone explain how recursion works in programming? I understand the concept but struggle with implementing it.', '["recursion","programming","help"]', '2025-09-03 14:11:00.786', '2025-09-03 14:11:00.786', 'cmf40gkpx0000ope2d8jf24z4', 'cmf40gkqu000cope2b4dfqpe1'),
('cmf421yrj000q2eezpgjpxsld', 'Assignment 1 word count', 'What is the word limit for Assignment 1?', '["assignment","word-count"]', '2025-09-03 14:11:00.8', '2025-09-03 14:11:00.8', 'cmf40gkpx0000ope2d8jf24z4', 'cmf40gkqj0006ope2fuvn2hhq'),
('cmf423gl3000msh2zmz7yjfo7', 'Understanding recursion', 'Can someone explain how recursion works in programming? I understand the concept but struggle with implementing it.', '["recursion","programming","help"]', '2025-09-03 14:12:10.552', '2025-09-03 14:12:10.552', 'cmf40gkpx0000ope2d8jf24z4', 'cmf40gkqu000cope2b4dfqpe1'),
('cmf423gle000qsh2zkxh9sjez', 'Assignment 1 word count', 'What is the word limit for Assignment 1?', '["assignment","word-count"]', '2025-09-03 14:12:10.562', '2025-09-03 14:12:10.562', 'cmf40gkpx0000ope2d8jf24z4', 'cmf40gkqj0006ope2fuvn2hhq'),
('cmf428ouj0001e51vvo8l5z9o', 'Futures and Forwards', '<p>What is the difference between futures and forward contracts? </p>', '[]', '2025-09-03 14:16:14.538', '2025-09-03 14:16:14.538', 'cmf40gkpx0000ope2d8jf24z4', 'cmf40gkqj0006ope2fuvn2hhq'),
('cmf6bnequ000dp3g29csvuniw', 'Matrix Algebra', '<p>In lecture 1 the professor mentioned we needed to know basic matrix algebra rules. Can someone please summarise them? </p>', '["lecture-1"]', '2025-09-05 04:15:10.181', '2025-09-05 04:15:10.181', 'cmf40gkpx0000ope2d8jf24z4', 'cmf6bkqai0005p3g2mdq13omx'),
('cmf6bpeng000hp3g2kyglphjx', 'Efficient Portfolios', '<p>When looking at the risk vs return plot, what is the difference between efficient and inefficient portfolios? </p>', '["lecture-3"]', '2025-09-05 04:16:43.369', '2025-09-05 04:16:43.369', 'cmf40gkpx0000ope2d8jf24z4', 'cmf6bkqai0005p3g2mdq13omx'),
('cmf6bttin000sp3g2cany3k7u', 'Different Risk in CAPM', '<p>Could someone clarify the difference between systematic vs. unsystematic risk in the CAPM context?</p><p></p>', '["lecture-4"]', '2025-09-05 04:20:09.263', '2025-09-05 04:20:09.263', 'cmf6brkw0000ip3g25rpaqm71', 'cmf6bkqai0005p3g2mdq13omx'),
('cmf6cc8vd000xp3g2me9p5km8', 'forward price and the futures price when interest rates are stochastic', '<p>What''s the exact difference between the forward price and the futures price when interest rates are stochastic?</p>', '[]', '2025-09-05 04:34:28.966', '2025-09-05 04:34:28.966', 'cmf6cbmpa000vp3g2x6v4aeu0', 'cmf40gkqj0006ope2fuvn2hhq'),
('cmf6ccoh6000zp3g2x6wchylo', 'cost-of-carry model', '<ul><li><p>In the cost-of-carry model, how do we treat dividends or storage costs for equity index vs. commodity futures?</p></li></ul><p></p>', '[]', '2025-09-05 04:34:49.194', '2025-09-05 04:34:49.194', 'cmf6cbmpa000vp3g2x6v4aeu0', 'cmf40gkqj0006ope2fuvn2hhq'),
('cmf6cd8av0011p3g2r5yv80h7', 'futures and forwards', '<ul><li><p>Why do futures contracts require daily marking-to-market while forwards don''t?</p></li></ul><p></p>', '[]', '2025-09-05 04:35:14.888', '2025-09-05 04:35:14.888', 'cmf6cbmpa000vp3g2x6v4aeu0', 'cmf40gkqj0006ope2fuvn2hhq'),
('cmf6cegfw0013p3g2ierf2w31', 'tutorial 1, question 6', '<p>How do I correctly draw the payoff diagram for a covered call or protective put for tutorial 1, question 6.</p>', '[]', '2025-09-05 04:36:12.091', '2025-09-05 04:36:12.091', 'cmf6cbmpa000vp3g2x6v4aeu0', 'cmf40gkqj0006ope2fuvn2hhq'),
('cmf6cwif5001ap3g266cuxpq5', 'How do I declare and use arrays in MATLAB for storing multiple sensor readings?', '<p>How do I declare and use arrays in MATLAB for storing multiple sensor readings?</p>', '[]', '2025-09-05 04:50:14.465', '2025-09-05 04:50:14.465', 'cmf6cs92y0018p3g243xkokqk', 'cmf40gkqu000cope2b4dfqpe1'),
('cmf6cwshn001cp3g2v7ymxwwb', 'What''s the difference between a for loop and a while loop in terms of when to use them?', '<p>What''s the difference between a for loop and a while loop in terms of when to use them?</p>', '[]', '2025-09-05 04:50:27.515', '2025-09-05 04:50:27.515', 'cmf6cs92y0018p3g243xkokqk', 'cmf40gkqu000cope2b4dfqpe1'),
('cmf6cx6v3001ep3g2mu26mmey', 'How do we set up and solve a second-order ODE with non-homogeneous boundary conditions?', '<p>How do we set up and solve a second-order ODE with non-homogeneous boundary conditions?</p>', '[]', '2025-09-05 04:50:46.143', '2025-09-05 04:50:46.143', 'cmf6cs92y0018p3g243xkokqk', 'cmf40gkqp0008ope2gptjjid3'),
('cmf6cxe92001gp3g28c4fl1m6', 'What''s the difference between separation of variables and the method of eigenfunction expansion?', '<p>What''s the difference between separation of variables and the method of eigenfunction expansion?</p>', '[]', '2025-09-05 04:50:55.718', '2025-09-05 04:50:55.718', 'cmf6cs92y0018p3g243xkokqk', 'cmf40gkqp0008ope2gptjjid3');

-- Answers
INSERT INTO "answers" ("id", "content", "isAiGenerated", "sourceCode", "sourceCodeFilename", "createdAt", "updatedAt", "authorId", "questionId") VALUES
('cmf40gkr9000oope2zuwykpf4', 'Recursion is when a function calls itself. You need a base case to stop and a recursive case that solves a smaller version of the problem. Think of it like Russian dolls - each one contains a smaller version. For example: factorial(n) = n * factorial(n-1) with base case factorial(0) = 1.', false, NULL, NULL, '2025-09-03 13:26:23.253', '2025-09-03 13:26:23.253', 'cmf40gkqh0004ope2808dyljr', 'cmf40gkr7000mope2mk2ocrzl'),
('cmf421yrh000o2eez5l9svbqg', 'Recursion is when a function calls itself. You need a base case to stop and a recursive case that solves a smaller version of the problem. Think of it like Russian dolls - each one contains a smaller version. For example: factorial(n) = n * factorial(n-1) with base case factorial(0) = 1.', false, NULL, NULL, '2025-09-03 14:11:00.798', '2025-09-03 14:11:00.798', 'cmf40gkqh0004ope2808dyljr', 'cmf421yr6000m2eez1hx2hfjg'),
('cmf423glc000osh2z43g266pk', 'Recursion is when a function calls itself. You need a base case to stop and a recursive case that solves a smaller version of the problem. Think of it like Russian dolls - each one contains a smaller version. For example: factorial(n) = n * factorial(n-1) with base case factorial(0) = 1.', false, NULL, NULL, '2025-09-03 14:12:10.56', '2025-09-03 14:12:10.56', 'cmf40gkqh0004ope2808dyljr', 'cmf423gl3000msh2zmz7yjfo7'),
('cmf6bss4d000op3g2kx6djvv3', '<p><strong>Basic Operations</strong></p><ul><li><p><strong>Addition</strong>: A+BA + BA+B only if same dimensions. Element-wise.</p></li><li><p><strong>Scalar Multiplication</strong>: cAcAcA, multiply each element by ccc.</p></li><li><p><strong>Matrix Multiplication</strong>: Am×nBn×p→Cm×pA_{m \times n} B_{n \times p} \to C_{m \times p}Am×n​Bn×p​→Cm×p​. Row × column rule.</p></li><li><p><strong>Transpose</strong>: (AT)ij=Aji(A^T)_{ij} = A_{ji}(AT)ij​=Aji​.</p></li><li><p><strong>Conjugate Transpose</strong>: AH=A‾TA^H = \overline{A}^TAH=AT.</p></li></ul><p><strong>Properties</strong></p><ul><li><p>(A+B)T=AT+BT(A + B)^T = A^T + B^T(A+B)T=AT+BT</p></li><li><p>(AB)T=BTAT(AB)^T = B^T A^T(AB)T=BTAT</p></li><li><p>(AB)C=A(BC)(AB)C = A(BC)(AB)C=A(BC) (associative)</p></li><li><p>A(B+C)=AB+ACA(B + C) = AB + ACA(B+C)=AB+AC (distributive)</p></li><li><p>c(AB)=(cA)B=A(cB)c(AB) = (cA)B = A(cB)c(AB)=(cA)B=A(cB)</p></li></ul><p><strong>Special Matrices</strong></p><ul><li><p><strong>Identity</strong>: AI=IA=AAI = IA = AAI=IA=A.</p></li><li><p><strong>Inverse</strong>: AA−1=A−1A=IAA^{-1} = A^{-1}A = IAA−1=A−1A=I (if invertible).</p></li><li><p>(AB)−1=B−1A−1(AB)^{-1} = B^{-1}A^{-1}(AB)−1=B−1A−1.</p></li><li><p>(AT)−1=(A−1)T(A^T)^{-1} = (A^{-1})^T(AT)−1=(A−1)T.</p></li></ul><p><strong>Determinant</strong></p><ul><li><p>det⁡(AB)=det⁡(A)det⁡(B)\det(AB) = \det(A)\det(B)det(AB)=det(A)det(B).</p></li><li><p>det⁡(AT)=det⁡(A)\det(A^T) = \det(A)det(AT)=det(A).</p></li><li><p>Invertible iff det⁡(A)≠0\det(A) \neq 0det(A)≠0.</p></li></ul><p></p>', false, NULL, NULL, '2025-09-05 04:19:20.797', '2025-09-05 04:19:20.797', 'cmf6brkw0000ip3g25rpaqm71', 'cmf6bnequ000dp3g29csvuniw');

-- Votes
INSERT INTO "votes" ("id", "type", "createdAt", "userId", "questionId", "answerId") VALUES
('cmf6bojzv000fp3g24tzirn17', 'UP', '2025-09-05 04:16:03.642', 'cmf40gkpx0000ope2d8jf24z4', 'cmf6bnequ000dp3g29csvuniw', NULL),
('cmf6bt2rz000qp3g2d3ndt3mr', 'UP', '2025-09-05 04:19:34.607', 'cmf6brkw0000ip3g25rpaqm71', NULL, 'cmf6bss4d000op3g2kx6djvv3'),
('cmf6buwnw000up3g2c7uca0nm', 'UP', '2025-09-05 04:20:59.996', 'cmf6brkw0000ip3g25rpaqm71', 'cmf6bpeng000hp3g2kyglphjx', NULL);

-- Seed data insertion completed
-- Total records inserted:
--   Users: 13
--   Classes: 5
--   Class Enrollments: 7
--   Questions: 18
--   Answers: 4
--   Votes: 3
--   Documents: 0
--   Chunks: 0
--   AI Feedback: 0
--   Class Accuracy: 0