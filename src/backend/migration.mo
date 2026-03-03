import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import List "mo:core/List";
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

  type OldActor = {
    posts : Map.Map<Text, Post>;
    subscribers : Set.Set<Text>;
    quotes : Map.Map<Text, Quote>;
    recommendations : Map.Map<Text, ReadingRecommendation>;
  };

  type NewActor = {
    posts : Map.Map<Text, Post>;
    subscribers : Set.Set<Text>;
    quotes : Map.Map<Text, Quote>;
    recommendations : Map.Map<Text, ReadingRecommendation>;
    aboutContent : ?AboutContent;
    files : Map.Map<Text, FileMetadata>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      aboutContent = null;
      files = Map.empty<Text, FileMetadata>();
    };
  };
};
