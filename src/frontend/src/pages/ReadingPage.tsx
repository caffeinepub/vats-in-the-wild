import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReadingRecommendation } from "../backend.d";
import { useReadingRecommendations } from "../hooks/useQueries";

type DisplayRec =
  | ReadingRecommendation
  | {
      title: string;
      author: string;
      description: string;
      genre: string;
      addedAt: bigint;
      link?: string;
    };

const DEFAULT_RECOMMENDATIONS = [
  {
    title: "The Idea of India",
    author: "Sunil Khilnani",
    description:
      "A brilliant meditation on what India actually is — as an idea, a project, a civilization-state navigating modernity. Essential reading for anyone writing about Indian policy.",
    genre: "Politics & Society",
    addedAt: BigInt(Date.now() * 1_000_000),
  },
  {
    title: "The Great Game",
    author: "Peter Hopkirk",
    description:
      "The classic account of the Anglo-Russian strategic rivalry across Central Asia. Eerily relevant to contemporary Indo-Pacific dynamics.",
    genre: "Geopolitics",
    addedAt: BigInt(Date.now() * 1_000_000),
  },
  {
    title: "The Snow Leopard",
    author: "Peter Matthiessen",
    description:
      "Part nature writing, part philosophical journey. A masterclass in how to write about wilderness without sentimentalising it.",
    genre: "Nature Writing",
    addedAt: BigInt(Date.now() * 1_000_000),
  },
  {
    title: "Why Nations Fail",
    author: "Daron Acemoglu & James A. Robinson",
    description:
      "The institutions framework applied to historical development. Useful for thinking about why forest governance succeeds or fails.",
    genre: "Economics",
    addedAt: BigInt(Date.now() * 1_000_000),
  },
  {
    title: "Guns, Germs, and Steel",
    author: "Jared Diamond",
    description:
      "Diamond's ambitious environmental determinism. Flawed in places, but the ecological lens on history is indispensable.",
    genre: "History",
    addedAt: BigInt(Date.now() * 1_000_000),
  },
  {
    title: "The Peregrine",
    author: "J.A. Baker",
    description:
      "The finest piece of nature writing in the English language. Ten years of watching a peregrine. Nothing more, nothing less — and everything.",
    genre: "Nature Writing",
    addedAt: BigInt(Date.now() * 1_000_000),
  },
  {
    title: "The Argumentative Indian",
    author: "Amartya Sen",
    description:
      "Sen's essays on Indian history, culture, and identity. The chapter on heterodoxy and secularism is particularly important.",
    genre: "Politics & Society",
    addedAt: BigInt(Date.now() * 1_000_000),
  },
  {
    title: "The Prize",
    author: "Daniel Yergin",
    description:
      "The history of oil and its political consequences. The foundational text for understanding energy geopolitics.",
    genre: "Geopolitics",
    addedAt: BigInt(Date.now() * 1_000_000),
  },
];

export default function ReadingPage() {
  const { data: recommendations, isLoading } = useReadingRecommendations();
  const [selectedGenre, setSelectedGenre] = useState("all");

  useEffect(() => {
    document.title = "Reading List — Vats in the Wild";
  }, []);

  const displayRecs: DisplayRec[] =
    recommendations && recommendations.length > 0
      ? recommendations
      : DEFAULT_RECOMMENDATIONS;

  const genres = useMemo(() => {
    const genreSet = new Set<string>();
    for (const r of displayRecs) {
      genreSet.add(r.genre);
    }
    return Array.from(genreSet).sort();
  }, [displayRecs]);

  const filteredRecs = useMemo(() => {
    if (selectedGenre === "all") return displayRecs;
    return displayRecs.filter((r) => r.genre === selectedGenre);
  }, [displayRecs, selectedGenre]);

  return (
    <div className="pt-16">
      {/* Page Header */}
      <section className="py-20 bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">
            Library
          </p>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-foreground mb-4 leading-tight">
            Reading List
          </h1>
          <p className="text-lg text-muted-foreground italic font-display">
            Books that shaped the thinking.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Genre Filter */}
        <div
          className="mb-10 overflow-x-auto pb-1"
          data-ocid="reading.genre_filter.tab"
        >
          <Tabs value={selectedGenre} onValueChange={setSelectedGenre}>
            <TabsList className="bg-muted/50 border border-border h-auto p-1 gap-1">
              <TabsTrigger
                value="all"
                data-ocid="reading.genre_filter.tab"
                className="text-xs font-medium tracking-wide uppercase px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm"
              >
                All
              </TabsTrigger>
              {genres.map((genre) => (
                <TabsTrigger
                  key={genre}
                  value={genre}
                  data-ocid="reading.genre_filter.tab"
                  className="text-xs font-medium tracking-wide px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm whitespace-nowrap"
                >
                  {genre}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Books Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"].map((k) => (
              <div
                key={k}
                className="bg-card border border-border p-6 space-y-3"
              >
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        ) : filteredRecs.length === 0 ? (
          <div
            data-ocid="reading.list"
            className="text-center py-16 border border-border"
          >
            <BookOpen
              className="mx-auto mb-4 text-muted-foreground/40"
              size={36}
            />
            <p className="font-display text-lg text-foreground mb-2">
              No books in this genre yet
            </p>
          </div>
        ) : (
          <div
            data-ocid="reading.list"
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {filteredRecs.map((rec, i) => (
              <article
                key={rec.title}
                data-ocid={`post_list.item.${i + 1}`}
                className="group bg-card border border-border p-6 hover:border-primary/40 transition-all duration-300 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {rec.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {rec.author}
                    </p>
                  </div>
                  {"link" in rec &&
                    typeof rec.link === "string" &&
                    rec.link && (
                      <a
                        href={rec.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors mt-0.5"
                        aria-label={`External link for ${rec.title}`}
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {rec.description}
                </p>
                <Badge
                  variant="outline"
                  className="text-xs font-normal text-muted-foreground border-border"
                >
                  {rec.genre}
                </Badge>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
