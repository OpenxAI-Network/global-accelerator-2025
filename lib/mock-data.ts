import type { Growther, Mission, Circle, TokenPosition, TimelineEvent, Post } from "./types"

// 生成100个多样化的假用户
const generateMockUsers = () => {
  const realNames = [
    "Alex Chen", "Maya Rodriguez", "David Kim", "Sarah Liu", "Michael Zhang", "Emma Johnson", "Ryan Patel", "Sofia Garcia",
    "James Wilson", "Priya Sharma", "Lucas Brown", "Zoe Martinez", "Ethan Davis", "Aria Singh", "Noah Thompson", "Mia Wang",
    "Oliver Lee", "Isabella Chen", "Liam Anderson", "Ava Kumar", "William Taylor", "Charlotte Wu", "Benjamin Clark", "Amelia Lopez",
    "Henry Miller", "Harper Zhang", "Alexander Moore", "Evelyn Patel", "Daniel Garcia", "Abigail Johnson", "Matthew Rodriguez",
    "Emily Davis", "Joseph Wilson", "Elizabeth Kim", "Christopher Lee", "Sofia Anderson", "Andrew Chen", "Victoria Martinez",
    "Joshua Brown", "Grace Liu", "Ryan Thompson", "Chloe Wang", "Nicholas Taylor", "Lily Singh", "Tyler Clark", "Zara Patel"
  ]
  
  const creativeNames = [
    "CryptoNinja", "PixelMaster", "CodeWizard", "DesignGuru", "TechSavvy", "DataDriven", "BlockchainBeast", "AIEnthusiast",
    "WebDevPro", "UXMagician", "StartupHustle", "InnovationLab", "DigitalNomad", "TechExplorer", "CodeCrafter", "DesignThink",
    "FutureBuilder", "TechVision", "DigitalArt", "CodePoet", "DesignFlow", "TechMind", "PixelPerfect", "CodeGenius",
    "DesignSpark", "TechInnovate", "DigitalCraft", "CodeMaster", "DesignLab", "TechCreative", "PixelCraft", "CodeArtist",
    "DesignCore", "TechFusion", "DigitalEdge", "CodeVision", "DesignWave", "TechPulse", "PixelForge", "CodeStream",
    "DesignSync", "TechBoost", "DigitalFlow", "CodeRush", "DesignPeak", "TechSphere", "PixelStorm", "CodeFlash",
    "DesignZen", "TechNova", "DigitalVibe", "CodeBlaze", "DesignFlex", "TechWave"
  ]
  
  const domains = ["AI & Research", "Design & UX", "Blockchain & DeFi", "Climate & Impact", "Web Development", "Data Science", "Fintech", "Art & Creative", "Education", "Healthcare Tech"]
  const countries = ["Singapore", "USA", "Canada", "UK", "Germany", "Japan", "South Korea", "Australia", "Netherlands", "Sweden", "Switzerland", "France", "Spain", "Italy", "Brazil", "India", "China", "Mexico"]
  const schools = ["MIT", "Stanford", "Harvard", "UC Berkeley", "CMU", "Oxford", "Cambridge", "ETH Zurich", "NUS", "NTU", "KAIST", "University of Tokyo", "Tsinghua", "Peking University", "IIT", "ITESM", "UofT", "McGill"]
  
  const tagOptions = [
    ["AI", "MachineLearning", "Research", "OpenSource"],
    ["Design", "UX", "UI", "Creative"],
    ["Web3", "Blockchain", "DeFi", "Crypto"],
    ["ClimaTech", "Sustainability", "GreenTech", "Impact"],
    ["Frontend", "Backend", "FullStack", "JavaScript"],
    ["DataScience", "Analytics", "BigData", "Python"],
    ["Fintech", "Trading", "Investment", "Banking"],
    ["Art", "NFT", "Digital", "Creative"],
    ["Education", "Learning", "Teaching", "EdTech"],
    ["HealthTech", "MedTech", "Biotech", "Wellness"]
  ]
  
  const taglines = [
    "Building the future of decentralized AI",
    "Design systems that change behavior",
    "Democratizing DeFi for everyone",
    "Sustainable tech entrepreneur",
    "Full-stack developer passionate about Web3",
    "Data scientist turning insights into action",
    "Fintech innovator disrupting traditional banking",
    "Digital artist exploring NFT possibilities",
    "EdTech pioneer making learning accessible",
    "HealthTech developer improving patient outcomes",
    "Blockchain enthusiast building tomorrow",
    "UX designer crafting delightful experiences",
    "AI researcher pushing boundaries",
    "Climate tech advocate for a greener future",
    "Creative technologist bridging art and code"
  ]
  
  const bios = [
    "AI researcher and open-source contributor working on democratizing artificial intelligence through blockchain technology.",
    "Product designer specializing in behavioral psychology and user experience design for Web3 applications.",
    "Full-stack developer building accessible DeFi tools and educational platforms for financial inclusion.",
    "Building climate-tech solutions and leading sustainability initiatives in the tech industry.",
    "Passionate about creating scalable web applications that solve real-world problems.",
    "Data scientist with expertise in machine learning and predictive analytics for business intelligence.",
    "Fintech entrepreneur developing innovative solutions for digital payments and financial inclusion.",
    "Digital artist and NFT creator exploring the intersection of technology and creative expression.",
    "Educational technology specialist focused on personalized learning experiences.",
    "Healthcare technology developer working on telemedicine and patient care solutions."
  ]
  
  const users = []
  const allNames = [...realNames, ...creativeNames]
  
  for (let i = 0; i < 100; i++) {
    const domainIndex = i % domains.length
    const nameIndex = i % allNames.length
    const gxp = Math.floor(Math.random() * 5000) + 500
    const supporters = Math.floor(Math.random() * 300) + 10
    const yoloPrice = (Math.random() * 3 + 0.1).toFixed(1)
    const growthRate = (Math.random() > 0.3 ? "+" : "-") + (Math.random() * 50 + 1).toFixed(0) + "%"
    
    users.push({
      id: (i + 1).toString(),
      name: allNames[nameIndex],
      avatar: "/placeholder.svg?height=80&width=80",
      tagline: taglines[i % taglines.length],
      bio: bios[i % bios.length],
      gxp,
      supporters,
      tags: tagOptions[domainIndex],
      yoloPrice: `${yoloPrice} YOLO`,
      growthRate,
      country: countries[i % countries.length],
      school: schools[i % schools.length],
      domain: domains[domainIndex],
      isRising: Math.random() > 0.4,
      joinedDate: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      totalEarned: `${(parseFloat(yoloPrice) * (supporters / 100)).toFixed(1)} YOLO`
    })
  }
  
  return users
}

export const mockGrowthers: Growther[] = generateMockUsers()

