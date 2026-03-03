import { BookOpen } from "lucide-react";
import { useMemo, useState } from "react";
import type { Category, Post } from "../backend.d";
import CategoryFilter from "../components/CategoryFilter";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PostCard from "../components/PostCard";
import SectionHero from "../components/SectionHero";
import TagCloud from "../components/TagCloud";
import { usePostsByCategory } from "../hooks/useQueries";

interface SectionListPageProps {
  category: Category;
  title: string;
  description: string;
  backgroundImage: string;
  label: string;
  subcategories?: string[];
}

function collectTags(posts: Post[]): string[] {
  const tagSet = new Set<string>();
  for (const p of posts) {
    for (const t of p.tags) {
      tagSet.add(t);
    }
  }
  return Array.from(tagSet).sort();
}

export default function SectionListPage({
  category,
  title,
  description,
  backgroundImage,
  label,
  subcategories,
}: SectionListPageProps) {
  const { data: posts = [], isLoading } = usePostsByCategory(category);
  const [selectedSubcat, setSelectedSubcat] = useState("all");
  const [selectedTag, setSelectedTag] = useState("");

  const allTags = useMemo(() => collectTags(posts), [posts]);

  const filteredPosts = useMemo(() => {
    let result = posts.filter((p) => !p.isDraft);
    if (selectedSubcat !== "all" && subcategories) {
      result = result.filter((p) => p.subcategory === selectedSubcat);
    }
    if (selectedTag) {
      result = result.filter((p) => p.tags.includes(selectedTag));
    }
    return result;
  }, [posts, selectedSubcat, selectedTag, subcategories]);

  return (
    <div>
      <SectionHero
        title={title}
        description={description}
        backgroundImage={backgroundImage}
        label={label}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Subcategory filter (IR only) */}
        {subcategories && subcategories.length > 0 && (
          <div className="mb-8">
            <CategoryFilter
              categories={subcategories}
              selected={selectedSubcat}
              onChange={setSelectedSubcat}
            />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <LoadingSkeleton count={4} />
            ) : filteredPosts.length === 0 ? (
              <div
                data-ocid="post_list.empty_state"
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
          <aside className="lg:w-64 flex-shrink-0 space-y-8">
            {allTags.length > 0 && (
              <div className="sticky top-24">
                <TagCloud
                  tags={allTags}
                  selectedTag={selectedTag}
                  onTagClick={setSelectedTag}
                />
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
