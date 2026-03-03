import { Badge } from "@/components/ui/badge";

interface TagCloudProps {
  tags: string[];
  onTagClick?: (tag: string) => void;
  selectedTag?: string;
}

export default function TagCloud({
  tags,
  onTagClick,
  selectedTag,
}: TagCloudProps) {
  if (tags.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
        Topics
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTag === tag ? "default" : "outline"}
            className={`cursor-pointer text-xs font-normal tracking-wide transition-colors hover:bg-primary hover:text-primary-foreground ${
              selectedTag === tag
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground border-border hover:border-primary"
            }`}
            onClick={() => onTagClick?.(selectedTag === tag ? "" : tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
