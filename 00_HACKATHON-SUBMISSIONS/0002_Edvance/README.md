# 🎓 Edvance: AI-assisted discussion forum for education

**Track:** LearnAI  
**Team:** Edvance  '
**Hackathon:** OpenxAI Global Accelerator 2025 – Australian Hack Node  
**GitHub:** https://github.com/bmet-warrior/Edvance.git

---
## 👥 Team
**FinItToWinIt Team**
- **Liam Milton-White**
- **Geethika Aranhiyullathil** 

---

## 🚀 Project overview
**Edvance** is a discussion forum for students and educators with an AI assistant that answers recurring administrative questions using only **teacher-uploaded documents** and the **teacher’s past replies**. This keeps answers authoritative and aligned with course standards. Students can post, reply and upvote to encourage collaboration and peer learning. The goal is to reduce friction in the learning process while keeping teachers and students at the centre.

---

## 🎯 Problem
- **Universities without forums:** Students lack a course-specific place to get reliable answers. Generic AI tools can give off-spec or misleading advice.  
- **Universities with forums:** Traditional forums get clogged with repetitive admin questions, slowing response times and crowding out deeper, content-focused discussion.

---

## 💡 Solution
- **Teachers** upload subject materials and manage classes.  
- **AI assistant** answers repeat admin queries using only approved sources.  
- **Forum** handles new, content-heavy questions so students and teachers can discuss them properly.  
- Think of it as an **AI-integrated Reddit for educators** that enhances learning rather than replacing it.

---

## ✨ Key features
- **AI-powered admin Q&A** scoped to each class  
- **Posts, replies and upvotes** for peer collaboration  
- **Search and filters** to find past questions quickly  
- **Class info panel** with description, membership and activity  
- **Teacher controls** for document uploads and moderation

---

## 🛠 Tech stack

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL via Prisma
- **AI integration:** Ollama (llama3.2:1b model)
- **Authentication:** Custom authentication system

---
## �� API Endpoints

### **AI & Question Management**
- `POST /api/ai-prefilter` - AI-powered question screening and answer generation
- `GET /api/questions` - Fetch all questions for a class
- `POST /api/questions` - Create new questions
- `GET /api/questions/[id]` - Get specific question with answers
- `POST /api/answers` - Post answers to questions
- `GET /api/answers` - Fetch answers for a question

### **User & Authentication**
- `POST /api/users` - User registration and management
- `GET /api/profile` - Get user profile information
- `POST /api/login` - User authentication

### **Content & Documents**
- `POST /api/upload-documents` - Upload course materials (PDFs, docs)
- `GET /api/documents` - Fetch uploaded documents for a class

### **Class Management**
- `GET /api/classes` - Fetch user's enrolled classes
- `POST /api/classes` - Create new classes (teachers only)
- `POST /api/enroll` - Enroll in a class

---
## ��️ Database Schema

### **Core Models**

#### **User**
- `id`, `email`, `name`, `password`, `role` (STUDENT/TEACHER)
- `bio`, `profilePicture`, `graduationYear`, `degree`, `major`
- Relations: questions, answers, enrollments, taught classes

#### **Class**
- `id`, `name`, `code`, `description`, `semester`
- Relations: teacher, enrollments, questions, documents

#### **Question**
- `id`, `title`, `content`, `tags`, `createdAt`
- Relations: author, class, answers, votes

#### **Answer**
- `id`, `content`, `isAiGenerated`, `createdAt`
- Relations: author, question, votes

#### **Document**
- `id`, `title`, `filename`, `content`, `size`
- Relations: uploader, class, chunks

#### **ClassEnrollment**
- `id`, `userId`, `classId`, `enrolledAt`
- Relations: user, class

### **Database Technology**
- **PostgreSQL** with **Prisma ORM**
- **Automatic migrations** and schema management
- **Docker containerized** for easy setup

---

## 🧪 Getting started (local)

**Prerequisites**
- Node.js 18+
- Docker (for PostgreSQL database)
- Ollama (for AI functionality)
- Git

**Setup**
```bash
# Clone the repo
git clone <your-repo-url>
cd 0002_Edvance

# Start the database and application (recommended)
./start.sh

# Or manually:
# 1. Start database: docker-compose up -d
# 2. Start Ollama: ollama serve
# 3. Pull model: ollama pull llama3.2:1b
# 4. Install deps: cd nextjs-app && npm install
# 5. Run app: npm run dev
```

**Environment Setup**
The application automatically configures the database and environment variables through Docker. No manual `.env` file setup is required.
```
---
## 📊 Demo
- **Video:** https://youtu.be/5O675bynTIc

---

## 🔒 Scope and assumptions
- **No production deployment** is included in this submission.  
- AI answers are based on **teacher-uploaded documents AND past forum discussions** by design.
---

## 🏆 Why this helps

### **For Students:**
- **Instant Answers:** Get immediate responses to common questions without waiting for teacher replies
- **24/7 Availability:** Access course information anytime, even outside class hours
- **Peer Learning:** Learn from classmates' previous questions and discussions
- **Reduced Anxiety:** Clear answers to administrative questions reduce stress about course requirements

### **For Educators:**
- **Time Savings:** Automatically handle repetitive administrative questions
- **Focus on Content:** Spend more time on meaningful discussions and complex topics
- **Quality Control:** AI only uses approved course materials and verified information
- **Student Engagement:** Forum discussions become more focused on learning rather than logistics

### **For Institutions:**
- **Scalability:** Works for classes of any size, from small seminars to large lectures
- **Consistency:** Ensures all students receive the same accurate information
- **Resource Efficiency:** Reduces administrative burden on teaching staff
- **Modern Learning:** Integrates AI tools that students expect in today's educational landscape

### **Key Benefits:**
- **Accuracy:** AI leverages both teacher materials AND collective class knowledge
- **Efficiency:** Eliminates repetitive Q&A while maintaining human touch for complex questions
- **Community:** Strengthens peer learning through structured discussions
- **Accessibility:** Provides immediate help for students who might hesitate to ask questions
---

## 📄 Licence
**MIT Licence**
