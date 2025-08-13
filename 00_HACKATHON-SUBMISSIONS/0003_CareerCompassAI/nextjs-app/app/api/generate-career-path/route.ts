import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { profile, preferences, language } = await req.json()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile data is required' },
        { status: 400 }
      )
    }

    // Simulate AI career analysis and generate suggestions
    const careerSuggestions = await generateCareerSuggestions(profile, preferences, language)

    return NextResponse.json({
      success: true,
      suggestions: careerSuggestions,
      message: language === 'hi' 
        ? 'आपके लिए करियर सुझाव तैयार किए गए हैं' 
        : 'Career suggestions generated successfully'
    })

  } catch (error) {
    console.error('Career path generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate career path' },
      { status: 500 }
    )
  }
}

async function generateCareerSuggestions(profile: any, preferences: any, language: string) {
  // Mock career matching algorithm
  const allCareers = [
    {
      id: '1',
      title: 'Full Stack Developer',
      description: 'Build end-to-end web applications using modern technologies like React, Node.js, and cloud platforms.',
      skills: [
        { name: 'JavaScript', type: 'technical', level: 'advanced', importance: 'critical' },
        { name: 'React', type: 'technical', level: 'advanced', importance: 'critical' },
        { name: 'Node.js', type: 'technical', level: 'intermediate', importance: 'high' },
        { name: 'Problem Solving', type: 'soft', level: 'advanced', importance: 'high' }
      ],
      salaryRange: {
        min: 600000,
        max: 1500000,
        currency: 'INR',
        period: 'yearly',
        location: 'Bangalore'
      },
      growthPotential: {
        score: 85,
        timeline: '2-3 years',
        nextRoles: ['Senior Developer', 'Tech Lead', 'Engineering Manager'],
        marketDemand: 'very_high'
      },
      workEnvironment: {
        type: profile.workStyle === 'remote' ? 'remote' : 'hybrid',
        teamSize: 'medium',
        pace: 'fast',
        travelRequired: false
      },
      requirements: {
        education: ['bachelors'],
        experience: '1-3 years in web development',
        certifications: [],
        softSkills: ['Communication', 'Teamwork', 'Problem Solving'],
        technicalSkills: ['JavaScript', 'React', 'Node.js', 'Git']
      },
      matchScore: calculateMatchScore(profile, 'fullstack'),
      trending: true,
      remote: true
    },
    {
      id: '2',
      title: 'Data Scientist',
      description: 'Analyze complex datasets to extract insights and build predictive models using Python, SQL, and machine learning.',
      skills: [
        { name: 'Python', type: 'technical', level: 'advanced', importance: 'critical' },
        { name: 'SQL', type: 'technical', level: 'advanced', importance: 'critical' },
        { name: 'Machine Learning', type: 'technical', level: 'intermediate', importance: 'high' },
        { name: 'Statistics', type: 'domain', level: 'advanced', importance: 'critical' }
      ],
      salaryRange: {
        min: 800000,
        max: 2000000,
        currency: 'INR',
        period: 'yearly',
        location: 'Mumbai'
      },
      growthPotential: {
        score: 90,
        timeline: '3-4 years',
        nextRoles: ['Senior Data Scientist', 'ML Engineer', 'Data Science Manager'],
        marketDemand: 'very_high'
      },
      workEnvironment: {
        type: 'remote',
        teamSize: 'small',
        pace: 'moderate',
        travelRequired: false
      },
      requirements: {
        education: ['masters'],
        experience: '2-4 years in data analysis',
        certifications: ['Data Science Certification'],
        softSkills: ['Analytical Thinking', 'Communication'],
        technicalSkills: ['Python', 'SQL', 'Pandas', 'Scikit-learn']
      },
      matchScore: calculateMatchScore(profile, 'datascience'),
      trending: true,
      remote: true
    },
    {
      id: '3',
      title: 'UI/UX Designer',
      description: 'Create intuitive and beautiful user interfaces for web and mobile applications through user research and design.',
      skills: [
        { name: 'Figma', type: 'technical', level: 'advanced', importance: 'critical' },
        { name: 'User Research', type: 'domain', level: 'intermediate', importance: 'high' },
        { name: 'Prototyping', type: 'technical', level: 'advanced', importance: 'high' },
        { name: 'Creative Thinking', type: 'soft', level: 'advanced', importance: 'critical' }
      ],
      salaryRange: {
        min: 500000,
        max: 1200000,
        currency: 'INR',
        period: 'yearly',
        location: 'Delhi'
      },
      growthPotential: {
        score: 75,
        timeline: '2-3 years',
        nextRoles: ['Senior Designer', 'Design Lead', 'Product Designer'],
        marketDemand: 'high'
      },
      workEnvironment: {
        type: 'hybrid',
        teamSize: 'small',
        pace: 'moderate',
        travelRequired: false
      },
      requirements: {
        education: ['bachelors'],
        experience: '1-3 years in design',
        certifications: [],
        softSkills: ['Creativity', 'Communication', 'Empathy'],
        technicalSkills: ['Figma', 'Adobe Creative Suite', 'Prototyping']
      },
      matchScore: calculateMatchScore(profile, 'design'),
      trending: false,
      remote: true
    },
    {
      id: '4',
      title: 'Digital Marketing Manager',
      description: 'Plan and execute digital marketing campaigns across multiple channels to drive brand awareness and growth.',
      skills: [
        { name: 'Digital Marketing', type: 'domain', level: 'advanced', importance: 'critical' },
        { name: 'Analytics', type: 'technical', level: 'intermediate', importance: 'high' },
        { name: 'Content Strategy', type: 'domain', level: 'intermediate', importance: 'high' },
        { name: 'Leadership', type: 'soft', level: 'intermediate', importance: 'high' }
      ],
      salaryRange: {
        min: 700000,
        max: 1500000,
        currency: 'INR',
        period: 'yearly',
        location: 'Pune'
      },
      growthPotential: {
        score: 80,
        timeline: '2-4 years',
        nextRoles: ['Senior Marketing Manager', 'Marketing Director', 'CMO'],
        marketDemand: 'high'
      },
      workEnvironment: {
        type: 'hybrid',
        teamSize: 'medium',
        pace: 'fast',
        travelRequired: true
      },
      requirements: {
        education: ['bachelors'],
        experience: '3-5 years in marketing',
        certifications: ['Google Analytics', 'HubSpot'],
        softSkills: ['Communication', 'Creativity', 'Leadership'],
        technicalSkills: ['Google Analytics', 'Social Media Platforms', 'Email Marketing']
      },
      matchScore: calculateMatchScore(profile, 'marketing'),
      trending: true,
      remote: false
    },
    {
      id: '5',
      title: 'Product Manager',
      description: 'Drive product strategy and roadmap, working with cross-functional teams to deliver user-focused solutions.',
      skills: [
        { name: 'Product Strategy', type: 'domain', level: 'advanced', importance: 'critical' },
        { name: 'User Research', type: 'domain', level: 'intermediate', importance: 'high' },
        { name: 'Project Management', type: 'soft', level: 'advanced', importance: 'critical' },
        { name: 'Data Analysis', type: 'technical', level: 'intermediate', importance: 'high' }
      ],
      salaryRange: {
        min: 1000000,
        max: 2500000,
        currency: 'INR',
        period: 'yearly',
        location: 'Bangalore'
      },
      growthPotential: {
        score: 88,
        timeline: '3-5 years',
        nextRoles: ['Senior Product Manager', 'Director of Product', 'CPO'],
        marketDemand: 'very_high'
      },
      workEnvironment: {
        type: 'hybrid',
        teamSize: 'large',
        pace: 'fast',
        travelRequired: false
      },
      requirements: {
        education: ['bachelors', 'masters'],
        experience: '4-7 years in product or related field',
        certifications: ['Product Management Certificate'],
        softSkills: ['Leadership', 'Communication', 'Strategic Thinking'],
        technicalSkills: ['Analytics Tools', 'Project Management Software', 'User Research']
      },
      matchScore: calculateMatchScore(profile, 'product'),
      trending: true,
      remote: true
    }
  ]

  // Filter and sort careers based on profile match
  let matchedCareers = allCareers.map(career => ({
    ...career,
    matchScore: calculateDetailedMatchScore(profile, career)
  }))

  // Sort by match score
  matchedCareers.sort((a, b) => b.matchScore - a.matchScore)

  // Return top matches
  return matchedCareers.slice(0, 8)
}

