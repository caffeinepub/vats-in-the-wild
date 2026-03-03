import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  MessageSquareQuote,
  Plus,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Category, type Post, type ReadingRecommendation } from "../backend.d";
import {
  useAddRecommendation,
  useAdminActiveQuote,
  useAdminRecommendations,
  useAllPosts,
  useAllSubscribers,
  useCreatePost,
  useDeletePost,
  useDeleteRecommendation,
  useSetActiveQuote,
  useToggleDraft,
  useToggleFeatured,
  useUpdatePost,
} from "../hooks/useAdminQueries";

// ─── Auth Gate ────────────────────────────────────────────────────────────────

const ADMIN_PASSWORD = "vatswild2024";
const AUTH_KEY = "admin_auth";

function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem(AUTH_KEY) === "true";
  });

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "true");
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (pw: string) => boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onLogin(password);
    if (!ok) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center p-4">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 35%, oklch(0.50 0.10 150) 0%, transparent 50%), radial-gradient(circle at 75% 65%, oklch(0.38 0.09 148) 0%, transparent 50%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Vats in the Wild
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Admin Panel</p>
        </div>

        <Card className="border-border/40 bg-card shadow-2xl">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="admin-password"
                  className="text-sm text-muted-foreground"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="pr-10 bg-input border-border/60 focus-visible:ring-primary/40"
                    autoComplete="current-password"
                    data-ocid="admin.password_input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-destructive"
                    data-ocid="admin.login.error_state"
                  >
                    Incorrect password. Try again.
                  </motion.p>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                data-ocid="admin.login_button"
              >
                Enter Admin Panel
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          © {new Date().getFullYear()} Vats in the Wild
        </p>
      </motion.div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

type AdminTab = "dashboard" | "articles" | "quotes" | "reading" | "subscribers";

interface SidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
}

const navItems: {
  id: AdminTab;
  label: string;
  icon: React.ReactNode;
  ocid: string;
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    ocid: "admin.dashboard.tab",
  },
  {
    id: "articles",
    label: "Articles",
    icon: <FileText className="w-4 h-4" />,
    ocid: "admin.articles.tab",
  },
  {
    id: "quotes",
    label: "Quotes",
    icon: <MessageSquareQuote className="w-4 h-4" />,
    ocid: "admin.quotes.tab",
  },
  {
    id: "reading",
    label: "Reading List",
    icon: <BookOpen className="w-4 h-4" />,
    ocid: "admin.reading.tab",
  },
  {
    id: "subscribers",
    label: "Subscribers",
    icon: <Users className="w-4 h-4" />,
    ocid: "admin.subscribers.tab",
  },
];