// 生成更多任务数据
const generateMockMissions = () => {
  const missionTemplates = {
    AI: [
      {
        title: "AI Model Optimization Challenge",
        description: "Build and optimize a machine learning model that achieves 95%+ accuracy on the provided dataset.",
        difficulty: "Hard",
        gxpReward: 500,
        yoloReward: "0.2 YOLO"
      },
      {
        title: "Computer Vision Project",
        description: "Develop an image recognition system for medical diagnosis with 90%+ accuracy.",
        difficulty: "Hard",
        gxpReward: 600,
        yoloReward: "0.25 YOLO"
      },
      {
        title: "NLP Sentiment Analysis",
        description: "Create a sentiment analysis model for social media posts with multilingual support.",
        difficulty: "Medium",
        gxpReward: 400,
        yoloReward: "0.15 YOLO"
      }
    ],
    Design: [
      {
        title: "Design System Documentation",
        description: "Create comprehensive documentation for a design system including components, guidelines, and usage examples.",
        difficulty: "Medium",
        gxpReward: 300,
        yoloReward: "0.1 YOLO"
      },
      {
        title: "Mobile App UI/UX Redesign",
        description: "Redesign a mobile app interface to improve user experience and accessibility.",
        difficulty: "Medium",
        gxpReward: 350,
        yoloReward: "0.12 YOLO"
      },
      {
        title: "Brand Identity Creation",
        description: "Design a complete brand identity including logo, colors, typography, and guidelines.",
        difficulty: "Hard",
        gxpReward: 450,
        yoloReward: "0.18 YOLO"
      }
    ],
    Web3: [
      {
        title: "DeFi Protocol Development",
        description: "Build a decentralized finance protocol with yield farming and staking features.",
        difficulty: "Hard",
        gxpReward: 700,
        yoloReward: "0.3 YOLO"
      },
      {
        title: "NFT Marketplace Creation",
        description: "Develop a full-featured NFT marketplace with minting, trading, and royalty features.",
        difficulty: "Hard",
        gxpReward: 650,
        yoloReward: "0.28 YOLO"
      },
      {
        title: "DAO Governance System",
        description: "Create a decentralized autonomous organization with voting and proposal mechanisms.",
        difficulty: "Medium",
        gxpReward: 500,
        yoloReward: "0.2 YOLO"
      }
    ],
    Climate: [
      {
        title: "Carbon Footprint Tracker",
        description: "Build an application to track and reduce personal or corporate carbon emissions.",
        difficulty: "Medium",
        gxpReward: 400,
        yoloReward: "0.15 YOLO"
      },
      {
        title: "Renewable Energy Dashboard",
        description: "Create a dashboard to monitor and optimize renewable energy usage.",
        difficulty: "Medium",
        gxpReward: 450,
        yoloReward: "0.18 YOLO"
      }
    ],
    Education: [
      {
        title: "Interactive Learning Platform",
        description: "Develop a gamified learning platform for STEM education with progress tracking.",
        difficulty: "Medium",
        gxpReward: 400,
        yoloReward: "0.15 YOLO"
      },
      {
        title: "Virtual Classroom System",
        description: "Build a comprehensive virtual classroom with video conferencing and collaboration tools.",
        difficulty: "Hard",
        gxpReward: 550,
        yoloReward: "0.22 YOLO"
      }
    ],
    OpenSource: [
      {
        title: "Open Source Contribution Sprint",
        description: "Make meaningful contributions to 3 different open source projects in your domain.",
        difficulty: "Medium",
        gxpReward: 400,
        yoloReward: "0.15 YOLO"
      },
      {
        title: "Developer Tool Creation",
        description: "Create and open source a developer tool that solves a common problem.",
        difficulty: "Hard",
        gxpReward: 500,
        yoloReward: "0.2 YOLO"
      }
    ]
  }
  
  const missions: Mission[] = []
  let missionId = 1
  
  // 为每个类别生成任务
  Object.entries(missionTemplates).forEach(([category, templates]) => {
    templates.forEach(template => {
      const progress = Math.floor(Math.random() * 100)
      const participants = Math.floor(Math.random() * 80) + 10
      const daysFromNow = Math.floor(Math.random() * 60) + 10
      const deadline = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      missions.push({
        id: missionId.toString(),
        title: template.title,
        description: template.description,
        gxpReward: template.gxpReward,
        yoloReward: template.yoloReward,
        difficulty: template.difficulty as "Easy" | "Medium" | "Hard",
        category,
        progress,
        deadline,
        participants,
        isCompleted: progress === 100
      })
      
      missionId++
    })
  })
  
  return missions
}

export const mockMissions: Mission[] = generateMockMissions()

// 生成更多圈子数据
const generateMockCircles = () => {
  const circleData = [
    {
      name: "AI Innovators",
      description: "A community of AI researchers, engineers, and enthusiasts pushing the boundaries of artificial intelligence.",
      icon: "🤖",
      tags: ["AI", "MachineLearning", "Research"],
      baseMembers: 1200
    },
    {
      name: "Web3 Builders",
      description: "Developers and entrepreneurs building the decentralized future with blockchain technology.",
      icon: "⛓️",
      tags: ["Web3", "Blockchain", "DeFi"],
      baseMembers: 890
    },
    {
      name: "Design Collective",
      description: "Creative minds shaping the future of digital experiences and user interfaces.",
      icon: "🎨",
      tags: ["Design", "UX", "Creative"],
      baseMembers: 630
    },
    {
      name: "Climate Tech Alliance",
      description: "Innovators working on sustainable technology solutions for climate change.",
      icon: "🌱",
      tags: ["ClimaTech", "Sustainability", "GreenTech"],
      baseMembers: 450
    },
    {
      name: "Fintech Pioneers",
      description: "Financial technology experts revolutionizing banking and payments.",
      icon: "💰",
      tags: ["Fintech", "Banking", "Payments"],
      baseMembers: 780
    },
    {
      name: "Data Science Hub",
      description: "Data scientists and analysts sharing insights and methodologies.",
      icon: "📊",
      tags: ["DataScience", "Analytics", "BigData"],
      baseMembers: 920
    },
    {
      name: "Digital Artists",
      description: "Creative community exploring NFTs, digital art, and creative technology.",
      icon: "🎭",
      tags: ["Art", "NFT", "Digital", "Creative"],
      baseMembers: 560
    },
    {
      name: "EdTech Innovators",
      description: "Educators and technologists transforming learning experiences.",
      icon: "📚",
      tags: ["Education", "Learning", "EdTech"],
      baseMembers: 340
    },
    {
      name: "HealthTech Community",
      description: "Healthcare professionals and developers improving patient care through technology.",
      icon: "🏥",
      tags: ["HealthTech", "MedTech", "Healthcare"],
      baseMembers: 290
    },
    {
      name: "Startup Founders",
      description: "Entrepreneurs sharing experiences and building the next generation of companies.",
      icon: "🚀",
      tags: ["Startup", "Entrepreneurship", "Business"],
      baseMembers: 1100
    }
  ]

  const activities = [
    "new discussions this week",
    "projects launched this month",
    "challenges completed",
    "members joined recently",
    "events organized",
    "collaborations started",
    "resources shared",
    "mentorship sessions"
  ]

  return circleData.map((circle, index) => ({
    id: (index + 1).toString(),
    name: circle.name,
    description: circle.description,
    icon: circle.icon,
    memberCount: circle.baseMembers + Math.floor(Math.random() * 200),
    tags: circle.tags,
    isJoined: Math.random() > 0.6, // 40%的圈子已加入
    isPublic: true,
    recentActivity: `${Math.floor(Math.random() * 25) + 5} ${activities[Math.floor(Math.random() * activities.length)]}`
  }))
}

