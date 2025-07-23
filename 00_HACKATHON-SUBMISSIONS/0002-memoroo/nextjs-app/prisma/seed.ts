import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@memoroo.com' },
    update: {},
    create: {
      email: 'test@memoroo.com',
      password: hashedPassword,
      name: 'Test User',
    },
  })

  console.log('👤 Created test user:', testUser.email)

  // Create sample flashcards
  const sampleFlashcards = [
    {
      front: 'What is the capital of France?',
      back: 'Paris is the capital and largest city of France.',
      tags: 'geography,capitals,europe'
    },
    {
      front: 'What is photosynthesis?',
      back: 'Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of sugar.',
      tags: 'biology,plants,science'
    },
    {
      front: 'What is the formula for the area of a circle?',
      back: 'The area of a circle is π × r², where r is the radius.',
      tags: 'mathematics,geometry,formulas'
    }
  ]

  for (const flashcard of sampleFlashcards) {
    await prisma.flashcard.create({
      data: {
        ...flashcard,
        userId: testUser.id,
      },
    })
  }

  console.log('🎯 Created sample flashcards')

  // Create sample quiz
  const sampleQuiz = await prisma.quiz.create({
    data: {
      title: 'Basic Science Quiz',
      userId: testUser.id,
      questions: {
        questions: [
          {
            question: 'What is the chemical symbol for water?',
            options: ['H2O', 'CO2', 'O2', 'NaCl'],
            correct: 0,
            explanation: 'Water is composed of two hydrogen atoms and one oxygen atom, hence H2O.'
          },
          {
            question: 'What is the largest planet in our solar system?',
            options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
            correct: 2,
            explanation: 'Jupiter is the largest planet in our solar system by both mass and volume.'
          }
        ]
      },
    },
  })

  console.log('📝 Created sample quiz:', sampleQuiz.title)

  // Create sample quiz result
  await prisma.quizResult.create({
    data: {
      userId: testUser.id,
      quizId: sampleQuiz.id,
      score: 2,
      totalQuestions: 2,
      answers: {
        results: [
          { questionIndex: 0, selectedAnswer: 0, correct: true },
          { questionIndex: 1, selectedAnswer: 2, correct: true }
        ]
      },
    },
  })

  console.log('📊 Created sample quiz result')

  // Create sample study session
  await prisma.studySession.create({
    data: {
      userId: testUser.id,
      type: 'study_buddy',
      content: {
        conversation: [
          {
            question: 'What is machine learning?',
            answer: 'Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every task.'
          }
        ]
      },
    },
  })

  console.log('💬 Created sample study session')
  console.log('✅ Seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })