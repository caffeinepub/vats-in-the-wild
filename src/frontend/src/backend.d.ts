import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Quote {
    text: string;
    isActive: boolean;
    author: string;
}
export interface Post {
    metaDescription?: string;
    title: string;
    subcategory?: string;
    body: string;
    featuredImage?: string;
    slug: string;
    tags: Array<string>;
    publishedAt: bigint;
    readingTimeMinutes: bigint;
    isDraft: boolean;
    isFeatured: boolean;
    excerpt: string;
    category: Category;
}
export interface ReadingRecommendation {
    title: string;
    link?: string;
    description: string;
    author: string;
    genre: string;
    addedAt: bigint;
}
export enum Category {
    forest_field_notes = "forest_field_notes",
    personal_essays = "personal_essays",
    beyond_cutoff = "beyond_cutoff",
    wild_within = "wild_within",
    international_relations = "international_relations"
}
export interface backendInterface {
    addRecommendation(recommendation: ReadingRecommendation): Promise<void>;
    createPost(post: Post): Promise<void>;
    createQuote(text: string, author: string): Promise<void>;
    deletePost(slug: string): Promise<void>;
    deleteRecommendation(title: string): Promise<void>;
    getActiveQuote(): Promise<Quote | null>;
    getFeaturedPosts(): Promise<Array<Post>>;
    getLatestPosts(limit: bigint): Promise<Array<Post>>;
    getPostBySlug(slug: string): Promise<Post | null>;
    initialize(): Promise<void>;
    isInitialized(): Promise<boolean>;
    listAllPosts(): Promise<Array<Post>>;
    listPostsByCategory(category: Category): Promise<Array<Post>>;
    listPostsByTag(tag: string): Promise<Array<Post>>;
    listQuotes(): Promise<Array<Quote>>;
    listRecommendations(): Promise<Array<ReadingRecommendation>>;
    listRecommendationsByGenre(genre: string): Promise<Array<ReadingRecommendation>>;
    listSubscribers(): Promise<Array<string>>;
    setActiveQuote(text: string, author: string): Promise<void>;
    subscribeNewsletter(email: string): Promise<void>;
    toggleDraft(slug: string): Promise<void>;
    toggleFeatured(slug: string): Promise<void>;
    updatePost(slug: string, updatedPost: Post): Promise<void>;
    updateRecommendation(title: string, updatedRecommendation: ReadingRecommendation): Promise<void>;
}
