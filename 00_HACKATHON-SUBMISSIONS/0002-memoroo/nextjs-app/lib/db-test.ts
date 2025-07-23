import { prisma } from './prisma'

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test user queries
    const userCount = await prisma.user.count()
    console.log(`👥 Users in database: ${userCount}`)
    
    // Test flashcard queries
    const flashcardCount = await prisma.flashcard.count()
    console.log(`🎯 Flashcards in database: ${flashcardCount}`)
    
    // Test quiz queries
    const quizCount = await prisma.quiz.count()
    console.log(`📝 Quizzes in database: ${quizCount}`)
    
    // Test quiz results
    const quizResultCount = await prisma.quizResult.count()
    console.log(`📊 Quiz results in database: ${quizResultCount}`)
    
    // Test study sessions
    const studySessionCount = await prisma.studySession.count()
    console.log(`💬 Study sessions in database: ${studySessionCount}`)
    
    // Test a complex query with relations
    const userWithData = await prisma.user.findFirst({
      include: {
        flashcards: true,
        quizzes: true,
        quizResults: true,
        studySessions: true,
      },
    })
    
    if (userWithData) {
      console.log(`\n🎉 Found user: ${userWithData.email}`)
      console.log(`   - ${userWithData.flashcards.length} flashcards`)
      console.log(`   - ${userWithData.quizzes.length} quizzes`)
      console.log(`   - ${userWithData.quizResults.length} quiz results`)
      console.log(`   - ${userWithData.studySessions.length} study sessions`)
    }
    
    console.log('\n✅ Database connection test passed!')
    return true
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test if called directly
if (require.main === module) {
  testDatabaseConnection()
}

export { testDatabaseConnection }