function calculateMatchScore(profile: any, careerType: string): number {
  let score = 60 // Base score

  const userSkills = profile.skills || []
  const userInterests = profile.interests || []

  // Skill matching
  if (careerType === 'fullstack') {
    if (userSkills.some((s: string) => s.toLowerCase().includes('javascript'))) score += 15
    if (userSkills.some((s: string) => s.toLowerCase().includes('react'))) score += 10
    if (userSkills.some((s: string) => s.toLowerCase().includes('web'))) score += 10
    if (userInterests.some((i: string) => i.toLowerCase().includes('technology'))) score += 10
  }

  if (careerType === 'datascience') {
    if (userSkills.some((s: string) => s.toLowerCase().includes('python'))) score += 15
    if (userSkills.some((s: string) => s.toLowerCase().includes('data'))) score += 15
    if (userSkills.some((s: string) => s.toLowerCase().includes('analysis'))) score += 10
    if (userInterests.some((i: string) => i.toLowerCase().includes('technology'))) score += 5
  }

  if (careerType === 'design') {
    if (userSkills.some((s: string) => s.toLowerCase().includes('design'))) score += 20
    if (userSkills.some((s: string) => s.toLowerCase().includes('figma'))) score += 10
    if (userSkills.some((s: string) => s.toLowerCase().includes('creative'))) score += 10
    if (userInterests.some((i: string) => i.toLowerCase().includes('design'))) score += 10
  }

  if (careerType === 'marketing') {
    if (userSkills.some((s: string) => s.toLowerCase().includes('marketing'))) score += 20
    if (userSkills.some((s: string) => s.toLowerCase().includes('communication'))) score += 10
    if (userInterests.some((i: string) => i.toLowerCase().includes('marketing'))) score += 15
  }

  if (careerType === 'product') {
    if (userSkills.some((s: string) => s.toLowerCase().includes('management'))) score += 15
    if (userSkills.some((s: string) => s.toLowerCase().includes('leadership'))) score += 10
    if (userInterests.some((i: string) => i.toLowerCase().includes('technology'))) score += 10
  }

  // Experience level matching
  if (profile.experience === 'beginner') score += 5
  if (profile.experience === 'intermediate') score += 10
  if (profile.experience === 'advanced') score += 15

  // Education level bonus
  if (profile.education === 'masters' || profile.education === 'phd') score += 5

  return Math.min(Math.max(score, 45), 98) // Clamp between 45-98
}

