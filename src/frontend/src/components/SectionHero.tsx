import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface SectionHeroProps {
  title: string;
  description: string;
  backgroundImage: string;
  label?: string;
}

export default function SectionHero({
  title,
  description,
  backgroundImage,
  label,
}: SectionHeroProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      className="relative flex items-end overflow-hidden"
      style={{ minHeight: "40vh" }}
    >
      {/* Misty drift background */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-misty-drift"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

      {/* Content — staggered reveal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-32 w-full">
        {label && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-xs font-semibold tracking-widest uppercase text-white/60 mb-3"
          >
            {label}
          </motion.p>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.0, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl sm:text-5xl font-bold text-white mb-4 max-w-2xl"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="text-base sm:text-lg text-white/70 max-w-xl leading-relaxed"
        >
          {description}
        </motion.p>
      </div>
    </section>
  );
}
