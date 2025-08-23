"use client";

import { motion } from "framer-motion";
import { Bot, Microscope, Target, TrendingUp } from "lucide-react";
import { useInView } from "react-intersection-observer";

import { fadeInUp, hoverScale, staggerContainer } from "@/lib/animations";

export const Features = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const features = [
    {
      icon: Target,
      title: "Personalized Learning",
      description: "Tailored content based on your financial goals and current knowledge level.",
    },
    {
      icon: Microscope,
      title: "Interactive Tools",
      description: "Hands-on simulators and calculators to practice real-world scenarios.",
    },
    {
      icon: Bot,
      title: "AI-Powered Guidance",
      description: "Smart recommendations and insights powered by advanced algorithms.",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your learning journey and celebrate financial milestones.",
    },
  ];

  return (
    <section id="features" className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="mb-16 text-center"
        >
          <motion.h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl" variants={fadeInUp}>
            Why Choose Pocket Penny?
          </motion.h2>
          <motion.p className="mx-auto max-w-3xl text-xl text-gray-600" variants={fadeInUp}>
            We simplify complex financial concepts and make learning engaging through interactive tools and personalized
            guidance.
          </motion.p>
        </motion.div>

        <motion.div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4" variants={staggerContainer}>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="transform rounded-xl bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
              variants={fadeInUp}
              whileHover="hover"
            >
              <motion.div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100"
                variants={hoverScale}
              >
                <feature.icon className="h-8 w-8 text-blue-600" />
              </motion.div>
              <motion.h3 className="mb-2 text-xl font-semibold text-gray-900" variants={fadeInUp}>
                {feature.title}
              </motion.h3>
              <motion.p className="text-gray-600" variants={fadeInUp}>
                {feature.description}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
