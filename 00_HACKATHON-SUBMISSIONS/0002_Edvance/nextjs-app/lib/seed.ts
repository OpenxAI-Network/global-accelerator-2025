import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seed() {
  try {
    console.log('🌱 Seeding database...')

    // Create demo users
    const demoStudent = await prisma.user.upsert({
      where: { email: 'student@university.edu' },
      update: {},
      create: {
        email: 'student@university.edu',
        name: 'Alice Student',
        role: 'STUDENT',
        isDemo: true
      }
    })

    const demoTeacher = await prisma.user.upsert({
      where: { email: 'teacher@university.edu' },
      update: {},
      create: {
        email: 'teacher@university.edu',
        name: 'Dr. Sarah Chen',
        role: 'TEACHER',
        isDemo: true
      }
    })

    const teacher2 = await prisma.user.upsert({
      where: { email: 'prof.rodriguez@university.edu' },
      update: {},
      create: {
        email: 'prof.rodriguez@university.edu',
        name: 'Prof. Michael Rodriguez',
        role: 'TEACHER',
        isDemo: false
      }
    })

    const teacher3 = await prisma.user.upsert({
      where: { email: 'dr.watson@university.edu' },
      update: {},
      create: {
        email: 'dr.watson@university.edu',
        name: 'Dr. Emily Watson',
        role: 'TEACHER',
        isDemo: false
      }
    })

    const teacher4 = await prisma.user.upsert({
      where: { email: 'prof.kim@university.edu' },
      update: {},
      create: {
        email: 'prof.kim@university.edu',
        name: 'Prof. David Kim',
        role: 'TEACHER',
        isDemo: false
      }
    })

    // Create demo classes
    const finc3012 = await prisma.class.upsert({
      where: { code: 'FINC3012' },
      update: {},
      create: {
        name: 'Derivative Securities',
        code: 'FINC3012',
        description: 'Advanced study of derivative instruments and their applications in financial markets.',
        semester: 'Semester 1, 2024',
        teacherId: demoTeacher.id
      }
    })

    const amme2000 = await prisma.class.upsert({
      where: { code: 'AMME2000' },
      update: {},
      create: {
        name: 'Engineering Analysis',
        code: 'AMME2000',
        description: 'Mathematical and computational methods for engineering problem solving.',
        semester: 'Semester 1, 2024',
        teacherId: teacher2.id
      }
    })

    const buss1000 = await prisma.class.upsert({
      where: { code: 'BUSS1000' },
      update: {},
      create: {
        name: 'Future of Business',
        code: 'BUSS1000',
        description: 'Exploring emerging business trends and digital transformation strategies.',
        semester: 'Semester 1, 2024',
        teacherId: teacher3.id
      }
    })

    const engg1810 = await prisma.class.upsert({
      where: { code: 'ENGG1810' },
      update: {},
      create: {
        name: 'Introduction to Engineering Computing',
        code: 'ENGG1810',
        description: 'Fundamentals of programming and computational thinking for engineers.',
        semester: 'Semester 1, 2024',
        teacherId: teacher4.id
      }
    })

    // Enroll student in all classes
    await prisma.classEnrollment.upsert({
      where: {
        userId_classId: {
          userId: demoStudent.id,
          classId: finc3012.id
        }
      },
      update: {},
      create: {
        userId: demoStudent.id,
        classId: finc3012.id
      }
    })

    await prisma.classEnrollment.upsert({
      where: {
        userId_classId: {
          userId: demoStudent.id,
          classId: amme2000.id
        }
      },
      update: {},
      create: {
        userId: demoStudent.id,
        classId: amme2000.id
      }
    })

    await prisma.classEnrollment.upsert({
      where: {
        userId_classId: {
          userId: demoStudent.id,
          classId: buss1000.id
        }
      },
      update: {},
      create: {
        userId: demoStudent.id,
        classId: buss1000.id
      }
    })

    await prisma.classEnrollment.upsert({
      where: {
        userId_classId: {
          userId: demoStudent.id,
          classId: engg1810.id
        }
      },
      update: {},
      create: {
        userId: demoStudent.id,
        classId: engg1810.id
      }
    })

    // Create some demo questions for ENGG1810
    const recursionQuestion = await prisma.question.create({
      data: {
        title: 'Understanding recursion',
        content: 'Can someone explain how recursion works in programming? I understand the concept but struggle with implementing it.',
        tags: JSON.stringify(['recursion', 'programming', 'help']),
        authorId: demoStudent.id,
        classId: engg1810.id
      }
    })

    // Create demo answer for recursion question
    await prisma.answer.create({
      data: {
        content: 'Recursion is when a function calls itself. You need a base case to stop and a recursive case that solves a smaller version of the problem. Think of it like Russian dolls - each one contains a smaller version. For example: factorial(n) = n * factorial(n-1) with base case factorial(0) = 1.',
        questionId: recursionQuestion.id,
        authorId: teacher4.id,
        isAiGenerated: false
      }
    })

    // Create demo questions for FINC3012
    await prisma.question.create({
      data: {
        title: 'Assignment 1 word count',
        content: 'What is the word limit for Assignment 1?',
        tags: JSON.stringify(['assignment', 'word-count']),
        authorId: demoStudent.id,
        classId: finc3012.id
      }
    })

    console.log('✅ Database seeded successfully!')
    console.log('Demo accounts created:')
    console.log('- Student: student@university.edu / Alice102!')
    console.log('- Teacher: teacher@university.edu / Chen102!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// Run the seed function if this file is executed directly
seed()
  .then(() => {
    console.log('Seeding completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Seeding failed:', error)
    process.exit(1)
  })

export { seed }
