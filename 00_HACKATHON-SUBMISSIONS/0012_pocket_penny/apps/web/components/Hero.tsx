"use client";

import React from "react";

import { motion } from "framer-motion";
import { ArrowRight, BarChart3 } from "lucide-react";
import { useInView } from "react-intersection-observer";

import { fadeInLeft, fadeInRight, fadeInUp, hoverScale, scaleIn, staggerContainer } from "@/lib/animations";

export const Hero: React.FC = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white"
    >
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid items-center gap-12 lg:grid-cols-2"
        >
          <motion.div className="space-y-8" variants={fadeInLeft}>
            <motion.h1 className="text-4xl font-bold leading-tight md:text-6xl" variants={fadeInUp}>
              Master Your Money with{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Pocket Penny
              </span>
            </motion.h1>
            <motion.p className="text-xl leading-relaxed text-blue-100" variants={fadeInUp}>
              Transform complex financial concepts into simple, actionable knowledge. Our comprehensive platform offers
              10 specialized tracks to guide you from financial novice to confident investor.
            </motion.p>
            <motion.div className="flex flex-col gap-4 sm:flex-row" variants={fadeInUp}>
              <motion.a
                href="#tracks"
                className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-orange-600"
                variants={hoverScale}
                whileHover="hover"
              >
                Explore Tracks <ArrowRight className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#demo"
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 px-8 py-4 font-semibold text-white transition-all duration-300 hover:border-white/50 hover:bg-white/10"
                variants={hoverScale}
                whileHover="hover"
              >
                Watch Demo
              </motion.a>
            </motion.div>
            <motion.div className="flex justify-center gap-8 pt-8 sm:justify-start" variants={fadeInUp}>
              {[
                { number: "10", label: "Learning Tracks" },
                { number: "5K+", label: "Users Educated" },
                { number: "95%", label: "Success Rate" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  variants={fadeInUp}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <motion.div
                    className="text-3xl font-bold text-yellow-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.5 + index * 0.1,
                      type: "spring",
                      stiffness: 200,
                    }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div className="flex justify-center" variants={fadeInRight}>
            <motion.div
              className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg"
              variants={scaleIn}
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="text-lg font-semibold">Your Financial Journey</span>
                <BarChart3 className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="space-y-4">
                {[
                  { skill: "Budgeting", progress: 85 },
                  { skill: "Investing", progress: 70 },
                  { skill: "Saving", progress: 92 },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="space-y-2"
                    variants={fadeInUp}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div className="flex justify-between text-sm">
                      <span>{item.skill}</span>
                      <span>{item.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/20">
                      <motion.div
                        className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{
                          delay: 0.8 + index * 0.2,
                          duration: 1.5,
                          ease: "easeOut",
                        }}
                      ></motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
