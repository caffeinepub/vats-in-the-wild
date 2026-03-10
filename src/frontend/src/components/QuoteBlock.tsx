import { motion } from "motion/react";
import { useReveal } from "../hooks/useReveal";

interface QuoteBlockProps {
  text: string;
  author: string;
}

export default function QuoteBlock({ text, author }: QuoteBlockProps) {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="relative py-20 overflow-hidden">
      {/* Subtle texture background */}
      <div className="absolute inset-0 bg-card" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="font-display text-[8rem] leading-none text-primary/20 select-none -mb-8"
            aria-hidden="true"
          >
            "
          </div>
          <blockquote className="font-display text-xl sm:text-2xl lg:text-3xl font-medium italic text-foreground leading-relaxed mb-6">
            {text}
          </blockquote>
          <cite className="text-sm font-semibold tracking-widest uppercase text-muted-foreground not-italic">
            — {author}
          </cite>
        </motion.div>
      </div>
    </section>
  );
}
