import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Bool "mo:core/Bool";

import Storage "blob-storage/Storage";

module {
  type Category = {
    #international_relations;
    #forest_field_notes;
    #beyond_cutoff;
    #wild_within;
    #personal_essays;
  };

  type Post = {
    title : Text;
    slug : Text;
    excerpt : Text;
    body : Text;
    category : Category;
    subcategory : ?Text;
    tags : [Text];
    featuredImage : ?Text;
    readingTimeMinutes : Nat;
    metaDescription : ?Text;
    publishedAt : Int;
    isDraft : Bool;
    isFeatured : Bool;
  };

  type NewsletterSubscriber = {
    email : Text;
    subscribedAt : Int;
  };

  type Quote = {
    text : Text;
    author : Text;
    isActive : Bool;
  };

  type ReadingRecommendation = {
    title : Text;
    author : Text;
    description : Text;
    link : ?Text;
    genre : Text;
    addedAt : Int;
  };

  type BioSection = {
    heading : Text;
    body : Text;
  };

  type SocialLinks = {
    linkedin : Text;
    twitter : Text;
    instagram : Text;
  };

  type AboutContent = {
    portraitUrl : Text;
    bioSections : [BioSection];
    email : Text;
    socialLinks : SocialLinks;
  };

  type FileMetadata = {
    id : Text;
    blob : Storage.ExternalBlob;
    filename : Text;
    mimeType : Text;
    sizeBytes : Nat;
    uploadTimestamp : Int;
  };

  type SiteSettings = {
    siteName : Text;
    siteSubtitle : Text;
    heroTitle : Text;
    heroTagline : Text;
    heroEyebrow : Text;
    heroCtaPrimary : Text;
    heroCtaSecondary : Text;
    heroOverlayOpacity : Text;
    aboutPreviewText1 : Text;
    aboutPreviewText2 : Text;
    aboutPreviewName : Text;
    aboutPreviewSubtitle : Text;
    aboutPortraitUrl : Text;
    footerTagline : Text;
    footerDescription : Text;
    footerEmail : Text;
    footerLinkedin : Text;
    footerTwitter : Text;
    footerInstagram : Text;
    footerQuoteText : Text;
    footerQuoteAuthor : Text;
    footerCopyright : Text;
    colorBackground : Text;
    colorForeground : Text;
    colorPrimary : Text;
    colorCard : Text;
    colorMuted : Text;
    colorBorder : Text;
    headingFont : Text;
    bodyFont : Text;
    baseFontSize : Text;
    containerMaxWidth : Text;
    sectionPadding : Text;
    borderRadius : Text;
    section1Title : Text;
    section1Description : Text;
    section1Label : Text;
    section2Title : Text;
    section2Description : Text;
    section2Label : Text;
    section3Title : Text;
    section3Description : Text;
    section3Label : Text;
    section4Title : Text;
    section4Description : Text;
    section4Label : Text;
    section5Title : Text;
    section5Description : Text;
    section5Label : Text;
  };

  type OldActor = {
    posts : Map.Map<Text, Post>;
    subscribers : Set.Set<Text>;
    quotes : Map.Map<Text, Quote>;
    recommendations : Map.Map<Text, ReadingRecommendation>;
    aboutContent : ?AboutContent;
    files : Map.Map<Text, FileMetadata>;
  };

  type NewActor = {
    posts : Map.Map<Text, Post>;
    subscribers : Set.Set<Text>;
    quotes : Map.Map<Text, Quote>;
    recommendations : Map.Map<Text, ReadingRecommendation>;
    aboutContent : ?AboutContent;
    files : Map.Map<Text, FileMetadata>;
    siteSettings : ?SiteSettings;
  };

  public func run(old : OldActor) : NewActor {
    { old with siteSettings = null };
  };
};