function Sidebar({ activeTab, onTabChange, onLogout }: SidebarProps) {
  return (
    <aside className="w-56 flex-shrink-0 bg-admin-sidebar border-r border-border/30 flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="p-5 border-b border-border/30">
        <p className="font-display text-sm font-semibold text-foreground leading-tight">
          Vats in the Wild
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all duration-150 text-left ${
              activeTab === item.id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
            data-ocid={item.ocid}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border/30">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
          data-ocid="admin.logout_button"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}

// ─── Mobile Tab Bar ───────────────────────────────────────────────────────────

function MobileTabBar({
  activeTab,
  onTabChange,
}: { activeTab: AdminTab; onTabChange: (t: AdminTab) => void }) {
  return (
    <div className="flex border-b border-border/30 bg-admin-sidebar overflow-x-auto">
      {navItems.map((item) => (
        <button
          type="button"
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`flex flex-col items-center gap-1 px-4 py-3 text-xs font-medium flex-shrink-0 border-b-2 transition-colors ${
            activeTab === item.id
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          }`}
          data-ocid={item.ocid}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function DashboardSection() {
  const { data: posts, isLoading: postsLoading } = useAllPosts();
  const { data: subscribers, isLoading: subsLoading } = useAllSubscribers();

  const stats = useMemo(() => {
    const total = posts?.length ?? 0;
    const published = posts?.filter((p) => !p.isDraft).length ?? 0;
    const drafts = posts?.filter((p) => p.isDraft).length ?? 0;
    const featured = posts?.filter((p) => p.isFeatured).length ?? 0;
    return {
      total,
      published,
      drafts,
      featured,
      subscribers: subscribers?.length ?? 0,
    };
  }, [posts, subscribers]);

  const statCards = [
    {
      label: "Total Posts",
      value: stats.total,
      icon: <FileText className="w-5 h-5" />,
      color: "text-primary",
    },
    {
      label: "Published",
      value: stats.published,
      icon: <Eye className="w-5 h-5" />,
      color: "text-green-400",
    },
    {
      label: "Drafts",
      value: stats.drafts,
      icon: <EyeOff className="w-5 h-5" />,
      color: "text-yellow-400",
    },
    {
      label: "Featured",
      value: stats.featured,
      icon: <Star className="w-5 h-5" />,
      color: "text-amber-400",
    },
    {
      label: "Subscribers",
      value: stats.subscribers,
      icon: <Users className="w-5 h-5" />,
      color: "text-blue-400",
    },
  ];

  const isLoading = postsLoading || subsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Dashboard
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of your content and audience
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="bg-card border-border/40">
            <CardContent className="p-4">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-8 w-8 rounded bg-muted animate-pulse" />
                  <div className="h-6 w-12 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                </div>
              ) : (
                <>
                  <div className={`mb-2 ${stat.color}`}>{stat.icon}</div>
                  <p className="font-display text-2xl font-semibold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stat.label}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border/40">
        <CardHeader>
          <CardTitle className="font-display text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <p className="text-sm text-muted-foreground">
            Use the sidebar to manage articles, update the featured quote,
            manage your reading list, and view subscribers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Post Form ────────────────────────────────────────────────────────────────

const CATEGORIES: { value: Category; label: string }[] = [
  { value: Category.international_relations, label: "International Relations" },
  { value: Category.forest_field_notes, label: "Forest & Field Notes" },
  { value: Category.beyond_cutoff, label: "Beyond Cutoff" },
  { value: Category.wild_within, label: "Wild Within" },
  { value: Category.personal_essays, label: "Personal Essays" },
];

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface PostFormProps {
  initialPost?: Post;
  originalSlug?: string;
  onSave: () => void;
  onCancel: () => void;
}

function PostForm({
  initialPost,
  originalSlug,
  onSave,
  onCancel,
}: PostFormProps) {
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const isEditing = !!originalSlug;

  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? "");
  const [body, setBody] = useState(initialPost?.body ?? "");
  const [category, setCategory] = useState<Category>(
    initialPost?.category ?? Category.personal_essays,
  );
  const [subcategory, setSubcategory] = useState(
    initialPost?.subcategory ?? "",
  );
  const [tagsInput, setTagsInput] = useState(
    initialPost?.tags.join(", ") ?? "",
  );
  const [featuredImage, setFeaturedImage] = useState(
    initialPost?.featuredImage ?? "",
  );
  const [readingTime, setReadingTime] = useState(
    Number(initialPost?.readingTimeMinutes ?? 5),
  );
  const [metaDescription, setMetaDescription] = useState(
    initialPost?.metaDescription ?? "",
  );
  const [isDraft, setIsDraft] = useState(initialPost?.isDraft ?? true);
  const [isFeatured, setIsFeatured] = useState(
    initialPost?.isFeatured ?? false,
  );
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited]);

  const isPending = createPost.isPending || updatePost.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !body.trim() || !excerpt.trim()) {
      toast.error("Title, slug, excerpt, and body are required.");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const post: Post = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      body: body.trim(),
      category,
      subcategory: subcategory.trim() || undefined,
      tags,
      featuredImage: featuredImage.trim() || undefined,
      readingTimeMinutes: BigInt(readingTime),
      metaDescription: metaDescription.trim() || undefined,
      publishedAt: initialPost?.publishedAt ?? BigInt(Date.now()),
      isDraft,
      isFeatured,
    };

    try {
      if (isEditing && originalSlug) {
        await updatePost.mutateAsync({ slug: originalSlug, post });
        toast.success("Article updated successfully.");
      } else {
        await createPost.mutateAsync(post);
        toast.success("Article created successfully.");
      }
      onSave();
    } catch {
      toast.error("Failed to save article. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-ocid="admin.post.cancel_button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </button>
      </div>

      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          {isEditing ? "Edit Article" : "New Article"}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {isEditing
            ? `Editing: ${initialPost?.title}`
            : "Create a new post for the journal"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title"
              className="bg-input border-border/60"
              data-ocid="admin.post.title_input"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Slug *</Label>
            <Input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManuallyEdited(true);
              }}
              placeholder="url-friendly-slug"
              className="bg-input border-border/60 font-mono text-sm"
              data-ocid="admin.post.slug_input"
            />
          </div>
        </div>

        {/* Excerpt */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Excerpt *</Label>
          <Textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A brief summary for listings and previews..."
            rows={2}
            className="bg-input border-border/60 resize-none"
            data-ocid="admin.post.excerpt_textarea"
          />
        </div>

        {/* Body */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Body *</Label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write the full article here..."
            rows={16}
            className="bg-input border-border/60 resize-y font-mono text-sm leading-relaxed"
            data-ocid="admin.post.body_textarea"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Category *</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as Category)}
            >
              <SelectTrigger
                className="bg-input border-border/60"
                data-ocid="admin.post.category_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Subcategory{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="e.g. Indo-Pacific, Climate Diplomacy"
              className="bg-input border-border/60"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Tags{" "}
              <span className="text-muted-foreground font-normal">
                (comma-separated)
              </span>
            </Label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="india, forest, geopolitics"
              className="bg-input border-border/60"
            />
          </div>

          {/* Reading Time */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Reading Time (minutes)
            </Label>
            <Input
              type="number"
              value={readingTime}
              onChange={(e) => setReadingTime(Number(e.target.value))}
              min={1}
              max={120}
              className="bg-input border-border/60"
            />
          </div>
        </div>

        {/* Featured Image URL */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">
            Featured Image URL{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Input
            value={featuredImage}
            onChange={(e) => setFeaturedImage(e.target.value)}
            placeholder="https://..."
            className="bg-input border-border/60"
          />
        </div>

        {/* Meta Description */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">
            Meta Description{" "}
            <span className="text-muted-foreground font-normal">
              (optional, ≤160 chars)
            </span>
          </Label>
          <Textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="SEO description..."
            rows={2}
            maxLength={160}
            className="bg-input border-border/60 resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">
            {metaDescription.length}/160
          </p>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-6 pt-1">
          <div className="flex items-center gap-3">
            <Switch
              id="isDraft"
              checked={isDraft}
              onCheckedChange={setIsDraft}
            />
            <Label htmlFor="isDraft" className="text-sm cursor-pointer">
              Save as Draft
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="isFeatured"
              checked={isFeatured}
              onCheckedChange={setIsFeatured}
            />
            <Label htmlFor="isFeatured" className="text-sm cursor-pointer">
              Mark as Featured
            </Label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-border/30">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            data-ocid="admin.post.submit_button"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : isEditing ? (
              "Update Article"
            ) : (
              "Publish Article"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-border/60"
            data-ocid="admin.post.cancel_button"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─── Articles Manager ─────────────────────────────────────────────────────────

function ArticlesSection() {
  const { data: posts, isLoading } = useAllPosts();
  const deletePost = useDeletePost();
  const toggleDraft = useToggleDraft();
  const toggleFeatured = useToggleFeatured();

  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [confirmDeleteSlug, setConfirmDeleteSlug] = useState<string | null>(
    null,
  );

  const categoryLabel = (cat: Category) => {
    return CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
  };

  const handleDelete = async () => {
    if (!confirmDeleteSlug) return;
    setDeletingSlug(confirmDeleteSlug);
    try {
      await deletePost.mutateAsync(confirmDeleteSlug);
      toast.success("Article deleted.");
    } catch {
      toast.error("Failed to delete article.");
    } finally {
      setDeletingSlug(null);
      setConfirmDeleteSlug(null);
    }
  };

  if (isCreating) {
    return (
      <PostForm
        onSave={() => setIsCreating(false)}
        onCancel={() => setIsCreating(false)}
      />
    );
  }

  if (editingPost) {
    return (
      <PostForm
        initialPost={editingPost}
        originalSlug={editingPost.slug}
        onSave={() => setEditingPost(null)}
        onCancel={() => setEditingPost(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Articles
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {posts?.length ?? 0} total articles
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          data-ocid="admin.new_article_button"
        >
          <Plus className="w-4 h-4" />
          New Article
        </Button>
      </div>

      <Card className="bg-card border-border/40">
        <CardContent className="p-0">
          {isLoading ? (
            <div
              className="p-8 text-center text-muted-foreground"
              data-ocid="admin.articles.loading_state"
            >
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading articles...
            </div>
          ) : !posts?.length ? (
            <div
              className="p-12 text-center"
              data-ocid="admin.articles.empty_state"
            >
              <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">
                No articles yet. Create your first one.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-medium">
                      Title
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Category
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Featured
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post, index) => (
                    <TableRow
                      key={post.slug}
                      className="border-border/30 hover:bg-muted/20"
                      data-ocid={`admin.articles.item.${index + 1}`}
                    >
                      <TableCell className="font-medium max-w-[200px]">
                        <p className="truncate text-sm">{post.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                          /{post.slug}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {categoryLabel(post.category)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={post.isDraft ? "secondary" : "default"}
                          className={`text-xs ${post.isDraft ? "bg-muted text-muted-foreground" : "bg-primary/20 text-primary border-primary/30"}`}
                        >
                          {post.isDraft ? "Draft" : "Published"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {post.isFeatured && (
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400/30" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDraft.mutateAsync(post.slug)}
                            disabled={toggleDraft.isPending}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                            title={post.isDraft ? "Publish" : "Move to draft"}
                            data-ocid={`admin.article.toggle_button.${index + 1}`}
                          >
                            {post.isDraft ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              toggleFeatured.mutateAsync(post.slug)
                            }
                            disabled={toggleFeatured.isPending}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-amber-400"
                            title={post.isFeatured ? "Unfeature" : "Feature"}
                            data-ocid={`admin.article.star_button.${index + 1}`}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${post.isFeatured ? "text-amber-400" : ""}`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingPost(post)}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                            data-ocid={`admin.article.edit_button.${index + 1}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDeleteSlug(post.slug)}
                            disabled={deletingSlug === post.slug}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                            data-ocid={`admin.article.delete_button.${index + 1}`}
                          >
                            {deletingSlug === post.slug ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!confirmDeleteSlug}
        onOpenChange={(open) => !open && setConfirmDeleteSlug(null)}
      >
        <DialogContent className="bg-card border-border/40">
          <DialogHeader>
            <DialogTitle className="font-display">Delete Article?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This action cannot be undone. The article will be permanently
              removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteSlug(null)}
              className="border-border/60"
              data-ocid="admin.article.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePost.isPending}
              data-ocid="admin.article.confirm_button"
            >
              {deletePost.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete Article"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Quotes Manager ───────────────────────────────────────────────────────────

function QuotesSection() {
  const { data: activeQuote, isLoading } = useAdminActiveQuote();
  const setActiveQuote = useSetActiveQuote();

  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    if (activeQuote) {
      setText(activeQuote.text);
      setAuthor(activeQuote.author);
    }
  }, [activeQuote]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !author.trim()) {
      toast.error("Both quote text and author are required.");
      return;
    }
    try {
      await setActiveQuote.mutateAsync({
        text: text.trim(),
        author: author.trim(),
      });
      toast.success("Quote updated successfully.");
    } catch {
      toast.error("Failed to update quote.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Quote of the Month
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Set the active quote displayed on your homepage
        </p>
      </div>

      {/* Current Quote Preview */}
      {isLoading ? (
        <Card className="bg-card border-border/40">
          <CardContent className="p-6 space-y-3">
            <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ) : activeQuote ? (
        <Card className="bg-card border-border/40">
          <CardContent className="p-6">
            <p className="text-xs text-primary/70 font-medium uppercase tracking-widest mb-3">
              Current Active Quote
            </p>
            <blockquote className="border-l-2 border-primary/40 pl-4">
              <p className="font-display text-lg italic text-foreground/90 leading-relaxed">
                "{activeQuote.text}"
              </p>
              <footer className="mt-2 text-sm text-muted-foreground">
                — {activeQuote.author}
              </footer>
            </blockquote>
          </CardContent>
        </Card>
      ) : null}

      {/* Edit Form */}
      <Card className="bg-card border-border/40">
        <CardHeader>
          <CardTitle className="font-display text-lg">Update Quote</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Quote Text</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the quote..."
                rows={4}
                className="bg-input border-border/60 resize-none"
                data-ocid="admin.quote.text_textarea"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Author / Attribution
              </Label>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Aldo Leopold, Jim Corbett"
                className="bg-input border-border/60"
                data-ocid="admin.quote.author_input"
              />
            </div>
            <Button
              type="submit"
              disabled={setActiveQuote.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              data-ocid="admin.quote.save_button"
            >
              {setActiveQuote.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                "Save Quote"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Reading List Manager ─────────────────────────────────────────────────────

function ReadingSection() {
  const { data: recs, isLoading } = useAdminRecommendations();
  const addRec = useAddRecommendation();
  const deleteRec = useDeleteRecommendation();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [genre, setGenre] = useState("");
  const [deletingTitle, setDeletingTitle] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !title.trim() ||
      !author.trim() ||
      !description.trim() ||
      !genre.trim()
    ) {
      toast.error("Title, author, description, and genre are required.");
      return;
    }
    const rec: ReadingRecommendation = {
      title: title.trim(),
      author: author.trim(),
      description: description.trim(),
      link: link.trim() || undefined,
      genre: genre.trim(),
      addedAt: BigInt(Date.now()),
    };
    try {
      await addRec.mutateAsync(rec);
      toast.success("Recommendation added.");
      setTitle("");
      setAuthor("");
      setDescription("");
      setLink("");
      setGenre("");
    } catch {
      toast.error("Failed to add recommendation.");
    }
  };

  const handleDelete = async (bookTitle: string) => {
    setDeletingTitle(bookTitle);
    try {
      await deleteRec.mutateAsync(bookTitle);
      toast.success("Recommendation removed.");
    } catch {
      toast.error("Failed to delete recommendation.");
    } finally {
      setDeletingTitle(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Reading Recommendations
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage books and resources on your reading list
        </p>
      </div>

      {/* Current List */}
      <Card className="bg-card border-border/40">
        <CardHeader>
          <CardTitle className="font-display text-lg">
            Current List ({recs?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
              Loading...
            </div>
          ) : !recs?.length ? (
            <div
              className="p-8 text-center text-muted-foreground"
              data-ocid="admin.reading.empty_state"
            >
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm">No recommendations yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {recs.map((rec, index) => (
                <div
                  key={rec.title}
                  className="flex items-start justify-between gap-4 p-4 hover:bg-muted/10 transition-colors"
                  data-ocid={`admin.reading.item.${index + 1}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-foreground truncate">
                      {rec.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      by {rec.author}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge
                        variant="secondary"
                        className="text-xs bg-muted/60 text-muted-foreground"
                      >
                        {rec.genre}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(rec.title)}
                    disabled={deletingTitle === rec.title}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
                    data-ocid={`admin.reading.delete_button.${index + 1}`}
                  >
                    {deletingTitle === rec.title ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Form */}
      <Card className="bg-card border-border/40">
        <CardHeader>
          <CardTitle className="font-display text-lg">
            Add Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Book Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The Snow Leopard"
                  className="bg-input border-border/60"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Author *</Label>
                <Input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Peter Matthiessen"
                  className="bg-input border-border/60"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Genre *</Label>
                <Input
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="Nature Writing, Geopolitics, History..."
                  className="bg-input border-border/60"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Link{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  className="bg-input border-border/60"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Description *</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why you recommend this book..."
                rows={3}
                className="bg-input border-border/60 resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={addRec.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              {addRec.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Add Book
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Subscribers ──────────────────────────────────────────────────────────────

function SubscribersSection() {
  const { data: subscribers, isLoading } = useAllSubscribers();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Subscribers
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {subscribers?.length ?? 0} newsletter subscribers
        </p>
      </div>

      <Card className="bg-card border-border/40">
        <CardContent className="p-0" data-ocid="admin.subscribers.list">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
              Loading subscribers...
            </div>
          ) : !subscribers?.length ? (
            <div
              className="p-12 text-center"
              data-ocid="admin.subscribers.empty_state"
            >
              <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No subscribers yet.
              </p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Subscribers will appear here after signing up on the homepage.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {subscribers.map((email, index) => (
                <div
                  key={email}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/10 transition-colors"
                  data-ocid={`admin.subscribers.item.${index + 1}`}
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary font-medium">
                      {email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-foreground">{email}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  const content = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardSection />;
      case "articles":
        return <ArticlesSection />;
      case "quotes":
        return <QuotesSection />;
      case "reading":
        return <ReadingSection />;
      case "subscribers":
        return <SubscribersSection />;
    }
  };

  return (
    <div className="min-h-screen bg-admin-bg text-foreground flex flex-col">
      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border/30 bg-admin-sidebar">
        <div>
          <p className="font-display text-sm font-semibold">Vats in the Wild</p>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="text-muted-foreground hover:text-destructive transition-colors p-2"
          data-ocid="admin.logout_button"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Mobile tabs */}
      <div className="md:hidden">
        <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Desktop layout */}
      <div className="flex flex-1">
        <div className="hidden md:block">
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={onLogout}
          />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {content()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { isAuthenticated, login, logout } = useAdminAuth();

  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} />;
  }

  return <AdminPanel onLogout={logout} />;
}
