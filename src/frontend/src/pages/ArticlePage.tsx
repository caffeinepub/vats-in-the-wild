import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { useEffect, useRef } from "react";
import { ArticleSkeleton } from "../components/LoadingSkeleton";
import { usePostBySlug } from "../hooks/useQueries";

const CATEGORY_ROUTES: Record<string, string> = {
  international_relations: "/international-relations",
  forest_field_notes: "/forest-field-notes",
  beyond_cutoff: "/beyond-cutoff",
  wild_within: "/wild-within",
  personal_essays: "/personal-essays",
};

const CATEGORY_LABELS: Record<string, string> = {
  international_relations: "International Relations",
  forest_field_notes: "Forest & Field Notes",
  beyond_cutoff: "Beyond Cutoff",
  wild_within: "The Wild Within",
  personal_essays: "Personal Essays",
};

function ArticleBody({ body }: { body: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = body;
    }
  }, [body]);
  return <div ref={ref} className="prose-forest text-foreground" />;
}

function formatDate(publishedAt: bigint): string {
  const ms = Number(publishedAt) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ArticlePage() {
  const { slug } = useParams({ from: "/blog/$slug" });
  const { data: post, isLoading, isError } = usePostBySlug(slug);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} — Vats in the Wild`;
    }
  }, [post]);

  if (isLoading) {
    return (
      <div className="pt-16">
        <ArticleSkeleton />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div
        data-ocid="article.error_state"
        className="pt-16 min-h-[60vh] flex items-center justify-center"
      >
        <div className="text-center space-y-4 max-w-sm px-4">
          <p className="font-display text-5xl text-primary">404</p>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Article not found
          </h1>
          <p className="text-muted-foreground text-sm">
            This article may have been moved, removed, or the link is incorrect.
          </p>
          <Link to="/">
            <Button
              variant="outline"
              data-ocid="article.back_button"
              className="mt-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <ArrowLeft size={14} className="mr-2" />
              Back to Journal
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const categoryRoute = CATEGORY_ROUTES[post.category] || "/";
  const categoryLabel = CATEGORY_LABELS[post.category] || post.category;
  const CATEGORY_IMAGES: Record<string, string> = {
    international_relations:
      "/assets/generated/section-international-relations.dim_800x500.jpg",
    forest_field_notes:
      "/assets/generated/section-forest-notes.dim_800x500.jpg",
    beyond_cutoff: "/assets/generated/section-upsc.dim_800x500.jpg",
    wild_within: "/assets/generated/section-wild-within.dim_800x500.jpg",
    personal_essays:
      "/assets/generated/section-personal-essays.dim_800x500.jpg",
  };
  const imageSrc = post.featuredImage || CATEGORY_IMAGES[post.category];

  return (
    <article className="pt-16">
      {/* Breadcrumb / Back */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
        <Link
          to={categoryRoute}
          data-ocid="article.back_button"
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft size={12} />
          {categoryLabel}
        </Link>
      </div>

      {/* Article Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="mb-4">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary">
            {categoryLabel}
          </span>
          {post.subcategory && (
            <span className="text-xs text-muted-foreground ml-2">
              · {post.subcategory}
            </span>
          )}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-t border-border pt-4">
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            {post.readingTimeMinutes.toString()} min read
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={12} />
            {formatDate(post.publishedAt)}
          </span>
          {post.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs font-normal text-muted-foreground border-border"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </header>

      {/* Featured Image */}
      {imageSrc && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="aspect-[16/7] overflow-hidden rounded-sm">
            <img
              src={imageSrc}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Article Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {post.body ? (
          <ArticleBody body={post.body} />
        ) : (
          // Demo content when body is empty
          <div className="prose-forest text-foreground">
            <p>{post.excerpt}</p>
            <p>
              The relationship between ecology and geopolitics is rarely mapped
              with the precision it deserves. Both fields operate through long
              timeframes, distributed actors, and outcomes that resist easy
              measurement. A river does not negotiate — but the states that
              share it certainly do, and often with the same mix of short-term
              calculation and strategic blindness.
            </p>
            <h2>The View from the Ground</h2>
            <p>
              Field postings offer a peculiar education. You learn things that
              no policy brief captures: the way local communities calibrate
              trust in government institutions, how information travels in
              remote areas, what "enforcement" actually means in terrain where
              the nearest police station is forty kilometres away.
            </p>
            <p>
              These are not academic observations. They are the texture of
              governance — the granular reality behind the aggregate statistics
              that analysts in Delhi or Geneva work from. The gap between those
              two registers — the texture and the statistic — is where most
              policy fails.
            </p>
            <h2>What This Means for Strategy</h2>
            <p>
              Strategic thinking, whether about conservation or foreign policy,
              requires holding both registers simultaneously. The satellite data
              and the field note. The treaty text and the implementation gap.
              The declared position and the actual interest.
            </p>
            <p>
              That is the project of this writing. Not analysis for its own
              sake, but a sustained attempt to bring the texture of field
              experience into conversations that usually happen at a remove from
              it.
            </p>
          </div>
        )}

        {/* Tags footer */}
        {post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
              Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs text-muted-foreground border-border hover:border-primary hover:text-primary transition-colors cursor-default"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Back button */}
        <div className="mt-10">
          <Link to={categoryRoute}>
            <Button
              variant="outline"
              data-ocid="article.back_button"
              className="border-border text-muted-foreground hover:text-primary hover:border-primary"
            >
              <ArrowLeft size={14} className="mr-2" />
              Back to {categoryLabel}
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
