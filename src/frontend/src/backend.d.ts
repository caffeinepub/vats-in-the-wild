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
export interface SiteSettings {
    headingFont: string;
    section2Description: string;
    footerTagline: string;
    section6Label: string;
    section1Label: string;
    section6Description: string;
    upscPageBg: string;
    wildLabel: string;
    borderRadius: string;
    section7Title: string;
    section2Title: string;
    aboutBioBg: string;
    forestDescription: string;
    irPageBg: string;
    footerEmail: string;
    heroCtaSecondary: string;
    containerMaxWidth: string;
    colorCard: string;
    colorBorder: string;
    section8Image: string;
    section3Image: string;
    newsletterTitle: string;
    latestArticlesTitle: string;
    aboutPortraitUrl: string;
    irDescription: string;
    aboutPreviewText1: string;
    aboutPreviewText2: string;
    footerInstagram: string;
    colorMuted: string;
    homepageAboutBg: string;
    section4Label: string;
    aboutPreviewName: string;
    footerQuoteAuthor: string;
    section5Title: string;
    baseFontSize: string;
    section3Description: string;
    irTitle: string;
    upscDescription: string;
    forestLabel: string;
    section7Description: string;
    essaysLabel: string;
    sectionPadding: string;
    newsletterPlaceholder: string;
    upscTitle: string;
    section6Image: string;
    section1Image: string;
    aboutWritingBg: string;
    aboutPageTitle: string;
    aboutContactBg: string;
    colorForeground: string;
    wildPageBg: string;
    footerLinkedin: string;
    homepageQuoteBg: string;
    footerDescription: string;
    section7Label: string;
    section2Label: string;
    homepageSectionsBg: string;
    section8Title: string;
    aboutPreviewSubtitle: string;
    section3Title: string;
    colorBackground: string;
    wildDescription: string;
    siteName: string;
    newsletterLabel: string;
    newsletterSubtitle: string;
    latestArticlesLabel: string;
    section4Description: string;
    section4Image: string;
    siteSubtitle: string;
    section8Description: string;
    forestPageBg: string;
    essaysDescription: string;
    section5Label: string;
    irLabel: string;
    section6Title: string;
    section1Title: string;
    heroCtaPrimary: string;
    sectionCount: string;
    colorPrimary: string;
    wildTitle: string;
    homepageLatestBg: string;
    upscLabel: string;
    homepageNewsletterBg: string;
    aboutValuesBg: string;
    section7Image: string;
    section2Image: string;
    section1Description: string;
    bodyFont: string;
    footerCopyright: string;
    section5Description: string;
    heroOverlayOpacity: string;
    heroTitle: string;
    aboutPageSubtitle: string;
    section8Label: string;
    section3Label: string;
    section4Title: string;
    heroBackgroundImage: string;
    forestTitle: string;
    essaysTitle: string;
    section5Image: string;
    footerQuoteText: string;
    heroEyebrow: string;
    essaysPageBg: string;
    heroTagline: string;
    footerTwitter: string;
    aboutPageBg: string;
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
    getSiteSettings(): Promise<SiteSettings>;
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
    setSiteSettings(settings: SiteSettings): Promise<void>;
    subscribeNewsletter(email: string): Promise<void>;
    toggleDraft(slug: string): Promise<void>;
    toggleFeatured(slug: string): Promise<void>;
    updateFileMetadata(id: string, updatedMetadata: FileMetadata): Promise<void>;
    updatePost(slug: string, updatedPost: Post): Promise<void>;
    updateRecommendation(title: string, updatedRecommendation: ReadingRecommendation): Promise<void>;
}
