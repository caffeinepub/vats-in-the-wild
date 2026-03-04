import Map "mo:core/Map";
import Set "mo:core/Set";
import Storage "blob-storage/Storage";

module {
  type Category = {
    #international_relations;
    #forest_field_notes;
    #beyond_cutoff;
    #wild_within;
    #personal_essays;
  };

  type FileMetadata = {
    id : Text;
    blob : Storage.ExternalBlob;
    filename : Text;
    mimeType : Text;
    sizeBytes : Nat;
    uploadTimestamp : Int;
  };

  type AboutContent = {
    portraitUrl : Text;
    bioSections : [BioSection];
    email : Text;
    socialLinks : SocialLinks;
  };

  type SocialLinks = {
    linkedin : Text;
    twitter : Text;
    instagram : Text;
  };

  type BioSection = {
    heading : Text;
    body : Text;
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

  type NewsletterSubscriber = {
    email : Text;
    subscribedAt : Int;
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

  type OldSiteSettings = {
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

  type NewSiteSettings = {
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
    sectionCount : Text;
    section6Title : Text;
    section6Description : Text;
    section6Label : Text;
    section7Title : Text;
    section7Description : Text;
    section7Label : Text;
    section8Title : Text;
    section8Description : Text;
    section8Label : Text;
    heroBackgroundImage : Text;
    section1Image : Text;
    section2Image : Text;
    section3Image : Text;
    section4Image : Text;
    section5Image : Text;
    section6Image : Text;
    section7Image : Text;
    section8Image : Text;
    irPageBg : Text;
    forestPageBg : Text;
    upscPageBg : Text;
    wildPageBg : Text;
    essaysPageBg : Text;
    aboutPageBg : Text;
    irTitle : Text;
    irDescription : Text;
    irLabel : Text;
    forestTitle : Text;
    forestDescription : Text;
    forestLabel : Text;
    upscTitle : Text;
    upscDescription : Text;
    upscLabel : Text;
    wildTitle : Text;
    wildDescription : Text;
    wildLabel : Text;
    essaysTitle : Text;
    essaysDescription : Text;
    essaysLabel : Text;
    aboutPageTitle : Text;
    aboutPageSubtitle : Text;
    newsletterLabel : Text;
    newsletterTitle : Text;
    newsletterSubtitle : Text;
    newsletterPlaceholder : Text;
    latestArticlesLabel : Text;
    latestArticlesTitle : Text;
  };

  type OldActor = {
    posts : Map.Map<Text, Post>;
    subscribers : Set.Set<Text>;
    quotes : Map.Map<Text, Quote>;
    recommendations : Map.Map<Text, ReadingRecommendation>;
    aboutContent : ?AboutContent;
    files : Map.Map<Text, FileMetadata>;
    siteSettings : ?OldSiteSettings;
  };

  type NewActor = {
    posts : Map.Map<Text, Post>;
    subscribers : Set.Set<Text>;
    quotes : Map.Map<Text, Quote>;
    recommendations : Map.Map<Text, ReadingRecommendation>;
    aboutContent : ?AboutContent;
    files : Map.Map<Text, FileMetadata>;
    siteSettings : ?NewSiteSettings;
  };

  public func run(old : OldActor) : NewActor {
    let newSiteSettings : ?NewSiteSettings = switch (old.siteSettings) {
      case (null) { null };
      case (?old) {
        ?{
          siteName = old.siteName;
          siteSubtitle = old.siteSubtitle;
          heroTitle = old.heroTitle;
          heroTagline = old.heroTagline;
          heroEyebrow = old.heroEyebrow;
          heroCtaPrimary = old.heroCtaPrimary;
          heroCtaSecondary = old.heroCtaSecondary;
          heroOverlayOpacity = old.heroOverlayOpacity;
          aboutPreviewText1 = old.aboutPreviewText1;
          aboutPreviewText2 = old.aboutPreviewText2;
          aboutPreviewName = old.aboutPreviewName;
          aboutPreviewSubtitle = old.aboutPreviewSubtitle;
          aboutPortraitUrl = old.aboutPortraitUrl;
          footerTagline = old.footerTagline;
          footerDescription = old.footerDescription;
          footerEmail = old.footerEmail;
          footerLinkedin = old.footerLinkedin;
          footerTwitter = old.footerTwitter;
          footerInstagram = old.footerInstagram;
          footerQuoteText = old.footerQuoteText;
          footerQuoteAuthor = old.footerQuoteAuthor;
          footerCopyright = old.footerCopyright;
          colorBackground = old.colorBackground;
          colorForeground = old.colorForeground;
          colorPrimary = old.colorPrimary;
          colorCard = old.colorCard;
          colorMuted = old.colorMuted;
          colorBorder = old.colorBorder;
          headingFont = old.headingFont;
          bodyFont = old.bodyFont;
          baseFontSize = old.baseFontSize;
          containerMaxWidth = old.containerMaxWidth;
          sectionPadding = old.sectionPadding;
          borderRadius = old.borderRadius;
          section1Title = old.section1Title;
          section1Description = old.section1Description;
          section1Label = old.section1Label;
          section2Title = old.section2Title;
          section2Description = old.section2Description;
          section2Label = old.section2Label;
          section3Title = old.section3Title;
          section3Description = old.section3Description;
          section3Label = old.section3Label;
          section4Title = old.section4Title;
          section4Description = old.section4Description;
          section4Label = old.section4Label;
          section5Title = old.section5Title;
          section5Description = old.section5Description;
          section5Label = old.section5Label;

          // New fields with default values
          sectionCount = "5";
          section6Title = "";
          section6Description = "";
          section6Label = "";
          section7Title = "";
          section7Description = "";
          section7Label = "";
          section8Title = "";
          section8Description = "";
          section8Label = "";
          heroBackgroundImage = "";
          section1Image = "";
          section2Image = "";
          section3Image = "";
          section4Image = "";
          section5Image = "";
          section6Image = "";
          section7Image = "";
          section8Image = "";
          irPageBg = "";
          forestPageBg = "";
          upscPageBg = "";
          wildPageBg = "";
          essaysPageBg = "";
          aboutPageBg = "";
          irTitle = "International Relations";
          irDescription = "Analytical essays on geopolitics, India`s foreign policy, strategic affairs, and global power shifts.";
          irLabel = "World Affairs";
          forestTitle = "Forest & Field Notes";
          forestDescription = "Field experiences, wildlife insights, conservation challenges, and policy reflections.";
          forestLabel = "Conservation";
          upscTitle = "Beyond Cutoff";
          upscDescription = "High-quality insights for civil services aspirants: strategy, mindset, and discipline.";
          upscLabel = "UPSC Strategy";
          wildTitle = "The Wild Within";
          wildDescription = "Travel, trekking, fitness, photography, and reflections on the human experience.";
          wildLabel = "Explorations";
          essaysTitle = "Personal Essays";
          essaysDescription = "Long-form reflections on leadership, public service, growth, and solitude.";
          essaysLabel = "Reflections";
          aboutPageTitle = "About";
          aboutPageSubtitle = "Indian Forest Service Officer";
          newsletterLabel = "Dispatches";
          newsletterTitle = "Stay in the Field";
          newsletterSubtitle = "Occasional dispatches — essays, insights, field notes. No noise.";
          newsletterPlaceholder = "Your email address";
          latestArticlesLabel = "Recent Writing";
          latestArticlesTitle = "From the Journal";
        };
      };
    };

    {
      posts = old.posts;
      subscribers = old.subscribers;
      quotes = old.quotes;
      recommendations = old.recommendations;
      aboutContent = old.aboutContent;
      files = old.files;
      siteSettings = newSiteSettings;
    };
  };
};
