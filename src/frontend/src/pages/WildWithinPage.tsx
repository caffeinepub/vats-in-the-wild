import {
  Backpack,
  BookOpen,
  Camera,
  Dumbbell,
  Leaf,
  Map as MapIcon,
  Music,
  Plane,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Category } from "../backend.d";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PostCard from "../components/PostCard";
import SectionHero from "../components/SectionHero";
import TagCloud from "../components/TagCloud";
import { usePostsByCategory } from "../hooks/useQueries";
import { useSiteSettings } from "../hooks/useSiteSettings";

// ─── Hobby data ────────────────────────────────────────────────────────────────

interface Hobby {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  name: string;
  description: string;
  featured?: boolean;
  accent: string; // tailwind bg class for subtle tint
}

const HOBBIES: Hobby[] = [
  {
    icon: Camera,
    name: "Photography",
    description:
      "Light doesn't wait. Neither does the moment — learning to see before reaching for the lens.",
    featured: true,
    accent: "from-amber-900/20 to-stone-900/10",
  },
  {
    icon: Leaf,
    name: "Terrarium Making",
    description:
      "A miniature forest in glass — the same patience I carry into the field, scaled down to a jar.",
    featured: true,
    accent: "from-emerald-900/25 to-stone-900/10",
  },
  {
    icon: Backpack,
    name: "Trekking & Trail Running",
    description:
      "The body knows the mountain long before the mind does. You just have to keep moving.",
    accent: "from-stone-800/20 to-background/0",
  },
  {
    icon: BookOpen,
    name: "Reading",
    description:
      "A good book is the other frontier — farther, stranger, and sometimes more demanding than any field post.",
    accent: "from-stone-800/20 to-background/0",
  },
  {
    icon: Dumbbell,
    name: "Fitness",
    description:
      "Discipline isn't punishment. It's the infrastructure on which everything else is built.",
    accent: "from-stone-800/20 to-background/0",
  },
  {
    icon: Music,
    name: "Music",
    description:
      "Some silences can only be broken by the right song. I keep a long list of those.",
    accent: "from-stone-800/20 to-background/0",
  },
  {
    icon: Plane,
    name: "Travel",
    description:
      "Every border crossed is a theory tested — geography shapes culture in ways no paper fully captures.",
    accent: "from-stone-800/20 to-background/0",
  },
  {
    icon: MapIcon,
    name: "Exploration",
    description:
      "The unmarked path, the uncertain route — this is where attention sharpens and assumptions dissolve.",
    accent: "from-stone-800/20 to-background/0",
  },
];

// ─── Hobby card ────────────────────────────────────────────────────────────────

