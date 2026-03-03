import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Bool "mo:core/Bool";
import Migration "migration";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

// Enable data migration via migration module and with-clause
(with migration = Migration.run)
actor {
  include MixinStorage();

  public type Category = {
    #international_relations;
    #forest_field_notes;
    #beyond_cutoff;
    #wild_within;
    #personal_essays;
  };

  public type Post = {
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

  public type NewsletterSubscriber = {
    email : Text;
    subscribedAt : Int;
  };

  public type Quote = {
    text : Text;
    author : Text;
    isActive : Bool;
  };

  public type ReadingRecommendation = {
    title : Text;
    author : Text;
    description : Text;
    link : ?Text;
    genre : Text;
    addedAt : Int;
  };

  public type BioSection = {
    heading : Text;
    body : Text;
  };

  public type SocialLinks = {
    linkedin : Text;
    twitter : Text;
    instagram : Text;
  };

  public type AboutContent = {
    portraitUrl : Text;
    bioSections : [BioSection];
    email : Text;
    socialLinks : SocialLinks;
  };

  public type FileMetadata = {
    id : Text;
    blob : Storage.ExternalBlob;
    filename : Text;
    mimeType : Text;
    sizeBytes : Nat;
    uploadTimestamp : Int;
  };

  module PostEntity {
    public func compareByPublishedAt(p1 : Post, p2 : Post) : Order.Order {
      Int.compare(p2.publishedAt, p1.publishedAt);
    };
  };

  module ReadingRecommendation {
    public func compareByAddedAt(r1 : ReadingRecommendation, r2 : ReadingRecommendation) : Order.Order {
      Int.compare(r2.addedAt, r1.addedAt);
    };
  };

  var posts = Map.empty<Text, Post>();
  var subscribers = Set.empty<Text>();
  var quotes = Map.empty<Text, Quote>();
  var recommendations = Map.empty<Text, ReadingRecommendation>();
  var aboutContent : ?AboutContent = null;
  var files = Map.empty<Text, FileMetadata>();

  func seedData() {
    let timestamp : Int = 100000;

    let samplePosts = [
      {
        title = "Shaping Global Environmental Policy";
        slug = "shaping-global-environmental-policy";
        excerpt = "Exploring India`s role in international conservation efforts.";
        body = "Detailed article on conferences and treaties...";
        category = #international_relations;
        subcategory = ?"Climate Policy";
        tags = ["international", "policy"];
        featuredImage = ?"https://placeholder.com/image1.jpg";
        readingTimeMinutes = 8;
        metaDescription = ?"How India influences global environmental policy";
        publishedAt = timestamp - 1728000;
        isDraft = false;
        isFeatured = true;
      },
      {
        title = "Jungle Survival Stories";
        slug = "jungle-survival-stories";
        excerpt = "Firsthand experiences of surviving the wild.";
        body = "Action-packed stories from forest life...";
        category = #forest_field_notes;
        subcategory = ?"Survival";
        tags = ["field", "adventure"];
        featuredImage = ?"https://placeholder.com/image2.jpg";
        readingTimeMinutes = 10;
        metaDescription = ?"Exciting survival stories from the jungle";
        publishedAt = timestamp - 864000;
        isDraft = false;
        isFeatured = false;
      },
      {
        title = "Living Beyond the Cutoff";
        slug = "living-beyond-cutoff";
        excerpt = "Life lessons from remote forest areas.";
        body = "In-depth look at daily challenges and rewards...";
        category = #beyond_cutoff;
        subcategory = ?"Daily Life";
        tags = ["remote", "challenges"];
        featuredImage = ?"https://placeholder.com/image3.jpg";
        readingTimeMinutes = 7;
        metaDescription = ?"Life in remote forest areas";
        publishedAt = timestamp - 604800;
        isDraft = false;
        isFeatured = false;
      },
      {
        title = "Wild Within: Introspection in the Wilderness";
        slug = "wild-within-introspection";
        excerpt = "Finding peace and meaning in nature.";
        body = "Philosophical musings from forest officer’s perspective...";
        category = #wild_within;
        subcategory = ?"Spirituality";
        tags = ["introspection", "nature"];
        featuredImage = ?"https://placeholder.com/image4.jpg";
        readingTimeMinutes = 6;
        metaDescription = ?"Introspection and spirituality in nature";
        publishedAt = timestamp - 432000;
        isDraft = false;
        isFeatured = true;
      },
      {
        title = "Personal Essays: Growth Through Challenges";
        slug = "personal-essays-growth";
        excerpt = "Reflections on personal and professional growth.";
        body = "Essays on self-development and lessons learned...";
        category = #personal_essays;
        subcategory = ?"Growth";
        tags = ["essays", "growth"];
        featuredImage = ?"https://placeholder.com/image5.jpg";
        readingTimeMinutes = 9;
        metaDescription = ?"Personal and professional growth essays";
        publishedAt = timestamp - 259200;
        isDraft = false;
        isFeatured = false;
      },
    ];

    for (post in samplePosts.values()) {
      posts.add(post.slug, post);
    };

    let sampleQuote : Quote = {
      text = "The forest is not just a resource, it is life itself.";
      author = "Shubham Vats";
      isActive = true;
    };
    quotes.add("active", sampleQuote);

    let sampleRecommendations = [
      {
        title = "Conservation Chronicles";
        author = "Jane Goodall";
        description = "Must-read book on conservation efforts worldwide.";
        link = ?"https://booklink.com/chronic";
        genre = "Conservation";
        addedAt = timestamp - 86400;
      },
      {
        title = "Biodiversity Explained";
        author = "David Attenborough";
        description = "Documentary on biodiversity importance.";
        link = ?"https://documentary.com/biodiversity";
        genre = "Documentary";
        addedAt = timestamp - 172800;
      },
      {
        title = "Mindfulness and Nature";
        author = "Thich Nhat Hanh";
        description = "Meditation techniques for the modern world inspired by nature.";
        link = ?"https://meditation.com/nature";
        genre = "Spirituality";
        addedAt = timestamp - 259200;
      },
    ];

    for (recommendation in sampleRecommendations.values()) {
      recommendations.add(recommendation.title, recommendation);
    };

    let initialAboutContent : AboutContent = {
      portraitUrl = "https://placeholder.com/portrait.jpg";
      bioSections = [
        {
          heading = "Professional Background";
          body = "Conservator of Forests with 25 years of experience...";
        },
        {
          heading = "Philosophy";
          body = "Believes in holistic conservation and sustainable living...";
        },
      ];
      email = "shubham.vats@example.com";
      socialLinks = {
        linkedin = "https://linkedin.com/in/shubhamvats";
        twitter = "https://twitter.com/shubhamvats";
        instagram = "https://instagram.com/shubhamvats";
      };
    };
    aboutContent := ?initialAboutContent;
  };

  public shared ({ caller }) func initialize() : async () {
    if (posts.size() > 0) { Runtime.trap("Already initialized") };
    seedData();
  };

  public shared ({ caller }) func createPost(post : Post) : async () {
    if (posts.get(post.slug) != null) { Runtime.trap("Post with this slug already exists") };
    posts.add(post.slug, post);
  };

  public shared ({ caller }) func updatePost(slug : Text, updatedPost : Post) : async () {
    if (posts.get(slug) == null) { Runtime.trap("Post not found") };
    posts.add(slug, updatedPost);
  };

  public shared ({ caller }) func deletePost(slug : Text) : async () {
    if (posts.get(slug) == null) { Runtime.trap("Post not found") };
    posts.remove(slug);
  };

  public query ({ caller }) func getPostBySlug(slug : Text) : async ?Post {
    posts.get(slug);
  };

  public query ({ caller }) func listAllPosts() : async [Post] {
    posts.values().toArray();
  };

  public query ({ caller }) func listPostsByCategory(category : Category) : async [Post] {
    let iter = posts.values().filter(func(post) { post.category == category });
    iter.toArray();
  };

  public query ({ caller }) func listPostsByTag(tag : Text) : async [Post] {
    let iter = posts.values().filter(
      func(post) {
        let tagIter = post.tags.values();
        tagIter.any(func(t) { t == tag });
      }
    );
    iter.toArray();
  };

  public query ({ caller }) func getFeaturedPosts() : async [Post] {
    let iter = posts.values().filter(func(post) { post.isFeatured });
    iter.toArray();
  };

  public query ({ caller }) func getLatestPosts(limit : Nat) : async [Post] {
    let array = posts.values().toArray().sort(PostEntity.compareByPublishedAt);
    if (limit == 0 or array.size() <= limit) {
      return array;
    };

    let list = List.empty<Post>();
    for (i in array.keys()) {
      if (i >= limit) { return list.toArray() };
      list.add(array[i]);
    };
    array;
  };

  public shared ({ caller }) func toggleDraft(slug : Text) : async () {
    switch (posts.get(slug)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let updatedPost : Post = {
          title = post.title;
          slug = post.slug;
          excerpt = post.excerpt;
          body = post.body;
          category = post.category;
          subcategory = post.subcategory;
          tags = post.tags;
          featuredImage = post.featuredImage;
          readingTimeMinutes = post.readingTimeMinutes;
          metaDescription = post.metaDescription;
          publishedAt = post.publishedAt;
          isDraft = not post.isDraft;
          isFeatured = post.isFeatured;
        };
        posts.add(slug, updatedPost);
      };
    };
  };

  public shared ({ caller }) func toggleFeatured(slug : Text) : async () {
    switch (posts.get(slug)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let updatedPost : Post = {
          title = post.title;
          slug = post.slug;
          excerpt = post.excerpt;
          body = post.body;
          category = post.category;
          subcategory = post.subcategory;
          tags = post.tags;
          featuredImage = post.featuredImage;
          readingTimeMinutes = post.readingTimeMinutes;
          metaDescription = post.metaDescription;
          publishedAt = post.publishedAt;
          isDraft = post.isDraft;
          isFeatured = not post.isFeatured;
        };
        posts.add(slug, updatedPost);
      };
    };
  };

  public shared ({ caller }) func subscribeNewsletter(email : Text) : async () {
    if (subscribers.contains(email)) { Runtime.trap("Already subscribed") };
    subscribers.add(email);
  };

  public query ({ caller }) func listSubscribers() : async [Text] {
    subscribers.toArray();
  };

  public shared ({ caller }) func setActiveQuote(text : Text, author : Text) : async () {
    let newQuote : Quote = {
      text;
      author;
      isActive = true;
    };

    let oldQuote = quotes.get("active");
    quotes.add("active", newQuote);

    switch (oldQuote) {
      case (null) {};
      case (?quote) { ignore quote };
    };
  };

  public query ({ caller }) func getActiveQuote() : async ?Quote {
    quotes.get("active");
  };

  public shared ({ caller }) func createQuote(text : Text, author : Text) : async () {
    let newQuote : Quote = {
      text;
      author;
      isActive = false;
    };
    quotes.add(text, newQuote);
  };

  public query ({ caller }) func listQuotes() : async [Quote] {
    quotes.values().toArray();
  };

  public shared ({ caller }) func addRecommendation(recommendation : ReadingRecommendation) : async () {
    if (recommendations.containsKey(recommendation.title)) { Runtime.trap("Recommendation already exists") };
    recommendations.add(recommendation.title, recommendation);
  };

  public shared ({ caller }) func updateRecommendation(title : Text, updatedRecommendation : ReadingRecommendation) : async () {
    if (recommendations.get(title) == null) { Runtime.trap("Recommendation not found") };
    recommendations.add(title, updatedRecommendation);
  };

  public shared ({ caller }) func deleteRecommendation(title : Text) : async () {
    if (recommendations.get(title) == null) { Runtime.trap("Recommendation not found") };
    recommendations.remove(title);
  };

  public query ({ caller }) func listRecommendations() : async [ReadingRecommendation] {
    recommendations.values().toArray().sort(ReadingRecommendation.compareByAddedAt);
  };

  public query ({ caller }) func listRecommendationsByGenre(genre : Text) : async [ReadingRecommendation] {
    let iter = recommendations.values().filter(func(rec) { rec.genre == genre });
    iter.toArray();
  };

  public query ({ caller }) func isInitialized() : async Bool {
    posts.size() > 0;
  };

  // *** New Features ***

  // About Content Management
  public shared ({ caller }) func setAboutContent(newContent : AboutContent) : async () {
    aboutContent := ?newContent;
  };

  public query ({ caller }) func getAboutContent() : async ?AboutContent {
    aboutContent;
  };

  // Media File Registry
  public shared ({ caller }) func addFileMetadata(metadata : FileMetadata) : async () {
    if (files.containsKey(metadata.id)) {
      Runtime.trap("File with this id already exists");
    };
    files.add(metadata.id, metadata);
  };

  public shared ({ caller }) func deleteFileMetadata(id : Text) : async () {
    if (not files.containsKey(id)) {
      Runtime.trap("File not found");
    };
    files.remove(id);
  };

  public query ({ caller }) func listAllFiles() : async [FileMetadata] {
    files.values().toArray();
  };

  public query ({ caller }) func getFileById(id : Text) : async ?FileMetadata {
    files.get(id);
  };

  public shared ({ caller }) func updateFileMetadata(id : Text, updatedMetadata : FileMetadata) : async () {
    if (not files.containsKey(id)) {
      Runtime.trap("File not found");
    };
    files.add(id, updatedMetadata);
  };

  public query ({ caller }) func listFilesByType(mimeType : Text) : async [FileMetadata] {
    let iter = files.values().filter(func(file) { file.mimeType == mimeType });
    iter.toArray();
  };

  public shared ({ caller }) func replaceAllFiles(newFiles : [FileMetadata]) : async () {
    files.clear();
    for (file in newFiles.values()) {
      files.add(file.id, file);
    };
  };
};
