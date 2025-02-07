"use client";
import { motion, useScroll, useSpring } from "framer-motion";

export default function ProgressScrollEffect() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-darkPurpleBtn origin-left z-50"
      style={{ scaleX }}
    />
  );
}