function HobbyCard({
  hobby,
  index,
}: {
  hobby: Hobby;
  index: number;
}) {
  const Icon = hobby.icon;

  if (hobby.featured) {
    return (
      <motion.div
        data-ocid={`hobbies.card.${index}`}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, delay: index * 0.07 }}
        whileHover={{ y: -5, scale: 1.01 }}
        className={`
          group relative overflow-hidden rounded-sm border border-border
          bg-gradient-to-br ${hobby.accent}
          hover:border-primary/50 hover:shadow-[0_8px_32px_-4px_oklch(var(--primary)/0.18)]
          transition-shadow duration-300 cursor-default
          col-span-1 row-span-1 md:col-span-1 lg:col-span-1 lg:row-span-2
        `}
      >
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />

        <div className="relative z-10 p-7 flex flex-col h-full min-h-[200px]">
          {/* Featured badge */}
          <span className="self-start mb-4 px-2.5 py-0.5 text-[10px] font-semibold tracking-widest uppercase text-primary border border-primary/30 rounded-sm">
            Featured
          </span>

          <div className="mb-5">
            <div className="w-12 h-12 flex items-center justify-center border border-primary/30 rounded-sm bg-primary/10 mb-5 group-hover:bg-primary/20 transition-colors duration-300">
              <Icon size={22} className="text-primary" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
              {hobby.name}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              "{hobby.description}"
            </p>
          </div>

          {/* Bottom line accent */}
          <div className="mt-auto h-px w-12 bg-primary/40 group-hover:w-full transition-all duration-500" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      data-ocid={`hobbies.card.${index}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className={`
        group relative overflow-hidden rounded-sm border border-border
        bg-card hover:border-primary/40
        hover:shadow-[0_6px_24px_-4px_oklch(var(--primary)/0.12)]
        transition-all duration-300 cursor-default
      `}
    >
      <div className="p-5 flex gap-4 items-start">
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-border rounded-sm bg-muted group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-300">
          <Icon
            size={18}
            className="text-muted-foreground group-hover:text-primary transition-colors duration-300"
          />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
            {hobby.name}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {hobby.description}
          </p>
        </div>
      </div>
      {/* Subtle bottom accent line */}
      <div className="absolute bottom-0 left-0 h-px w-0 bg-primary/50 group-hover:w-full transition-all duration-400" />
    </motion.div>
  );
}

// ─── Hobbies section ───────────────────────────────────────────────────────────

function HobbiesSection() {
  const featured = HOBBIES.filter((h) => h.featured);
  const regular = HOBBIES.filter((h) => !h.featured);

  return (
    <section
      data-ocid="hobbies.section"
      className="py-20 lg:py-28 bg-background border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            The Collector's Eye
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Hobbies & Pursuits
          </h2>
          <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
            Beyond the uniform, beyond the frontier — the quiet obsessions that
            shape how I see the world.
          </p>
        </motion.div>

        {/* Featured cards — photography & terrarium */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {featured.map((hobby, i) => (
            <HobbyCard key={hobby.name} hobby={hobby} index={i + 1} />
          ))}
        </div>

        {/* Regular hobby cards in a tighter grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {regular.map((hobby, i) => (
            <HobbyCard
              key={hobby.name}
              hobby={hobby}
              index={featured.length + i + 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Posts subsection (mirrors SectionListPage internals) ─────────────────────

function collectTags(posts: { tags: string[] }[]): string[] {
  const tagSet = new Set<string>();
  for (const p of posts) {
    for (const t of p.tags) tagSet.add(t);
  }
  return Array.from(tagSet).sort();
}

function WildWithinPosts() {
  const { data: posts = [], isLoading } = usePostsByCategory(
    Category.wild_within,
  );
  const [selectedTag, setSelectedTag] = useState("");

  const allTags = useMemo(() => collectTags(posts), [posts]);

  const filteredPosts = useMemo(() => {
    let result = posts.filter((p) => !p.isDraft);
    if (selectedTag) {
      result = result.filter((p) => p.tags.includes(selectedTag));
    }
    return result;
  }, [posts, selectedTag]);

  return (
    <div className="py-16 lg:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sub-heading */}
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            From the Journal
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Field Writings
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <LoadingSkeleton count={4} />
            ) : filteredPosts.length === 0 ? (
              <div
                data-ocid="wild_within_posts.empty_state"
                className="text-center py-20 border border-border rounded-sm"
              >
                <BookOpen
                  className="mx-auto mb-4 text-muted-foreground/40"
                  size={40}
                />
                <p className="font-display text-lg text-foreground mb-2">
                  No articles yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Writing is underway. Check back soon.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredPosts.map((post, i) => (
                  <PostCard key={post.slug} post={post} index={i + 1} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          {allTags.length > 0 && (
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-24">
                <TagCloud
                  tags={allTags}
                  selectedTag={selectedTag}
                  onTagClick={setSelectedTag}
                />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WildWithinPage() {
  const settings = useSiteSettings();

  return (
    <div>
      <SectionHero
        title={settings.wildTitle || "The Wild Within"}
        description={
          settings.wildDescription ||
          "Travel, trekking, fitness, photography, music, and reflections on the human experience beyond duty. The other dimensions of a life lived fully."
        }
        backgroundImage={
          settings.wildPageBg ||
          "/assets/generated/section-wild-within.dim_800x500.jpg"
        }
        label={settings.wildLabel || "Explorations"}
      />

      <HobbiesSection />

      <WildWithinPosts />
    </div>
  );
}
