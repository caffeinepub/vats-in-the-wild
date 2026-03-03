import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import type { Category, Post } from "../backend.d";

const CATEGORY_IMAGES: Record<string, string> = {
  international_relations:
    "/assets/generated/section-international-relations.dim_800x500.jpg",
  forest_field_notes: "/assets/generated/section-forest-notes.dim_800x500.jpg",
  beyond_cutoff: "/assets/generated/section-upsc.dim_800x500.jpg",
  wild_within: "/assets/generated/section-wild-within.dim_800x500.jpg",
  personal_essays: "/assets/generated/section-personal-essays.dim_800x500.jpg",
};

const CATEGORY_LABELS: Record<string, string> = {
  international_relations: "International Relations",
  forest_field_notes: "Forest & Field Notes",
  beyond_cutoff: "Beyond Cutoff",
  wild_within: "The Wild Within",
  personal_essays: "Personal Essays",
};

interface PostCardProps {
  post: Post;
  index?: number;
  variant?: "default" | "featured";
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

export default function PostCard({
  post,
  index = 1,
  variant = "default",
}: PostCardProps) {
  const imageSrc = post.featuredImage || CATEGORY_IMAGES[post.category] || "";
  const categoryLabel = CATEGORY_LABELS[post.category] || post.category;

  if (variant === "featured") {
    return (
      <article
        data-ocid={`latest_articles.item.${index}`}
        className="group bg-card border border-border overflow-hidden flex flex-col sm:flex-row transition-all duration-300 hover:shadow-lg"
      >
        <div className="sm:w-1/3 aspect-[4/3] sm:aspect-auto overflow-hidden flex-shrink-0">
          <img
            src={imageSrc}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col justify-between p-6 sm:p-8 flex-1">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">
                {categoryLabel}
              </span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={11} />
                {post.readingTimeMinutes.toString()} min read
              </span>
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {formatDate(post.publishedAt)}
            </span>
            <Link
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="text-xs font-semibold text-primary hover:text-primary/80 tracking-wide uppercase transition-colors"
            >
              Read More →
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      data-ocid={`post_list.item.${index}`}
      className="group bg-card border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
    >
      <Link to="/blog/$slug" params={{ slug: post.slug }} className="block">
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={imageSrc}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-110"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">
              {categoryLabel}
            </span>
            {post.subcategory && (
              <>
                <span className="text-muted-foreground text-xs">·</span>
                <span className="text-xs text-muted-foreground">
                  {post.subcategory}
                </span>
              </>
            )}
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock size={11} />
              {post.readingTimeMinutes.toString()} min
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(post.publishedAt)}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