function calculateDetailedMatchScore(profile: any, career: any): number {
  let score = 0
  let maxScore = 0

  // Skills matching (40% weight)
  const userSkills = (profile.skills || []).map((s: string) => s.toLowerCase())
  const careerSkills = career.skills.map((s: any) => s.name.toLowerCase())
  
  const skillMatches = careerSkills.filter((skill: string) => 
    userSkills.some((userSkill: string) => 
      userSkill.includes(skill) || skill.includes(userSkill)
    )
  ).length

  score += (skillMatches / careerSkills.length) * 40
  maxScore += 40

  // Interest matching (25% weight)
  const userInterests = (profile.interests || []).map((i: string) => i.toLowerCase())
  const careerField = career.title.toLowerCase()
  
  let interestMatch = 0
  if (userInterests.some((interest: any) => careerField.includes(interest))) {
    interestMatch = 25
  } else if (userInterests.length > 0) {
    // Partial match based on related interests
    interestMatch = 10
  }
  
  score += interestMatch
  maxScore += 25

  // Experience level matching (15% weight)
  const expLevels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 }
  const userExpLevel = expLevels[profile.experience as keyof typeof expLevels] || 1
  const careerExpRequirement = career.requirements.experience.includes('1-3') ? 2 : 
                              career.requirements.experience.includes('3-5') ? 3 : 2

  const expMatch = Math.max(0, 15 - Math.abs(userExpLevel - careerExpRequirement) * 5)
  score += expMatch
  maxScore += 15

  // Work style matching (10% weight)
  if (profile.workStyle === 'hybrid' && career.workEnvironment.type === 'hybrid') {
    score += 10
  } else if (profile.workStyle === 'remote' && career.remote) {
    score += 10
  } else if (profile.workStyle === 'team' && career.workEnvironment.teamSize !== 'solo') {
    score += 8
  } else {
    score += 5
  }
  maxScore += 10

  // Location preference (5% weight)
  if (profile.location && career.salaryRange.location) {
    if (profile.location.toLowerCase().includes(career.salaryRange.location.toLowerCase()) ||
        career.salaryRange.location.toLowerCase().includes(profile.location.toLowerCase())) {
      score += 5
    } else if (career.remote) {
      score += 5
    } else {
      score += 2
    }
  } else {
    score += 3
  }
  maxScore += 5

  // Education matching (5% weight)
  const userEd = profile.education
  const requiredEd = career.requirements.education
  
  if (requiredEd.includes(userEd)) {
    score += 5
  } else if (userEd === 'masters' || userEd === 'phd') {
    score += 5 // Higher education is generally positive
  } else {
    score += 2
  }
  maxScore += 5

  // Convert to percentage and add some randomization for variety
  const percentage = Math.round((score / maxScore) * 100)
  const variation = Math.floor(Math.random() * 6) - 3 // ±3 points
  
  return Math.min(Math.max(percentage + variation, 45), 98)
}