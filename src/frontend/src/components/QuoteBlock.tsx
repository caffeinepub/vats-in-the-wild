interface QuoteBlockProps {
  text: string;
  author: string;
}

export default function QuoteBlock({ text, author }: QuoteBlockProps) {
  return (
    <section className="relative py-20 overflow-hidden">
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
        {/* Large quote mark */}
        <div
          className="font-display text-[8rem] leading-none text-primary/20 select-none mb-0 -mb-8"
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
      </div>
    </section>
  );
}
