import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface AboutContent {
    bioSections: Array<BioSection>;
    socialLinks: SocialLinks;
    email: string;
    portraitUrl: string;
}
export interface FileMetadata {
    id: string;
    blob: ExternalBlob;
    mimeType: string;
    uploadTimestamp: bigint;
    filename: string;
    sizeBytes: bigint;
}
export interface BioSection {
    body: string;
    heading: string;
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
export interface SocialLinks {
    linkedin: string;
    twitter: string;
    instagram: string;
}
export interface Quote {
    text: string;
    isActive: boolean;
    author: string;
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
    addFileMetadata(metadata: FileMetadata): Promise<void>;
    addRecommendation(recommendation: ReadingRecommendation): Promise<void>;
    createPost(post: Post): Promise<void>;
    createQuote(text: string, author: string): Promise<void>;
    deleteFileMetadata(id: string): Promise<void>;
    deletePost(slug: string): Promise<void>;
    deleteRecommendation(title: string): Promise<void>;
    getAboutContent(): Promise<AboutContent | null>;
    getActiveQuote(): Promise<Quote | null>;
    getFeaturedPosts(): Promise<Array<Post>>;
    getFileById(id: string): Promise<FileMetadata | null>;
    getLatestPosts(limit: bigint): Promise<Array<Post>>;
    getPostBySlug(slug: string): Promise<Post | null>;
    initialize(): Promise<void>;
    isInitialized(): Promise<boolean>;
    listAllFiles(): Promise<Array<FileMetadata>>;
    listAllPosts(): Promise<Array<Post>>;
    listFilesByType(mimeType: string): Promise<Array<FileMetadata>>;
    listPostsByCategory(category: Category): Promise<Array<Post>>;
    listPostsByTag(tag: string): Promise<Array<Post>>;
    listQuotes(): Promise<Array<Quote>>;
    listRecommendations(): Promise<Array<ReadingRecommendation>>;
    listRecommendationsByGenre(genre: string): Promise<Array<ReadingRecommendation>>;
    listSubscribers(): Promise<Array<string>>;
    replaceAllFiles(newFiles: Array<FileMetadata>): Promise<void>;
    setAboutContent(newContent: AboutContent): Promise<void>;
    setActiveQuote(text: string, author: string): Promise<void>;
    subscribeNewsletter(email: string): Promise<void>;
    toggleDraft(slug: string): Promise<void>;
    toggleFeatured(slug: string): Promise<void>;
    updateFileMetadata(id: string, updatedMetadata: FileMetadata): Promise<void>;
    updatePost(slug: string, updatedPost: Post): Promise<void>;
    updateRecommendation(title: string, updatedRecommendation: ReadingRecommendation): Promise<void>;
}
