'use client'

import { motion } from 'framer-motion'
import { Github, Linkedin } from 'lucide-react'
import Link from 'next/link'
import { useAnimatedBorder } from './useAnimateBorder'
import mudit from "../../../public/mudit.jpg";
const teamMembers = [
  {
    name: 'Lakshay Singla',
    role: 'Frontend Developer',
    bio: 'Lakshay is a passionate frontend developer with 5 years of experience in creating responsive and user-friendly web applications.',
    expertise: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    github: 'https://github.com/lakshaysingla',
    linkedin: 'https://linkedin.com/in/lakshaysingla',
    image: 'https://media-del1-2.cdn.whatsapp.net/v/t61.24694-24/467633312_1109363767397988_4617440675999116441_n.jpg?ccb=11-4&oh=01_Q5AaIFoKRhs0J2OfStXmBAK13wtP_LxOe0I8B_taxyx_UXln&oe=678CF5BE&_nc_sid=5e03e0&_nc_cat=107'
  },
  {
    name: 'Naman Bansal',
    role: 'Backend Developer',
    bio: 'Naman is an experienced backend developer specializing in scalable server-side applications and database management.',
    expertise: ['Node.js', 'Express', 'MongoDB', 'GraphQL'],
    github: 'https://github.com/namanbansal',
    linkedin: 'https://linkedin.com/in/namanbansal',
    image: 'https://avatars.githubusercontent.com/u/131576334?v=4'
  },
  {
    name: 'Kriti Aggarwal',
    role: 'AI Specialist',
    bio: 'Kriti is an AI researcher with a focus on machine learning applications in healthcare, particularly in image analysis and predictive modeling.',
    expertise: ['Machine Learning', 'Computer Vision', 'TensorFlow', 'PyTorch'],
    github: 'https://github.com/kritiaggarwal',
    linkedin: 'https://linkedin.com/in/kritiaggarwal',
    image: '/placeholder.svg?height=200&width=200'
  },
  {
    name: 'Mudit Goel',
    role: 'Data Scientist',
    bio: 'Mudit is a data scientist with expertise in statistical analysis and predictive modeling, focusing on healthcare data interpretation.',
    expertise: ['Python', 'R', 'Data Visualization', 'Statistical Modeling'],
    github: 'https://github.com/muditgoel',
    linkedin: 'https://linkedin.com/in/muditgoel',
    image: mudit.src
  }
]

export default function AboutPage() {
  const gradientPosition = useAnimatedBorder()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8 text-center">About Our Project</h1>
        
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12 p-6 bg-white bg-opacity-10 rounded-lg shadow-lg relative overflow-hidden"
          style={{
            backgroundImage: `radial-gradient(circle at ${gradientPosition.x}% ${gradientPosition.y}%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
          }}
        >
          <div className="relative z-10">
            <h2 className="text-2xl font-semibold mb-4">AI-Powered Healthcare Management System</h2>
            <p className="mb-4">
              Our project is an innovative healthcare management system that leverages artificial intelligence for the early detection of heart and lung problems. By utilizing advanced machine learning algorithms and medical imaging analysis, we aim to revolutionize preventive healthcare and improve patient outcomes.
            </p>
            <p>
              This MIT-licensed project combines cutting-edge technology with medical expertise to provide accurate and timely diagnoses, enabling healthcare professionals to intervene early and develop personalized treatment plans.
            </p>
          </div>
        </motion.section>

        <h2 className="text-3xl font-bold mb-6 text-center">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              className="p-6 bg-white bg-opacity-10 rounded-lg shadow-lg relative overflow-hidden"
              style={{
                backgroundImage: `radial-gradient(circle at ${gradientPosition.x}% ${gradientPosition.y}%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
              }}
            >
              <div className="relative z-10 flex flex-col items-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <p className="text-lg mb-2">{member.role}</p>
                <p className="text-sm mb-4 text-center">{member.bio}</p>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {member.expertise.map((skill) => (
                    <span key={skill} className="bg-blue-500 bg-opacity-50 px-2 py-1 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex space-x-4">
                  <Link href={member.github} target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">
                    <Github size={24} />
                  </Link>
                  <Link href={member.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">
                    <Linkedin size={24} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-sm">
            © {new Date().getFullYear()} AI-Powered Healthcare Management System. Licensed under MIT.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