export const mockCircles: Circle[] = generateMockCircles()

// 生成更多代币持仓数据
const generateMockTokenPositions = () => {
  const positions = []
  
  // 为前50个用户生成代币持仓
  for (let i = 1; i <= 50; i++) {
    const user = mockGrowthers[i - 1]
    const amount = Math.floor(Math.random() * 20) + 1 // 1-20个代币
    const avgPrice = (Math.random() * 2 + 0.5).toFixed(1) // 0.5-2.5 YOLO
    const currentPrice = (Math.random() * 3 + 0.3).toFixed(1) // 0.3-3.3 YOLO
    const avgPriceNum = parseFloat(avgPrice)
    const currentPriceNum = parseFloat(currentPrice)
    const gainLoss = ((currentPriceNum - avgPriceNum) * amount).toFixed(1)
    const gainLossPercent = (((currentPriceNum - avgPriceNum) / avgPriceNum) * 100).toFixed(1)
    
    positions.push({
      growtherId: i.toString(),
      growtherName: user.name,
      amount,
      avgPrice: `${avgPrice} YOLO`,
      currentPrice: `${currentPrice} YOLO`,
      gainLoss: `${parseFloat(gainLoss) >= 0 ? '+' : ''}${gainLoss} YOLO`,
      gainLossPercent: `${parseFloat(gainLossPercent) >= 0 ? '+' : ''}${gainLossPercent}%`
    })
  }
  
  return positions
}

export const mockTokenPositions: TokenPosition[] = generateMockTokenPositions()

// 生成更多时间线事件
const generateMockTimelineEvents = () => {
  const eventTypes = {
    mission: {
      titles: [
        "Completed AI Model Optimization",
        "Finished Design System Challenge",
        "Built DeFi Protocol",
        "Launched Climate Tech Solution",
        "Created Educational Platform",
        "Developed Health Tech App",
        "Open Source Contribution Sprint",
        "Data Analysis Project",
        "Fintech Innovation Challenge",
        "Digital Art NFT Collection"
      ],
      descriptions: [
        "Successfully optimized neural network achieving 97% accuracy",
        "Created comprehensive design system with 50+ components",
        "Built and deployed smart contracts for yield farming",
        "Developed carbon tracking solution for enterprises",
        "Launched personalized learning platform for students",
        "Created telemedicine app improving patient access",
        "Made meaningful contributions to 5 open source projects",
        "Analyzed large dataset revealing key business insights",
        "Developed innovative payment solution for SMEs",
        "Created and sold limited edition digital art collection"
      ],
      icon: "🎯"
    },
    badge: {
      titles: [
        'Earned "AI Pioneer" Badge',
        'Earned "Design Master" Badge',
        'Earned "DeFi Expert" Badge',
        'Earned "Climate Leader" Badge',
        'Earned "Tech Innovator" Badge',
        'Earned "Data Guru" Badge',
        'Earned "Fintech Pro" Badge',
        'Earned "Art Creator" Badge',
        'Earned "Edu Expert" Badge',
        'Earned "Health Tech" Badge'
      ],
      descriptions: [
        "Recognized for outstanding contributions to AI research",
        "Acknowledged for exceptional design leadership",
        "Certified as DeFi protocol expert",
        "Honored for climate technology innovation",
        "Awarded for breakthrough technology solutions",
        "Recognized for data science excellence",
        "Certified as fintech industry leader",
        "Acknowledged for creative digital art",
        "Honored for educational technology impact",
        "Recognized for healthcare innovation"
      ],
      icon: "🏆"
    },
    circle: {
      titles: [
        "Joined AI Innovators Circle",
        "Joined Web3 Builders Circle",
        "Joined Design Collective Circle",
        "Joined Climate Tech Alliance",
        "Joined Fintech Pioneers Circle",
        "Joined Data Science Hub",
        "Joined Digital Artists Circle",
        "Joined EdTech Innovators",
        "Joined HealthTech Community",
        "Joined Startup Founders Circle"
      ],
      descriptions: [
        "Became a member of the AI research community",
        "Joined the decentralized future builders",
        "Connected with creative design minds",
        "Joined sustainable technology innovators",
        "Became part of financial technology experts",
        "Joined data scientists and analysts community",
        "Connected with digital art creators",
        "Joined educational technology pioneers",
        "Became part of healthcare tech community",
        "Joined entrepreneurial founders network"
      ],
      icon: "👥"
    },
    investment: {
      titles: [
        "Received Major Investment",
        "Token Launch Success",
        "Crowdfunding Milestone",
        "VC Partnership Secured",
        "Angel Investment Round",
        "Community Funding Goal",
        "Strategic Investment",
        "Seed Funding Completed",
        "Series A Announcement",
        "Token Sale Success"
      ],
      descriptions: [
        "VentureDAO invested 2.5 YOLO in growth potential",
        "Successfully launched personal token with 1000+ supporters",
        "Reached crowdfunding goal of 5 YOLO in 24 hours",
        "Secured partnership with leading VC firm",
        "Completed angel investment round of 3.2 YOLO",
        "Community raised 4.8 YOLO for project development",
        "Strategic investor committed 6.1 YOLO for expansion",
        "Completed seed funding round of 2.9 YOLO",
        "Announced Series A funding of 8.5 YOLO",
        "Token sale exceeded target by 150%"
      ],
      icon: "💰"
    },
    milestone: {
      titles: [
        "Reached 2000 GXP Milestone",
        "Hit 5000 GXP Achievement",
        "Crossed 1000 Supporters",
        "Achieved 10x Growth",
        "Reached Top 10 Ranking",
        "Completed 100 Missions",
        "Built 50+ Connections",
        "Generated 1M+ Views",
        "Earned 100 YOLO Tokens",
        "Reached Influencer Status"
      ],
      descriptions: [
        "Achieved significant growth milestone through consistent effort",
        "Reached major GXP milestone with outstanding performance",
        "Built strong community of 1000+ supporters",
        "Achieved 10x growth in token value over 6 months",
        "Entered top 10 ranking in price rising category",
        "Completed 100 missions across multiple domains",
        "Built network of 50+ meaningful professional connections",
        "Content generated over 1 million views across platforms",
        "Accumulated 100 YOLO tokens through various activities",
        "Achieved influencer status with 5000+ followers"
      ],
      icon: "🚀"
    }
  }
  
  const events = []
  let eventId = 1
  
  // 为每个用户生成1-3个时间线事件
  for (let userId = 1; userId <= 100; userId++) {
    const numEvents = Math.floor(Math.random() * 3) + 1
    
    for (let i = 0; i < numEvents; i++) {
      const types = Object.keys(eventTypes) as (keyof typeof eventTypes)[]
      const type = types[Math.floor(Math.random() * types.length)]
      const typeData = eventTypes[type]
      const titleIndex = Math.floor(Math.random() * typeData.titles.length)
      
      const daysAgo = Math.floor(Math.random() * 60) + 1
      const eventDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      const dateString = eventDate.toISOString().split('T')[0]
      
      const event: TimelineEvent = {
        id: eventId.toString(),
        type,
        title: typeData.titles[titleIndex],
        description: typeData.descriptions[titleIndex],
        date: dateString,
        icon: typeData.icon
      }
      
      // 为mission和milestone类型添加GXP奖励
      if (type === 'mission' || type === 'milestone') {
        event.gxpEarned = Math.floor(Math.random() * 500) + 100
      }
      
      events.push(event)
      eventId++
    }
  }
  
  // 按日期排序，最新的在前
  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const mockTimelineEvents: TimelineEvent[] = generateMockTimelineEvents()

// 生成多维度排行榜数据
const generateMockRankingData = () => {
  const badges = ["AI Pioneer", "Design Lead", "DeFi Expert", "Climate Leader", "Tech Innovator", "Data Guru", "Fintech Pro", "Art Creator", "Edu Expert", "Health Tech"]
  
  // 价格上涨排行
  const priceRising = mockGrowthers
    .filter(user => user.growthRate.startsWith('+'))
    .sort((a, b) => parseFloat(b.growthRate.replace(/[+%]/g, '')) - parseFloat(a.growthRate.replace(/[+%]/g, '')))
    .slice(0, 20)
    .map(user => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      value: `${user.gxp.toLocaleString()} GXP`,
      change: user.growthRate,
      price: user.yoloPrice,
      marketCap: `${(parseFloat(user.yoloPrice.split(' ')[0]) * user.supporters / 100).toFixed(1)} YOLO`,
      badge: badges[parseInt(user.id) % badges.length],
      country: user.country,
      school: user.school
    }))
  
  // 市值排行
  const marketCap = mockGrowthers
    .map(user => ({
      ...user,
      marketCapValue: parseFloat(user.yoloPrice.split(' ')[0]) * user.supporters
    }))
    .sort((a, b) => b.marketCapValue - a.marketCapValue)
    .slice(0, 20)
    .map(user => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      value: `${user.gxp.toLocaleString()} GXP`,
      change: user.growthRate,
      price: user.yoloPrice,
      marketCap: `${(user.marketCapValue / 100).toFixed(1)} YOLO`,
      badge: badges[parseInt(user.id) % badges.length],
      country: user.country,
      school: user.school
    }))
  
  // GXP排行
  const gxpLeaders = mockGrowthers
    .sort((a, b) => b.gxp - a.gxp)
    .slice(0, 20)
    .map(user => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      value: `${user.gxp.toLocaleString()} GXP`,
      change: user.growthRate,
      price: user.yoloPrice,
      marketCap: `${(parseFloat(user.yoloPrice.split(' ')[0]) * user.supporters / 100).toFixed(1)} YOLO`,
      badge: badges[parseInt(user.id) % badges.length],
      country: user.country,
      school: user.school
    }))
  
  // 新秀排行（最近加入且表现好的）
  const hotNewcomers = mockGrowthers
    .filter(user => {
      const joinDate = new Date(user.joinedDate)
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
      return joinDate > threeMonthsAgo && user.growthRate.startsWith('+')
    })
    .sort((a, b) => b.gxp - a.gxp)
    .slice(0, 20)
    .map(user => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      value: `${user.gxp.toLocaleString()} GXP`,
      change: user.growthRate,
      price: user.yoloPrice,
      marketCap: `${(parseFloat(user.yoloPrice.split(' ')[0]) * user.supporters / 100).toFixed(1)} YOLO`,
      badge: badges[parseInt(user.id) % badges.length],
      country: user.country,
      school: user.school
    }))
  
  return {
    priceRising,
    marketCap,
    gxpLeaders,
    hotNewcomers
  }
}

