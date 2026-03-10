import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { FeaturedPostSkeleton } from "../components/LoadingSkeleton";
import NewsletterForm from "../components/NewsletterForm";
import PostCard from "../components/PostCard";
import QuoteBlock from "../components/QuoteBlock";
import { useActiveQuote, useLatestPosts } from "../hooks/useQueries";
import { useReveal } from "../hooks/useReveal";
import { useSiteSettings } from "../hooks/useSiteSettings";

const SECTION_DEFAULT_IMAGES = [
  "/assets/generated/section-international-relations.dim_800x500.jpg",
  "/assets/generated/section-forest-notes.dim_800x500.jpg",
  "/assets/generated/section-upsc.dim_800x500.jpg",
  "/assets/generated/section-wild-within.dim_800x500.jpg",
  "/assets/generated/section-personal-essays.dim_800x500.jpg",
  "",
  "",
  "",
];

const SECTION_ROUTES = [
  "/international-relations",
  "/forest-field-notes",
  "/beyond-cutoff",
  "/wild-within",
  "/personal-essays",
  "#",
  "#",
  "#",
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

export default function HomePage() {
  const { data: latestPosts, isLoading: postsLoading } = useLatestPosts(3n);
  const { data: activeQuote } = useActiveQuote();
  const [heroVisible, setHeroVisible] = useState(false);
  const settings = useSiteSettings();

  // Reveal refs for each scroll section
  const aboutRef = useReveal<HTMLElement>();
  const sectionsRef = useReveal<HTMLElement>();
  const latestRef = useReveal<HTMLElement>();
  const newsletterRef = useReveal<HTMLElement>();

  const sectionCount = Math.min(
    8,
    Math.max(5, Number.parseInt(settings.sectionCount) || 5),
  );

  const allSectionData = [
    {
      title: settings.section1Title,
      description: settings.section1Description,
      label: settings.section1Label,
      image: settings.section1Image || SECTION_DEFAULT_IMAGES[0],
      to: SECTION_ROUTES[0],
    },
    {
      title: settings.section2Title,
      description: settings.section2Description,
      label: settings.section2Label,
      image: settings.section2Image || SECTION_DEFAULT_IMAGES[1],
      to: SECTION_ROUTES[1],
    },
    {
      title: settings.section3Title,
      description: settings.section3Description,
      label: settings.section3Label,
      image: settings.section3Image || SECTION_DEFAULT_IMAGES[2],
      to: SECTION_ROUTES[2],
    },
    {
      title: settings.section4Title,
      description: settings.section4Description,
      label: settings.section4Label,
      image: settings.section4Image || SECTION_DEFAULT_IMAGES[3],
      to: SECTION_ROUTES[3],
    },
    {
      title: settings.section5Title,
      description: settings.section5Description,
      label: settings.section5Label,
      image: settings.section5Image || SECTION_DEFAULT_IMAGES[4],
      to: SECTION_ROUTES[4],
    },
    {
      title: settings.section6Title || "Section 6",
      description: settings.section6Description,
      label: settings.section6Label,
      image: settings.section6Image || SECTION_DEFAULT_IMAGES[5],
      to: SECTION_ROUTES[5],
    },
    {
      title: settings.section7Title || "Section 7",
      description: settings.section7Description,
      label: settings.section7Label,
      image: settings.section7Image || SECTION_DEFAULT_IMAGES[6],
      to: SECTION_ROUTES[6],
    },
    {
      title: settings.section8Title || "Section 8",
      description: settings.section8Description,
      label: settings.section8Label,
      image: settings.section8Image || SECTION_DEFAULT_IMAGES[7],
      to: SECTION_ROUTES[7],
    },
  ];

  const sectionCards = allSectionData.slice(0, sectionCount);

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
    <div>
      {/* ===== HERO ===== */}
      <section
        data-ocid="hero.section"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Ken Burns background */}
        <div
          className="absolute inset-0 bg-cover bg-center animate-ken-burns"
          style={{
            backgroundImage: settings.heroBackgroundImage
              ? `url(${settings.heroBackgroundImage})`
              : "url(/assets/generated/hero-forest-dawn.dim_1600x900.jpg)",
          }}
        />
        {/* Breathing gradient overlay */}
        <div
          className="absolute inset-0 animate-breathe-overlay"
          style={{
            background: `linear-gradient(to bottom, rgba(0,0,0,${settings.heroOverlayOpacity}) 0%, rgba(0,0,0,${Math.max(0, Number.parseFloat(settings.heroOverlayOpacity) - 0.2).toFixed(2)}) 50%, rgba(0,0,0,${settings.heroOverlayOpacity}) 100%)`,
          }}
        />

        {/* Hero content — cinematic sequential reveal */}
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={heroVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.0, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase text-white/60 mb-6">
              {settings.heroEyebrow}
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={heroVisible ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 1.1,
              delay: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold text-white mb-6 leading-none tracking-tight"
          >
            {settings.heroTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={heroVisible ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 1.0,
              delay: 0.85,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="font-display text-lg sm:text-xl text-white/70 italic mb-10 max-w-2xl mx-auto"
          >
            {settings.heroTagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={heroVisible ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.9,
              delay: 1.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/forest-field-notes">
              <Button
                size="lg"
                data-ocid="hero.read_journal_button"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold tracking-wide px-8"
              >
                {settings.heroCtaPrimary}
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
              {settings.heroCtaSecondary}
            </Button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40"
          initial={{ opacity: 0 }}
          animate={heroVisible ? { opacity: 1, y: [0, 8, 0] } : {}}
          transition={{
            opacity: { delay: 1.6, duration: 0.8 },
            y: {
              repeat: Number.POSITIVE_INFINITY,
              duration: 2.2,
              ease: "easeInOut",
            },
          }}
        >
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* ===== ABOUT PREVIEW ===== */}
      <section
        ref={aboutRef}
        className="py-20 lg:py-28 bg-background relative"
        style={
          settings.homepageAboutBg
            ? {
                backgroundImage: `url(${settings.homepageAboutBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {settings.homepageAboutBg && (
          <div className="absolute inset-0 bg-background/80 pointer-events-none" />
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Portrait */}
            <div className="reveal-hidden">
              <div className="relative max-w-sm mx-auto lg:mx-0">
                <div className="aspect-[4/5] overflow-hidden rounded-sm">
                  <img
                    src={
                      settings.aboutPortraitUrl ||
                      "/assets/generated/portrait-placeholder.dim_600x750.jpg"
                    }
                    alt={settings.aboutPreviewName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 w-full h-full border border-primary/30 rounded-sm -z-10" />
              </div>
            </div>

            {/* Text */}
            <div className="reveal-hidden reveal-delay-2 space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
                  About
                </p>
                <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2 leading-tight">
                  {settings.aboutPreviewName}
                </h2>
                <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-6">
                  {settings.aboutPreviewSubtitle}
                </p>
              </div>
              <p className="text-base text-muted-foreground leading-relaxed">
                {settings.aboutPreviewText1}
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                {settings.aboutPreviewText2}
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
      <section
        id="sections"
        ref={sectionsRef}
        className="py-20 bg-card border-y border-border relative"
        style={
          settings.homepageSectionsBg
            ? {
                backgroundImage: `url(${settings.homepageSectionsBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {settings.homepageSectionsBg && (
          <div className="absolute inset-0 bg-background/80 pointer-events-none" />
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 reveal-hidden">
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
            {sectionCards.map((section, i) => (
              <Link
                key={`${section.to}-${i}`}
                to={section.to as never}
                data-ocid={`sections.card.${i + 1}`}
                className="group reveal-hidden block bg-background border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-primary/40 transition-[box-shadow,border-color,transform] duration-300"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="aspect-[16/9] overflow-hidden">
                  {section.image ? (
                    <img
                      src={section.image}
                      alt={section.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted/40 flex items-center justify-center">
                      <span className="text-muted-foreground/40 text-sm">
                        No image
                      </span>
                    </div>
                  )}
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
      <section
        ref={latestRef}
        className="py-20 lg:py-28 bg-background relative"
        style={
          settings.homepageLatestBg
            ? {
                backgroundImage: `url(${settings.homepageLatestBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {settings.homepageLatestBg && (
          <div className="absolute inset-0 bg-background/80 pointer-events-none" />
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12 reveal-hidden">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
                {settings.latestArticlesLabel}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                {settings.latestArticlesTitle}
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
            className="space-y-4 reveal-hidden reveal-delay-2"
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
      <div
        className="relative"
        style={
          settings.homepageQuoteBg
            ? {
                backgroundImage: `url(${settings.homepageQuoteBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {settings.homepageQuoteBg && (
          <div className="absolute inset-0 bg-background/80 pointer-events-none" />
        )}
        <div className="relative z-10">
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
        </div>
      </div>

      {/* ===== NEWSLETTER ===== */}
      <section
        ref={newsletterRef}
        className="py-20 bg-background border-y border-border relative"
        style={
          settings.homepageNewsletterBg
            ? {
                backgroundImage: `url(${settings.homepageNewsletterBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {settings.homepageNewsletterBg && (
          <div className="absolute inset-0 bg-background/80 pointer-events-none" />
        )}
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="reveal-hidden space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
                {settings.newsletterLabel}
              </p>
              <h2 className="font-display text-3xl font-bold text-foreground mb-3">
                {settings.newsletterTitle}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {settings.newsletterSubtitle}
              </p>
            </div>
            <NewsletterForm placeholder={settings.newsletterPlaceholder} />
          </div>
        </div>
      </section>
    </div>
  );
}
