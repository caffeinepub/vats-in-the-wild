import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { FeaturedPostSkeleton } from "../components/LoadingSkeleton";
import NewsletterForm from "../components/NewsletterForm";
import PostCard from "../components/PostCard";
import QuoteBlock from "../components/QuoteBlock";
import { useActiveQuote, useLatestPosts } from "../hooks/useQueries";

const SECTION_CARDS = [
  {
    title: "International Relations",
    description:
      "Analytical essays on geopolitics, India's foreign policy, and global power shifts.",
    image: "/assets/generated/section-international-relations.dim_800x500.jpg",
    to: "/international-relations",
    label: "World Affairs",
  },
  {
    title: "Forest & Field Notes",
    description:
      "Field experiences, wildlife insights, conservation challenges, and policy reflections.",
    image: "/assets/generated/section-forest-notes.dim_800x500.jpg",
    to: "/forest-field-notes",
    label: "Conservation",
  },
  {
    title: "Beyond Cutoff",
    description:
      "High-quality insights for civil services aspirants: strategy, mindset, and discipline.",
    image: "/assets/generated/section-upsc.dim_800x500.jpg",
    to: "/beyond-cutoff",
    label: "UPSC Strategy",
  },
  {
    title: "The Wild Within",
    description:
      "Travel, trekking, fitness, photography, and reflections on the human experience.",
    image: "/assets/generated/section-wild-within.dim_800x500.jpg",
    to: "/wild-within",
    label: "Explorations",
  },
  {
    title: "Personal Essays",
    description:
      "Long-form reflections on leadership, public service, growth, and solitude.",
    image: "/assets/generated/section-personal-essays.dim_800x500.jpg",
    to: "/personal-essays",
    label: "Reflections",
  },
];

const DEFAULT_POSTS = [
  {
    title: "India's Neighbourhood Policy: Between Strategy and Sentiment",
    excerpt:
      "A field officer's view of how India's neighbourhood first doctrine plays out beyond diplomatic cables — in border forests, shared rivers, and contested histories.",
    slug: "india-neighbourhood-policy",
    category: "international_relations" as const,
    tags: ["India", "Foreign Policy", "Neighbourhood"],
    publishedAt: BigInt(Date.now() * 1_000_000),
    readingTimeMinutes: BigInt(8),
    isDraft: false,
    isFeatured: true,
    body: "",
    featuredImage:
      "/assets/generated/section-international-relations.dim_800x500.jpg",
  },
  {
    title: "A Night with Elephants in the Nilgiris",
    excerpt:
      "Solitary and immense, the matriarch paused at the treeline. In that moment, everything I had read about intelligence in the wild became irrelevant. You simply watch, and understand.",
    slug: "nilgiris-elephants",
    category: "forest_field_notes" as const,
    tags: ["Wildlife", "Elephants", "Field Notes"],
    publishedAt: BigInt((Date.now() - 7 * 24 * 60 * 60 * 1000) * 1_000_000),
    readingTimeMinutes: BigInt(6),
    isDraft: false,
    isFeatured: false,
    body: "",
    featuredImage: "/assets/generated/section-forest-notes.dim_800x500.jpg",
  },
  {
    title: "The Essay Question: How I Think About Long-Form UPSC Writing",
    excerpt:
      "An essay is not a summary. It is an argument. Most aspirants miss this distinction entirely, and their papers reflect it — competent but forgettable.",
    slug: "upsc-essay-strategy",
    category: "beyond_cutoff" as const,
    tags: ["UPSC", "Essay", "Strategy"],
    publishedAt: BigInt((Date.now() - 14 * 24 * 60 * 60 * 1000) * 1_000_000),
    readingTimeMinutes: BigInt(10),
    isDraft: false,
    isFeatured: false,
    body: "",
    featuredImage: "/assets/generated/section-upsc.dim_800x500.jpg",
  },
];

function useScrollFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-6");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1 },
    );
    const els = ref.current.querySelectorAll(".scroll-animate");
    for (const el of els) {
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function HomePage() {
  const { data: latestPosts, isLoading: postsLoading } = useLatestPosts(3n);
  const { data: activeQuote } = useActiveQuote();
  const containerRef = useScrollFadeIn();
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    document.title =
      "Vats in the Wild — Indian Forest Service Officer | Geopolitics & Field Notes";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Shubham Vats — Indian Forest Service Officer writing on ecology, geopolitics, UPSC strategy, and personal evolution. Notes from the frontier.",
      );
    }
    const timer = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const displayPosts =
    latestPosts && latestPosts.length > 0 ? latestPosts : DEFAULT_POSTS;

  return (
    <div ref={containerRef}>
      {/* ===== HERO ===== */}
      <section
        data-ocid="hero.section"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(/assets/generated/hero-forest-dawn.dim_1600x900.jpg)",
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase text-white/60 mb-6">
              Notes from the Frontier
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={heroVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold text-white mb-6 leading-none tracking-tight"
          >
            Vats in the Wild
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={heroVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="font-display text-lg sm:text-xl text-white/70 italic mb-10 max-w-2xl mx-auto"
          >
            From Forest Lines to Fault Lines.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/forest-field-notes">
              <Button
                size="lg"
                data-ocid="hero.read_journal_button"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold tracking-wide px-8"
              >
                Read the Journal
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              data-ocid="hero.explore_sections_button"
              onClick={() => {
                document
                  .getElementById("sections")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="border-white/40 text-white hover:bg-white/10 hover:text-white hover:border-white/60 font-semibold tracking-wide px-8"
            >
              Explore Sections
            </Button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
        >
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* ===== ABOUT PREVIEW ===== */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Portrait */}
            <div className="scroll-animate opacity-0 translate-y-6 transition-all duration-700">
              <div className="relative max-w-sm mx-auto lg:mx-0">
                <div className="aspect-[4/5] overflow-hidden rounded-sm">
                  <img
                    src="/assets/generated/portrait-placeholder.dim_600x750.jpg"
                    alt="Shubham Vats"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Decorative border */}
                <div className="absolute -bottom-4 -right-4 w-full h-full border border-primary/30 rounded-sm -z-10" />
              </div>
            </div>

            {/* Text */}
            <div className="scroll-animate opacity-0 translate-y-6 transition-all duration-700 delay-150 space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
                  About
                </p>
                <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2 leading-tight">
                  Shubham Vats
                </h2>
                <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-6">
                  Indian Forest Service Officer
                </p>
              </div>
              <p className="text-base text-muted-foreground leading-relaxed">
                Indian Forest Service Officer. Observer of power, policy, and
                wilderness. Writing at the intersection of ecology, geopolitics,
                and personal evolution.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                From the forest floor to the diplomatic frontier — this is a
                space for sustained thought, field-tested insight, and the kind
                of writing that takes time to arrive at.
              </p>
              <Link to="/about" data-ocid="about_preview.read_bio_link">
                <Button
                  variant="outline"
                  className="mt-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-medium tracking-wide"
                >
                  Read Full Bio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED SECTIONS GRID ===== */}
      <section id="sections" className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 scroll-animate opacity-0 translate-y-6 transition-all duration-700">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
              Explore
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Sections
            </h2>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="sections.list"
          >
            {SECTION_CARDS.map((section, i) => (
              <Link
                key={section.to}
                to={section.to}
                data-ocid={`sections.card.${i + 1}`}
                className="group scroll-animate opacity-0 translate-y-6 transition-all duration-700 block bg-background border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-primary/40"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={section.image}
                    alt={section.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-110"
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">
                    {section.label}
                  </p>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LATEST ARTICLES ===== */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12 scroll-animate opacity-0 translate-y-6 transition-all duration-700">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
                Recent Writing
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                From the Journal
              </h2>
            </div>
            <Link
              to="/forest-field-notes"
              className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-primary transition-colors tracking-wide"
            >
              View All →
            </Link>
          </div>

          <div
            data-ocid="latest_articles.list"
            className="space-y-4 scroll-animate opacity-0 translate-y-6 transition-all duration-700 delay-150"
          >
            {postsLoading ? (
              <>
                <FeaturedPostSkeleton />
                <FeaturedPostSkeleton />
                <FeaturedPostSkeleton />
              </>
            ) : (
              displayPosts.map((post, i) => (
                <PostCard
                  key={post.slug}
                  post={post as never}
                  index={i + 1}
                  variant="featured"
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ===== QUOTE OF THE MONTH ===== */}
      <AnimatePresence>
        {activeQuote ? (
          <QuoteBlock text={activeQuote.text} author={activeQuote.author} />
        ) : (
          <QuoteBlock
            text="The forest is not a resource to be exploited but a world to be understood — a living archive of evolutionary time, patient and indifferent to our urgency."
            author="Shubham Vats"
          />
        )}
      </AnimatePresence>

      {/* ===== NEWSLETTER ===== */}
      <section className="py-20 bg-background border-y border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="scroll-animate opacity-0 translate-y-6 transition-all duration-700 space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
                Dispatches
              </p>
              <h2 className="font-display text-3xl font-bold text-foreground mb-3">
                Stay in the Field
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Occasional dispatches — essays, insights, field notes. No noise.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}