export const mockRankingData = generateMockRankingData()

// 生成多样化的多语言帖子内容
const generateMockPosts = () => {
  const postTemplates = {
    // 英语帖子模板 (70%)
    english: {
      learning: [
        "Just completed an online course on {topic}! Learned so many practical techniques, especially {detail}. Highly recommend it to anyone interested in {field}! 🚀",
        "Attended {event} today and gained so much knowledge! {insight}. Looking forward to applying these learnings to real projects.",
        "Sharing a learning tip: {tip}. This method has helped me make significant progress in {field}.",
        "Finished reading '{book}' and gained deeper understanding of {topic}. {reflection}. Strongly recommend!",
        "Participated in {program} bootcamp. {duration} of learning gave me fresh insights into {skill}. {achievement}."
      ],
      career: [
        "Just completed an important {project} project! Learned a lot about {skill} through team collaboration. {result}. 💪",
        "Today's work made me realize {insight}. In the {field} industry, {principle} is really important.",
        "Sharing a career experience: {advice}. Hope this helps friends who are {situation}.",
        "Attended company's {event} and got inspired by conversations with {people}. {learning}.",
        "After {duration} of hard work, finally achieved breakthrough in {area}! {achievement}. Thanks to the team's support!"
      ],
      tech: [
        "Just released a new {project}! Built with {technology} stack, featuring {feature}. Welcome to try it out and provide feedback! 🔥",
        "Solved a long-standing {problem} today. Turns out it was a {solution} issue. {learning}.",
        "Sharing a {technology} tip: {tip}. This approach can {benefit}.",
        "Attended {event} tech conference. {speaker}'s talk gave me new perspectives on {topic}. {insight}.",
        "Open-sourced a {tool} tool to help {audience} better {purpose}. GitHub link in comments!"
      ],
      web3: [
        "The Web3 world is full of possibilities! Just tried {protocol}, {experience}. The decentralized future is getting closer! 🌐",
        "Participated in {project}'s testnet. The {feature} design is very creative. {opinion}.",
        "DeFi protocol {protocol} just launched {feature} functionality. {analysis}. What do you think?",
        "Recent {trend} in NFT market is interesting. {observation}. The combination of art and technology is always surprising.",
        "DAO governance {aspect} made me think a lot. {reflection}. What will the future of decentralized organizations look like?"
      ],
      art: [
        "Just finished a new {medium} artwork! Inspired by {inspiration}. {description}. The creative process is always full of surprises! 🎨",
        "Visited {exhibition} exhibition today. {artist}'s work deeply inspired me. {impression}.",
        "Sharing a creative technique: {technique}. This method helped me breakthrough in {style} style.",
        "Exploring {technology} applications in art creation. {experiment}. The fusion of tech and art is fascinating!",
        "Participated in {event} art festival. Exchanges with other artists gave me many new ideas. {insight}."
      ],
      finance: [
        "Today's market {movement} reminded me of the {principle} investment principle. {analysis}. 📈",
        "Sharing a financial tip: {advice}. {explanation}. Hope this helps everyone!",
        "Just finished reading {report} report. Gained new insights into {sector} industry. {insight}.",
        "Attended {event} investment forum. {speaker}'s views on {topic} were very inspiring. {takeaway}.",
        "The {concept} concept in economics applied to {application} impressed me. {reflection}."
      ],
      // 新增研究型内容模板
      research_ai: [
        "📊 Deep dive into {research_topic}: After analyzing {dataset_size} data points, discovered that {finding}. The implications for {application} are significant. Key metrics: {metrics}. Full paper: {link} 🧠",
        "🔬 Research breakthrough: Our {model_type} model achieved {performance}% accuracy on {benchmark}. Novel approach: {innovation}. This could revolutionize {industry}. Peer review pending. #AIResearch",
        "📈 Comparative study results: Tested {algorithm_a} vs {algorithm_b} on {task}. {algorithm_a} outperformed by {improvement}% in {metric}. Surprising finding: {insight}. Methodology details in thread 🧵",
        "🎯 Meta-analysis of {studies_count} studies on {topic} reveals: {conclusion}. Effect size: {effect_size}. Confidence interval: {ci}. This challenges the conventional wisdom about {assumption}.",
        "⚡ Real-world deployment insights: Implemented {technology} in production for {duration}. Performance: {performance_metric}. Lessons learned: {lessons}. Cost reduction: {savings}%. Open-sourcing soon!"
      ],
      research_blockchain: [
        "🔗 On-chain analysis reveals: {protocol} TVL patterns show {trend} correlation with {factor}. Analyzed {timeframe} of data. Key insight: {insight}. This suggests {implication} for DeFi strategies.",
        "📊 Smart contract audit findings: Reviewed {contracts_count} contracts, found {vulnerabilities} critical issues. Most common: {common_issue}. Security score improved from {before} to {after}. Report: {link}",
        "⛓️ Cross-chain bridge efficiency study: Compared {bridge_a} vs {bridge_b}. Average transaction time: {time_a} vs {time_b}. Cost analysis: {cost_comparison}. Recommendation: {recommendation}",
        "🏛️ DAO governance analysis: Studied {dao_count} DAOs over {period}. Voter participation: {participation}%. Most effective proposal type: {proposal_type}. Governance token distribution impact: {impact}",
        "💎 NFT market dynamics: Floor price correlation with {factor} shows {correlation}%. Volume analysis indicates {trend}. Rarity vs price elasticity: {elasticity}. Market efficiency: {efficiency}%"
      ],
      research_design: [
        "🎨 UX Research findings: A/B tested {design_a} vs {design_b} with {sample_size} users. Conversion improved by {improvement}%. Key insight: {insight}. User satisfaction: {satisfaction}%. Implementing changes.",
        "📱 Accessibility audit results: Tested {product} against WCAG 2.1 AA standards. Compliance: {compliance}%. Top issues: {issues}. Remediation plan reduces barriers for {affected_users}% of users.",
        "🧠 Cognitive load study: Measured task completion time for {interface_type}. Average time: {time}s. Error rate: {error_rate}%. Mental effort score: {effort}/10. Design recommendations: {recommendations}",
        "📊 Design system impact analysis: After implementing {design_system}, development speed increased {speed_increase}%, consistency improved {consistency}%, maintenance cost reduced {cost_reduction}%.",
        "🎯 User journey optimization: Mapped {touchpoints} touchpoints, identified {friction_points} friction points. Conversion funnel improved from {before}% to {after}%. ROI: {roi}x investment."
      ],
      research_climate: [
        "🌍 Climate data analysis: {region} temperature trends show {trend} over {timeframe}. Correlation with {factor}: {correlation}. Projected impact: {impact}. Mitigation strategies: {strategies}",
        "🔋 Renewable energy efficiency study: Solar panel performance in {conditions} shows {efficiency}% efficiency. Cost per kWh: ${cost}. Payback period: {payback} years. Grid integration challenges: {challenges}",
        "🌱 Carbon footprint assessment: Analyzed {company_type} operations. Emissions: {emissions} tCO2e/year. Reduction potential: {reduction}%. Top interventions: {interventions}. Cost-benefit: {cost_benefit}",
        "🌊 Ocean acidification research: pH levels in {location} decreased by {decrease} over {period}. Marine life impact: {impact}%. Correlation with {factor}: {correlation}. Conservation recommendations: {recommendations}",
        "♻️ Circular economy case study: {company} achieved {waste_reduction}% waste reduction through {strategy}. Cost savings: ${savings}. Environmental impact: {impact}. Scalability assessment: {scalability}"
      ],
      research_health: [
        "🧬 Biomarker study results: Analyzed {sample_size} samples for {condition}. Sensitivity: {sensitivity}%, Specificity: {specificity}%. Novel biomarker {biomarker} shows {correlation} correlation. Clinical trial next.",
        "💊 Drug interaction analysis: Studied {drug_combinations} combinations in {population}. Adverse events: {ae_rate}%. Most significant interaction: {interaction}. Safety profile: {safety}. Dosage recommendations updated.",
        "🏥 Healthcare workflow optimization: Implemented {intervention} in {setting}. Patient wait time reduced {reduction}%. Staff efficiency improved {improvement}%. Patient satisfaction: {satisfaction}%. Cost impact: ${cost}",
        "📊 Epidemiological findings: {disease} prevalence in {population} is {prevalence}%. Risk factors: {risk_factors}. Protective factors: {protective_factors}. Public health implications: {implications}",
        "🧠 Mental health intervention study: {intervention} showed {effectiveness}% improvement in {metric} over {duration}. Sample size: {n}. Effect size: {effect_size}. Scalability potential: {scalability}"
      ]
    },
    // 法语帖子模板 (10%)
    french: {
      learning: [
        "Je viens de terminer un cours en ligne sur {topic}! J'ai appris tellement de techniques pratiques, surtout {detail}. Je le recommande vivement à tous ceux qui s'intéressent à {field}! 🚀",
        "J'ai assisté à {event} aujourd'hui et j'ai acquis tant de connaissances! {insight}. J'ai hâte d'appliquer ces apprentissages à de vrais projets."
      ],
      tech: [
        "Je viens de publier un nouveau {project}! Construit avec la stack {technology}, avec {feature}. N'hésitez pas à l'essayer et à donner vos commentaires! 🔥",
        "J'ai résolu un {problem} persistant aujourd'hui. Il s'avère que c'était un problème de {solution}. {learning}."
      ],
      career: [
        "Je viens de terminer un projet {project} important! J'ai beaucoup appris sur {skill} grâce à la collaboration d'équipe. {result}. 💪",
        "Le travail d'aujourd'hui m'a fait réaliser {insight}. Dans l'industrie {field}, {principle} est vraiment important."
      ],
      research_ai: [
        "📊 Analyse approfondie de {research_topic}: Après avoir analysé {dataset_size} points de données, découvert que {finding}. Les implications pour {application} sont significatives. Métriques clés: {metrics}. 🧠"
      ],
      research_blockchain: [
        "🔗 L'analyse on-chain révèle: Les modèles TVL de {protocol} montrent une corrélation {trend} avec {factor}. Analysé {timeframe} de données. Insight clé: {insight}."
      ],
      research_design: [
        "🎨 Résultats de recherche UX: Test A/B de {design_a} vs {design_b} avec {sample_size} utilisateurs. Conversion améliorée de {improvement}%. Insight clé: {insight}."
      ],
      research_climate: [
        "🌍 Analyse des données climatiques: Les tendances de température de {region} montrent {trend} sur {timeframe}. Corrélation avec {factor}: {correlation}."
      ],
      research_health: [
        "🧬 Résultats d'étude de biomarqueurs: Analysé {sample_size} échantillons pour {condition}. Sensibilité: {sensitivity}%, Spécificité: {specificity}%."
      ]
    },
    // 俄语帖子模板 (10%)
    russian: {
      learning: [
        "Только что завершил онлайн-курс по {topic}! Изучил много практических техник, особенно {detail}. Настоятельно рекомендую всем, кто интересуется {field}! 🚀",
        "Сегодня посетил {event} и получил столько знаний! {insight}. С нетерпением жду применения этих знаний в реальных проектах."
      ],
      tech: [
        "Только что выпустил новый {project}! Построен на стеке {technology}, с функцией {feature}. Добро пожаловать попробовать и оставить отзыв! 🔥",
        "Сегодня решил давнюю проблему {problem}. Оказалось, это была проблема {solution}. {learning}."
      ],
      career: [
        "Только что завершил важный проект {project}! Многому научился о {skill} благодаря командной работе. {result}. 💪",
        "Сегодняшняя работа заставила меня понять {insight}. В индустрии {field} {principle} действительно важен."
      ],
      research_ai: [
        "📊 Глубокий анализ {research_topic}: После анализа {dataset_size} точек данных обнаружил, что {finding}. Последствия для {application} значительны. Ключевые метрики: {metrics}. 🧠"
      ],
      research_blockchain: [
        "🔗 Анализ on-chain показывает: Паттерны TVL {protocol} показывают корреляцию {trend} с {factor}. Проанализированы данные за {timeframe}. Ключевое понимание: {insight}."
      ],
      research_design: [
        "🎨 Результаты UX исследования: A/B тест {design_a} против {design_b} с {sample_size} пользователями. Конверсия улучшилась на {improvement}%. Ключевое понимание: {insight}."
      ],
      research_climate: [
        "🌍 Анализ климатических данных: Температурные тренды {region} показывают {trend} за {timeframe}. Корреляция с {factor}: {correlation}."
      ],
      research_health: [
        "🧬 Результаты исследования биомаркеров: Проанализированы {sample_size} образцов для {condition}. Чувствительность: {sensitivity}%, Специфичность: {specificity}%."
      ]
    },
    // 德语帖子模板 (10%)
    german: {
      learning: [
        "Habe gerade einen Online-Kurs über {topic} abgeschlossen! So viele praktische Techniken gelernt, besonders {detail}. Kann es jedem empfehlen, der sich für {field} interessiert! 🚀",
        "Heute an {event} teilgenommen und so viel Wissen erhalten! {insight}. Freue mich darauf, diese Erkenntnisse in echten Projekten anzuwenden."
      ],
      tech: [
        "Habe gerade ein neues {project} veröffentlicht! Mit {technology} Stack gebaut, mit {feature}. Probiert es gerne aus und gebt Feedback! 🔥",
        "Heute ein langjähriges {problem} gelöst. Stellte sich heraus, es war ein {solution} Problem. {learning}."
      ],
      career: [
        "Habe gerade ein wichtiges {project} Projekt abgeschlossen! Viel über {skill} durch Teamarbeit gelernt. {result}. 💪",
        "Die heutige Arbeit ließ mich {insight} erkennen. In der {field} Branche ist {principle} wirklich wichtig."
      ],
      research_ai: [
        "📊 Tiefgehende Analyse von {research_topic}: Nach Analyse von {dataset_size} Datenpunkten entdeckt, dass {finding}. Die Auswirkungen für {application} sind bedeutend. Schlüsselmetriken: {metrics}. 🧠"
      ],
      research_blockchain: [
        "🔗 On-Chain-Analyse zeigt: {protocol} TVL-Muster zeigen {trend} Korrelation mit {factor}. {timeframe} Daten analysiert. Schlüsselerkenntnis: {insight}."
      ],
      research_design: [
        "🎨 UX-Forschungsergebnisse: A/B-Test {design_a} vs {design_b} mit {sample_size} Nutzern. Konversion um {improvement}% verbessert. Schlüsselerkenntnis: {insight}."
      ],
      research_climate: [
        "🌍 Klimadatenanalyse: Temperaturtrends in {region} zeigen {trend} über {timeframe}. Korrelation mit {factor}: {correlation}."
      ],
      research_health: [
        "🧬 Biomarker-Studienergebnisse: {sample_size} Proben für {condition} analysiert. Sensitivität: {sensitivity}%, Spezifität: {specificity}%."
      ]
    }
  }
  
  const badges = ["AI Pioneer", "Design Lead", "DeFi Expert", "Climate Leader", "Tech Innovator", "Data Guru", "Fintech Pro", "Art Creator", "Edu Expert", "Health Tech"]
  
  const posts = []
  let postId = 1
  
  // 为每个用户生成2-5个帖子
  for (let userId = 1; userId <= 100; userId++) {
    const user = mockGrowthers[userId - 1]
    const numPosts = Math.floor(Math.random() * 4) + 2 // 2-5个帖子
    
    for (let i = 0; i < numPosts; i++) {
      // 根据比例选择语言：70%英语，10%法语，10%俄语，10%德语
      const languageRandom = Math.random()
      let selectedLanguage: 'english' | 'french' | 'russian' | 'german'
      
      if (languageRandom < 0.7) {
        selectedLanguage = 'english'
      } else if (languageRandom < 0.8) {
        selectedLanguage = 'french'
      } else if (languageRandom < 0.9) {
        selectedLanguage = 'russian'
      } else {
        selectedLanguage = 'german'
      }
      
      const languageTemplates = postTemplates[selectedLanguage]
      const categories = Object.keys(languageTemplates) as (keyof typeof languageTemplates)[]
      
      // 30% 概率选择研究型内容
      let category: keyof typeof languageTemplates
      if (Math.random() < 0.3) {
        // 根据用户领域选择对应的研究型模板
        const domain = user.domain.toLowerCase()
        if (domain.includes('ai') && languageTemplates.research_ai) {
          category = 'research_ai'
        } else if (domain.includes('blockchain') && languageTemplates.research_blockchain) {
          category = 'research_blockchain'
        } else if (domain.includes('design') && languageTemplates.research_design) {
          category = 'research_design'
        } else if (domain.includes('climate') && languageTemplates.research_climate) {
          category = 'research_climate'
        } else if (domain.includes('health') && languageTemplates.research_health) {
          category = 'research_health'
        } else {
          // 如果没有匹配的研究型模板，随机选择一个研究型模板
          const researchCategories = categories.filter(cat => cat.toString().startsWith('research_'))
          if (researchCategories.length > 0) {
            category = researchCategories[Math.floor(Math.random() * researchCategories.length)]
          } else {
            category = categories[Math.floor(Math.random() * categories.length)]
          }
        }
      } else {
        // 70% 概率选择普通内容
        const normalCategories = categories.filter(cat => !cat.toString().startsWith('research_'))
        category = normalCategories[Math.floor(Math.random() * normalCategories.length)]
      }
      
      const templates = languageTemplates[category]
      const template = templates[Math.floor(Math.random() * templates.length)]
      
      // 根据用户领域和语言生成相关内容
      let content = template
      const domain = user.domain.toLowerCase()
      
      // 根据语言和领域设置占位符
      const getPlaceholders = (lang: string, domain: string) => {
        const basePlaceholders = {
          english: {
            ai: { topic: 'machine learning algorithms', technology: 'PyTorch', field: 'AI research', skill: 'deep learning' },
            design: { topic: 'user experience design', technology: 'Figma', field: 'design', skill: 'UI design' },
            blockchain: { topic: 'smart contract development', technology: 'Solidity', field: 'Web3', skill: 'DeFi protocols' },
            default: { topic: 'full-stack development', technology: 'React', field: 'software development', skill: 'frontend development' }
          },
          french: {
            ai: { topic: 'algorithmes d\'apprentissage automatique', technology: 'PyTorch', field: 'recherche IA', skill: 'apprentissage profond' },
            design: { topic: 'conception d\'expérience utilisateur', technology: 'Figma', field: 'design', skill: 'conception UI' },
            blockchain: { topic: 'développement de contrats intelligents', technology: 'Solidity', field: 'Web3', skill: 'protocoles DeFi' },
            default: { topic: 'développement full-stack', technology: 'React', field: 'développement logiciel', skill: 'développement frontend' }
          },
          russian: {
            ai: { topic: 'алгоритмы машинного обучения', technology: 'PyTorch', field: 'исследования ИИ', skill: 'глубокое обучение' },
            design: { topic: 'дизайн пользовательского опыта', technology: 'Figma', field: 'дизайн', skill: 'UI дизайн' },
            blockchain: { topic: 'разработка смарт-контрактов', technology: 'Solidity', field: 'Web3', skill: 'DeFi протоколы' },
            default: { topic: 'full-stack разработка', technology: 'React', field: 'разработка ПО', skill: 'frontend разработка' }
          },
          german: {
            ai: { topic: 'Machine Learning Algorithmen', technology: 'PyTorch', field: 'KI-Forschung', skill: 'Deep Learning' },
            design: { topic: 'User Experience Design', technology: 'Figma', field: 'Design', skill: 'UI Design' },
            blockchain: { topic: 'Smart Contract Entwicklung', technology: 'Solidity', field: 'Web3', skill: 'DeFi Protokolle' },
            default: { topic: 'Full-Stack Entwicklung', technology: 'React', field: 'Softwareentwicklung', skill: 'Frontend Entwicklung' }
          }
        }
        
        const langPlaceholders = basePlaceholders[lang as keyof typeof basePlaceholders]
        const lowerDomain = domain.toLowerCase()
        if (lowerDomain.includes('ai')) return langPlaceholders.ai
        if (lowerDomain.includes('design')) return langPlaceholders.design
        if (lowerDomain.includes('blockchain') || lowerDomain.includes('defi')) return langPlaceholders.blockchain
        return langPlaceholders.default
      }
      
      const domainPlaceholders = getPlaceholders(selectedLanguage, domain)
      
      // 替换领域相关占位符
      content = content.replace('{topic}', domainPlaceholders.topic)
                      .replace('{technology}', domainPlaceholders.technology)
                      .replace('{field}', domainPlaceholders.field)
                      .replace('{skill}', domainPlaceholders.skill)
      
      // 替换其他占位符
      content = content.replace(/{[^}]+}/g, (match: string) => {
        const placeholdersByLanguage = {
          english: {
            '{detail}': 'algorithm optimization techniques',
            '{event}': 'tech meetup',
            '{insight}': 'the importance of teamwork',
            '{tip}': 'practice makes perfect',
            '{book}': 'Deep Learning',
            '{reflection}': 'theory and practice go hand in hand',
            '{program}': 'coding bootcamp',
            '{duration}': 'three months',
            '{achievement}': 'successfully completed the project',
            '{project}': 'open source project',
            '{result}': 'received great user feedback',
            '{advice}': 'keep learning mindset',
            '{situation}': 'looking for career direction',
            '{people}': 'industry experts',
            '{learning}': 'broadened my perspective',
            '{area}': 'tech innovation',
            '{feature}': 'clean and intuitive interface',
            '{problem}': 'performance bottleneck',
            '{solution}': 'caching strategy',
            '{benefit}': 'improve development efficiency',
            '{speaker}': 'tech guru',
            '{tool}': 'development tool',
            '{audience}': 'developers',
            '{purpose}': 'solve real problems',
            '{protocol}': 'Uniswap',
            '{experience}': 'great user experience',
            '{opinion}': 'worth watching',
            '{analysis}': 'positive market response',
            '{trend}': 'development trend',
            '{observation}': 'highly innovative',
            '{aspect}': 'voting mechanism',
            '{medium}': 'digital art',
            '{inspiration}': 'natural scenery',
            '{description}': 'harmonious color scheme',
            '{exhibition}': 'modern art',
            '{artist}': 'renowned artist',
            '{impression}': 'breathtaking',
            '{technique}': 'gradient layering',
            '{style}': 'abstract expression',
            '{experiment}': 'exceeded expectations',
            '{movement}': 'volatility',
            '{principle}': 'value investing',
            '{explanation}': 'diversification reduces risk',
            '{report}': 'industry analysis',
            '{sector}': 'technology',
            '{takeaway}': 'long-term investing is more stable',
            '{concept}': 'compound interest',
            '{application}': 'investment management',
            // 研究型内容占位符
            '{research_topic}': 'neural network optimization',
            '{dataset_size}': '1.2M',
            '{finding}': 'attention mechanisms improve accuracy by 15%',
            '{metrics}': 'F1: 0.94, Precision: 0.92',
            '{link}': 'arxiv.org/abs/2024.001',
            '{model_type}': 'transformer',
            '{performance}': '94.2',
            '{benchmark}': 'ImageNet',
            '{innovation}': 'multi-head cross-attention',
            '{industry}': 'computer vision',
            '{algorithm_a}': 'BERT',
            '{algorithm_b}': 'GPT-4',
            '{task}': 'sentiment analysis',
            '{improvement}': '12.5',
            '{metric}': 'accuracy',
            '{studies_count}': '127',
            '{conclusion}': 'early intervention significantly improves outcomes',
            '{effect_size}': '0.73',
            '{ci}': '95% [0.65, 0.81]',
            '{assumption}': 'linear scaling',
            '{performance_metric}': '99.9% uptime, 50ms latency',
            '{lessons}': 'edge caching is crucial',
            '{savings}': '35',
            '{timeframe}': '6 months',
            '{implication}': 'higher yields during volatility',
            '{contracts_count}': '45',
            '{vulnerabilities}': '3',
            '{common_issue}': 'reentrancy attacks',
            '{before}': '6.2/10',
            '{after}': '9.1/10',
            '{bridge_a}': 'LayerZero',
            '{bridge_b}': 'Wormhole',
            '{time_a}': '2.3min',
            '{time_b}': '4.1min',
            '{cost_comparison}': '$12 vs $18 average',
            '{recommendation}': 'use LayerZero for speed',
            '{dao_count}': '23',
            '{period}': '12 months',
            '{participation}': '34.2',
            '{proposal_type}': 'treasury allocation',
            '{impact}': 'concentration reduces participation',
            '{factor}': 'social media mentions',
            '{correlation}': '0.67',
            '{elasticity}': '1.34',
            '{efficiency}': '78.2',
            '{design_a}': 'minimalist layout',
            '{design_b}': 'detailed interface',
            '{sample_size}': '2,847',
            '{satisfaction}': '4.2/5',
            '{product}': 'mobile app',
            '{compliance}': '87',
            '{issues}': 'color contrast, keyboard navigation',
            '{affected_users}': '23',
            '{interface_type}': 'dashboard interface',
            '{time}': '34.2',
            '{error_rate}': '2.1',
            '{effort}': '6.8',
            '{recommendations}': 'reduce cognitive load by 40%',
            '{design_system}': 'unified component library',
            '{speed_increase}': '45',
            '{consistency}': '89',
            '{cost_reduction}': '32',
            '{touchpoints}': '12',
            '{friction_points}': '4',
            '{roi}': '3.2',
            '{region}': 'Arctic region',
             '{conditions}': 'low-light conditions',
             '{solar_efficiency}': '23.4',
             '{energy_cost}': '0.08',
             '{payback}': '7.2',
             '{challenges}': 'grid stability',
             '{company_type}': 'manufacturing',
             '{emissions}': '1,240',
             '{reduction}': '42',
             '{interventions}': 'renewable energy, efficiency',
             '{cost_benefit}': '$2.3M savings over 5 years',
             '{location}': 'Pacific Ocean',
             '{decrease}': '0.12 pH units',
             '{strategies}': 'emission reduction, carbon capture',
             '{company}': 'Tesla',
             '{waste_reduction}': '67',
             '{strategy}': 'closed-loop manufacturing',
             '{research_scalability}': 'high potential',
            '{condition}': 'early-stage cancer',
            '{sensitivity}': '92.3',
            '{specificity}': '88.7',
            '{biomarker}': 'circulating tumor DNA',
            '{drug_combinations}': '156',
            '{population}': 'elderly patients',
            '{ae_rate}': '8.2',
            '{interaction}': 'warfarin + aspirin',
            '{safety}': 'acceptable with monitoring',
            '{intervention}': 'AI-powered triage',
            '{setting}': 'emergency department',
            '{disease}': 'Type 2 diabetes',
            '{prevalence}': '11.3',
            '{risk_factors}': 'obesity, sedentary lifestyle',
            '{protective_factors}': 'regular exercise, healthy diet',
            '{implications}': 'need for prevention programs',
            '{effectiveness}': '68',
            '{n}': '1,234',
            '{effect_size}': '0.82',
            '{health_scalability}': 'high'
          },
          french: {
            '{detail}': 'techniques d\'optimisation d\'algorithmes',
            '{event}': 'rencontre tech',
            '{insight}': 'l\'importance du travail d\'équipe',
            '{tip}': 'la pratique rend parfait',
            '{book}': 'Apprentissage Profond',
            '{reflection}': 'théorie et pratique vont de pair',
            '{program}': 'bootcamp de programmation',
            '{duration}': 'trois mois',
            '{achievement}': 'projet terminé avec succès',
            '{project}': 'projet open source',
            '{result}': 'reçu d\'excellents retours utilisateurs',
            '{advice}': 'garder un esprit d\'apprentissage',
            '{situation}': 'cherchant une direction de carrière',
            '{people}': 'experts de l\'industrie',
            '{learning}': 'élargi ma perspective',
            '{area}': 'innovation technologique'
          },
          russian: {
            '{detail}': 'техники оптимизации алгоритмов',
            '{event}': 'технологическая встреча',
            '{insight}': 'важность командной работы',
            '{tip}': 'практика - путь к совершенству',
            '{book}': 'Глубокое обучение',
            '{reflection}': 'теория и практика идут рука об руку',
            '{program}': 'буткемп по программированию',
            '{duration}': 'три месяца',
            '{achievement}': 'успешно завершил проект',
            '{project}': 'проект с открытым кодом',
            '{result}': 'получил отличные отзывы пользователей',
            '{advice}': 'сохранять обучающий настрой',
            '{situation}': 'ищущим направление карьеры',
            '{people}': 'эксперты индустрии',
            '{learning}': 'расширил мою перспективу',
            '{area}': 'технологические инновации'
          },
          german: {
            '{detail}': 'Algorithmus-Optimierungstechniken',
            '{event}': 'Tech-Meetup',
            '{insight}': 'die Wichtigkeit von Teamwork',
            '{tip}': 'Übung macht den Meister',
            '{book}': 'Deep Learning',
            '{reflection}': 'Theorie und Praxis gehen Hand in Hand',
            '{program}': 'Programmier-Bootcamp',
            '{duration}': 'drei Monate',
            '{achievement}': 'Projekt erfolgreich abgeschlossen',
            '{project}': 'Open-Source-Projekt',
            '{result}': 'großartiges Nutzerfeedback erhalten',
            '{advice}': 'Lernbereitschaft bewahren',
            '{situation}': 'nach Karriererichtung suchend',
            '{people}': 'Branchenexperten',
            '{learning}': 'erweiterte meine Perspektive',
            '{area}': 'technologische Innovation'
          }
        }
        
        const langPlaceholders = placeholdersByLanguage[selectedLanguage] as Record<string, string>
         return langPlaceholders[match] || 'relevant content'
      })
      
      const likes = Math.floor(Math.random() * 500) + 10
      const comments = Math.floor(Math.random() * 50) + 1
      const shares = Math.floor(Math.random() * 20) + 1
      const dailyLikes = Math.floor(likes * (Math.random() * 0.3 + 0.1))
      const weeklyLikes = Math.floor(likes * (Math.random() * 0.8 + 0.2))
      
      const daysAgo = Math.floor(Math.random() * 30) + 1
      const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
      
      posts.push({
        id: postId.toString(),
        userId: userId.toString(),
        userName: user.name,
        userAvatar: "/placeholder.svg?height=40&width=40",
        userBadge: badges[Math.floor(userId / 10) % badges.length],
        content,
        timestamp,
        likes,
        comments,
        shares,
        isLiked: Math.random() > 0.7,
        dailyLikes,
        weeklyLikes
      })
      
      postId++
    }
  }
  
  return posts
}

// 用户帖子数据
export const mockPosts: Post[] = generateMockPosts()

// 获取用户的帖子
export const getUserPosts = (userId: string): Post[] => {
  return mockPosts.filter(post => post.userId === userId)
}

// 获取每日热门帖子（按每日点赞数排序）
export const getDailyHotPosts = (): Post[] => {
  return [...mockPosts]
    .sort((a, b) => (b.dailyLikes || 0) - (a.dailyLikes || 0))
    .slice(0, 5)
}

// 获取每周热门帖子（按每周点赞数排序）
export const getWeeklyHotPosts = (): Post[] => {
  return [...mockPosts]
    .sort((a, b) => (b.weeklyLikes || 0) - (a.weeklyLikes || 0))
    .slice(0, 5)
}

// 获取最新帖子（按时间排序）
export const getLatestPosts = (limit: number = 5): Post[] => {
  return [...mockPosts]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
}
