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
  return (
    <section
      className="relative flex items-end overflow-hidden"
      style={{ minHeight: "40vh" }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-32 w-full">
        {label && (
          <p className="text-xs font-semibold tracking-widest uppercase text-white/60 mb-3">
            {label}
          </p>
        )}
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4 max-w-2xl">
          {title}
        </h1>
        <p className="text-base sm:text-lg text-white/70 max-w-xl leading-relaxed">
          {description}
        </p>
      </div>
    </section>
  );
}
