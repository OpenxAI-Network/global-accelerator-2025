const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function backupDatabaseToSeed() {
  try {
    console.log('🚀 Starting database backup to seed files...')
    
    // Get all data from the database
    const [
      users,
      classes,
      classEnrollments,
      questions,
      answers,
      votes,
      documents,
      chunks,
      aiFeedback,
      classAccuracy
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.class.findMany(),
      prisma.classEnrollment.findMany(),
      prisma.question.findMany(),
      prisma.answer.findMany(),
      prisma.vote.findMany(),
      prisma.document.findMany(),
      prisma.chunk.findMany(),
      prisma.aiFeedback.findMany(),
      prisma.classAccuracy.findMany()
    ])
    
    console.log(`📊 Data collected:`)
    console.log(`   Users: ${users.length}`)
    console.log(`   Classes: ${classes.length}`)
    console.log(`   Class Enrollments: ${classEnrollments.length}`)
    console.log(`   Questions: ${questions.length}`)
    console.log(`   Answers: ${answers.length}`)
    console.log(`   Votes: ${votes.length}`)
    console.log(`   Documents: ${documents.length}`)
    console.log(`   Chunks: ${chunks.length}`)
    console.log(`   AI Feedback: ${aiFeedback.length}`)
    console.log(`   Class Accuracy: ${classAccuracy.length}`)
    
    // Create the seed SQL content
    const seedContent = generateSeedSQL({
      users,
      classes,
      classEnrollments,
      questions,
      answers,
      votes,
      documents,
      chunks,
      aiFeedback,
      classAccuracy
    })
    
    // Write to seed.sql file
    const seedPath = path.join(__dirname, '..', 'database', 'seed.sql')
    fs.writeFileSync(seedPath, seedContent)
    console.log(`✅ Seed file created: ${seedPath}`)
    
    // Also update the init.sql file with the complete schema and data
    const initContent = generateInitSQL({
      users,
      classes,
      classEnrollments,
      questions,
      answers,
      votes,
      documents,
      chunks,
      aiFeedback,
      classAccuracy
    })
    
    const initPath = path.join(__dirname, '..', 'database', 'init.sql')
    fs.writeFileSync(initPath, initContent)
    console.log(`✅ Init file updated: ${initPath}`)
    
    // Create a summary report
    const reportPath = path.join(__dirname, '..', 'database', 'backup-report.md')
    const reportContent = generateBackupReport({
      users,
      classes,
      classEnrollments,
      questions,
      answers,
      votes,
      documents,
      chunks,
      aiFeedback,
      classAccuracy
    })
    
    fs.writeFileSync(reportPath, reportContent)
    console.log(`✅ Backup report created: ${reportPath}`)
    
    console.log(`\n🎉 Database backup completed successfully!`)
    console.log(`📁 Files created:`)
    console.log(`   - database/seed.sql (standalone seed data)`)
    console.log(`   - database/init.sql (complete schema + data)`)
    console.log(`   - database/backup-report.md (backup summary)`)
    
  } catch (error) {
    console.error('❌ Error during database backup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

function generateSeedSQL(data) {
  const { users, classes, classEnrollments, questions, answers, votes, documents, chunks, aiFeedback, classAccuracy } = data
  
  let sql = `-- Seed data for Edvance application
-- Generated on: ${new Date().toISOString()}
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

`

  // Insert users
  if (users.length > 0) {
    sql += `-- Users\n`
    sql += `INSERT INTO "users" ("id", "email", "name", "password", "role", "isDemo", "bio", "profilePicture", "graduationYear", "degree", "major", "createdAt", "updatedAt") VALUES\n`
    
    const userValues = users.map(user => {
      const bio = user.bio ? `'${user.bio.replace(/'/g, "''")}'` : 'NULL'
      const profilePicture = user.profilePicture ? `'${user.profilePicture.replace(/'/g, "''")}'` : 'NULL'
      const graduationYear = user.graduationYear ? `'${user.graduationYear.replace(/'/g, "''")}'` : 'NULL'
      const degree = user.degree ? `'${user.degree.replace(/'/g, "''")}'` : 'NULL'
      const major = user.major ? `'${user.major.replace(/'/g, "''")}'` : 'NULL'
      
      return `('${user.id}', '${user.email.replace(/'/g, "''")}', '${user.name.replace(/'/g, "''")}', '${user.password.replace(/'/g, "''")}', '${user.role}', ${user.isDemo}, ${bio}, ${profilePicture}, ${graduationYear}, ${degree}, ${major}, '${user.createdAt.toISOString()}', '${user.updatedAt.toISOString()}')`
    }).join(',\n')
    
    sql += userValues + ';\n\n'
  }
  
  // Insert classes
  if (classes.length > 0) {
    sql += `-- Classes\n`
    sql += `INSERT INTO "classes" ("id", "name", "code", "description", "semester", "createdAt", "updatedAt", "teacherId") VALUES\n`
    
    const classValues = classes.map(cls => {
      const description = cls.description ? `'${cls.description.replace(/'/g, "''")}'` : 'NULL'
      return `('${cls.id}', '${cls.name.replace(/'/g, "''")}', '${cls.code}', ${description}, '${cls.semester.replace(/'/g, "''")}', '${cls.createdAt.toISOString()}', '${cls.updatedAt.toISOString()}', '${cls.teacherId}')`
    }).join(',\n')
    
    sql += classValues + ';\n\n'
  }
  
  // Insert class enrollments
  if (classEnrollments.length > 0) {
    sql += `-- Class Enrollments\n`
    sql += `INSERT INTO "class_enrollments" ("id", "userId", "classId", "enrolledAt") VALUES\n`
    
    const enrollmentValues = classEnrollments.map(enrollment => {
      return `('${enrollment.id}', '${enrollment.userId}', '${enrollment.classId}', '${enrollment.enrolledAt.toISOString()}')`
    }).join(',\n')
    
    sql += enrollmentValues + ';\n\n'
  }
  
  // Insert questions
  if (questions.length > 0) {
    sql += `-- Questions\n`
    sql += `INSERT INTO "questions" ("id", "title", "content", "tags", "createdAt", "updatedAt", "authorId", "classId") VALUES\n`
    
    const questionValues = questions.map(question => {
      const content = question.content.replace(/'/g, "''")
      const title = question.title.replace(/'/g, "''")
      const tags = question.tags.replace(/'/g, "''")
      
      return `('${question.id}', '${title}', '${content}', '${tags}', '${question.createdAt.toISOString()}', '${question.updatedAt.toISOString()}', '${question.authorId}', '${question.classId}')`
    }).join(',\n')
    
    sql += questionValues + ';\n\n'
  }
  
  // Insert answers
  if (answers.length > 0) {
    sql += `-- Answers\n`
    sql += `INSERT INTO "answers" ("id", "content", "isAiGenerated", "sourceCode", "sourceCodeFilename", "createdAt", "updatedAt", "authorId", "questionId") VALUES\n`
    
    const answerValues = answers.map(answer => {
      const content = answer.content.replace(/'/g, "''")
      const sourceCode = answer.sourceCode ? `'${answer.sourceCode.replace(/'/g, "''")}'` : 'NULL'
      const sourceCodeFilename = answer.sourceCodeFilename ? `'${answer.sourceCodeFilename.replace(/'/g, "''")}'` : 'NULL'
      
      return `('${answer.id}', '${content}', ${answer.isAiGenerated}, ${sourceCode}, ${sourceCodeFilename}, '${answer.createdAt.toISOString()}', '${answer.updatedAt.toISOString()}', '${answer.authorId}', '${answer.questionId}')`
    }).join(',\n')
    
    sql += answerValues + ';\n\n'
  }
  
  // Insert votes
  if (votes.length > 0) {
    sql += `-- Votes\n`
    sql += `INSERT INTO "votes" ("id", "type", "createdAt", "userId", "questionId", "answerId") VALUES\n`
    
    const voteValues = votes.map(vote => {
      const questionId = vote.questionId ? `'${vote.questionId}'` : 'NULL'
      const answerId = vote.answerId ? `'${vote.answerId}'` : 'NULL'
      
      return `('${vote.id}', '${vote.type}', '${vote.createdAt.toISOString()}', '${vote.userId}', ${questionId}, ${answerId})`
    }).join(',\n')
    
    sql += voteValues + ';\n\n'
  }
  
  // Insert documents
  if (documents.length > 0) {
    sql += `-- Documents\n`
    sql += `INSERT INTO "documents" ("id", "title", "filename", "documentType", "content", "size", "createdAt", "uploaderId", "classId") VALUES\n`
    
    const documentValues = documents.map(doc => {
      const title = doc.title.replace(/'/g, "''")
      const filename = doc.filename.replace(/'/g, "''")
      const content = doc.content.replace(/'/g, "''")
      
      return `('${doc.id}', '${title}', '${filename}', '${doc.documentType}', '${content}', ${doc.size}, '${doc.createdAt.toISOString()}', '${doc.uploaderId}', '${doc.classId}')`
    }).join(',\n')
    
    sql += documentValues + ';\n\n'
  }
  
  // Insert chunks
  if (chunks.length > 0) {
    sql += `-- Chunks\n`
    sql += `INSERT INTO "chunks" ("id", "docId", "classId", "page", "text", "embedding", "createdAt") VALUES\n`
    
    const chunkValues = chunks.map(chunk => {
      const text = chunk.text.replace(/'/g, "''")
      const embedding = chunk.embedding.replace(/'/g, "''")
      const page = chunk.page ? chunk.page : 'NULL'
      
      return `('${chunk.id}', '${chunk.docId}', '${chunk.classId}', ${page}, '${text}', '${embedding}', '${chunk.createdAt.toISOString()}')`
    }).join(',\n')
    
    sql += chunkValues + ';\n\n'
  }
  
  // Insert AI feedback
  if (aiFeedback.length > 0) {
    sql += `-- AI Feedback\n`
    sql += `INSERT INTO "ai_feedback" ("id", "question", "aiResponse", "wasHelpful", "createdAt", "userId", "classId") VALUES\n`
    
    const feedbackValues = aiFeedback.map(feedback => {
      const question = feedback.question.replace(/'/g, "''")
      const aiResponse = feedback.aiResponse.replace(/'/g, "''")
      
      return `('${feedback.id}', '${question}', '${aiResponse}', ${feedback.wasHelpful}, '${feedback.createdAt.toISOString()}', '${feedback.userId}', '${feedback.classId}')`
    }).join(',\n')
    
    sql += feedbackValues + ';\n\n'
  }
  
  // Insert class accuracy
  if (classAccuracy.length > 0) {
    sql += `-- Class Accuracy\n`
    sql += `INSERT INTO "class_accuracy" ("id", "totalFeedback", "helpfulFeedback", "accuracyRate", "lastUpdated", "classId") VALUES\n`
    
    const accuracyValues = classAccuracy.map(accuracy => {
      return `('${accuracy.id}', ${accuracy.totalFeedback}, ${accuracy.helpfulFeedback}, ${accuracy.accuracyRate}, '${accuracy.lastUpdated.toISOString()}', '${accuracy.classId}')`
    }).join(',\n')
    
    sql += accuracyValues + ';\n\n'
  }
  
  sql += `-- Seed data insertion completed
-- Total records inserted:
--   Users: ${users.length}
--   Classes: ${classes.length}
--   Class Enrollments: ${classEnrollments.length}
--   Questions: ${questions.length}
--   Answers: ${answers.length}
--   Votes: ${votes.length}
--   Documents: ${documents.length}
--   Chunks: ${chunks.length}
--   AI Feedback: ${aiFeedback.length}
--   Class Accuracy: ${classAccuracy.length}
`
  
  return sql
}

function generateInitSQL(data) {
  // This would include the full schema + data
  // For now, we'll use the existing schema and append the seed data
  const schemaPath = path.join(__dirname, '..', 'database', 'init.sql')
  let initContent = ''
  
  // Try to read existing init.sql for schema
  try {
    const existingContent = fs.readFileSync(schemaPath, 'utf8')
    // Find where the schema ends and data begins
    const schemaEndIndex = existingContent.indexOf('-- Seed data')
    if (schemaEndIndex > 0) {
      initContent = existingContent.substring(0, schemaEndIndex)
    } else {
      initContent = existingContent
    }
  } catch (error) {
    console.log('No existing init.sql found, creating new one')
  }
  
  // Add the seed data
  initContent += '\n' + generateSeedSQL(data)
  
  return initContent
}

function generateBackupReport(data) {
  const { users, classes, classEnrollments, questions, answers, votes, documents, chunks, aiFeedback, classAccuracy } = data
  
  return `# Database Backup Report

**Generated on:** ${new Date().toISOString()}

## Summary

This backup contains all current data from the Edvance application database.

## Data Counts

| Table | Count | Description |
|-------|-------|-------------|
| Users | ${users.length} | All user accounts (students, teachers, admins) |
| Classes | ${classes.length} | All course classes |
| Class Enrollments | ${classEnrollments.length} | Student enrollments in classes |
| Questions | ${questions.length} | All questions asked by students |
| Answers | ${answers.length} | All answers to questions |
| Votes | ${votes.length} | All votes on questions and answers |
| Documents | ${documents.length} | All uploaded course documents |
| Chunks | ${chunks.length} | Document chunks for AI processing |
| AI Feedback | ${aiFeedback.length} | AI response feedback |
| Class Accuracy | ${classAccuracy.length} | Class accuracy metrics |

## User Breakdown

${users.reduce((acc, user) => {
  acc[user.role] = (acc[user.role] || 0) + 1
  return acc
}, {})}

## Class Information

${classes.map(cls => `- **${cls.code}**: ${cls.name} (${cls.semester})`).join('\n')}

## Files Created

1. **seed.sql** - Standalone seed data file
2. **init.sql** - Complete schema + data file
3. **backup-report.md** - This report

## Usage

To restore this data on a fresh installation:

1. Run the database initialization with \`init.sql\`
2. Or use \`seed.sql\` to populate an existing database

## Notes

- All data has been sanitized for SQL injection prevention
- Timestamps are preserved in ISO format
- File paths and URLs are included as-is
- This backup represents the complete state of the application
`
}

// Run the backup
backupDatabaseToSeed()
