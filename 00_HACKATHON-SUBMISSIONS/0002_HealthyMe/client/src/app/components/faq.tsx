"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDownIcon } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "What are the symptoms of COVID-19?",
    answer:
      "Common symptoms of COVID-19 include fever, dry cough, fatigue, loss of taste or smell, body aches, and difficulty breathing. Symptoms can range from mild to severe and may appear 2-14 days after exposure to the virus.",
  },
  {
    question: "How often should I have a general health check-up?",
    answer:
      "It's generally recommended to have a general health check-up once a year, especially for adults over 50. However, the frequency may vary based on your age, health condition, and risk factors. Consult with your doctor for personalized advice.",
  },
  {
    question: "What is the difference between a cold and the flu?",
    answer:
      "While both are respiratory illnesses, the flu is usually more severe than a cold. Flu symptoms come on suddenly and include fever, body aches, extreme tiredness, and dry cough. Colds typically have milder symptoms like runny or stuffy nose and generally don't result in serious health problems.",
  },
  {
    question: "How can I maintain a healthy diet?",
    answer:
      "A healthy diet includes a variety of fruits, vegetables, whole grains, lean proteins, and healthy fats. Limit processed foods, sugary drinks, and excessive salt. Stay hydrated and practice portion control. Consider consulting a nutritionist for personalized advice.",
  },
  {
    question: "What are the benefits of regular exercise?",
    answer:
      "Regular exercise offers numerous benefits including improved cardiovascular health, stronger bones and muscles, better weight management, reduced risk of chronic diseases, improved mental health and mood, better sleep, and increased energy levels.",
  },
]

const FAQItem: React.FC<{ item: FAQItem }> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      className="border-b border-purple-300 py-6"
      initial={false}
      animate={{ backgroundColor: isOpen ? "rgba(139, 92, 246, 0.1)" : "rgba(139, 92, 246, 0)" }}
      transition={{ duration: 0.3 }}
    >
      <button className="flex justify-between items-center w-full text-left" onClick={() => setIsOpen(!isOpen)}>
        <span className="text-lg font-semibold text-blue-800 rounded-md">{item.question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDownIcon className="w-6 h-6 text-blue-600" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <p className="mt-4 text-blue-700 rounded-md">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export const FAQ: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">Frequently Asked Questions</h2>
      {faqData.map((item, index) => (
        <FAQItem key={index} item={item} />
      ))}
    </div>
  )
}

