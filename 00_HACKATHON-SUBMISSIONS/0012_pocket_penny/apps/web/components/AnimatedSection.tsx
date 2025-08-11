"use client";

import { ReactNode } from "react";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

import { fadeInUp, staggerContainer } from "@/lib/animations";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export const AnimatedSection = ({ children, className = "", delay = 0, direction = "up" }: AnimatedSectionProps) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const getAnimation = () => {
    switch (direction) {
      case "up":
        return fadeInUp;
      case "left":
        return { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0 } };
      case "right":
        return { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0 } };
      default:
        return fadeInUp;
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={getAnimation()}
      transition={{ duration: 0.8, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedContainer = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
};
