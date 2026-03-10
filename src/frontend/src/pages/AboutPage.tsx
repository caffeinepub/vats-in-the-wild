import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useEffect } from "react";
import { SiInstagram, SiLinkedin, SiX } from "react-icons/si";
import type { AboutContent } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useSiteSettings } from "../hooks/useSiteSettings";

const VALUES = [
  {
    title: "Discipline",
    description:
      "The forest teaches patience. A career in the IFS teaches that most problems require sustained, consistent effort — not brilliance.",
  },
  {
    title: "Curiosity",
    description:
      "Every posting is a new ecosystem, political and ecological. The officer who stops asking questions becomes a bureaucrat.",
  },
  {
    title: "Service",
    description:
      "The IFS is not a posting. It is a vocation. You carry the forest — its people, its wildlife, its future — on your watch.",
  },
  {
    title: "Strategy",
    description:
      "Conservation is conflict management. Geopolitics is the same. Both require understanding power, interests, and long-game thinking.",
  },
];

const WHAT_I_WRITE = [
  {
    label: "International Relations",
    to: "/international-relations",
    desc: "Geopolitics, India's foreign policy, strategic affairs.",
  },
  {
    label: "Forest & Field Notes",
    to: "/forest-field-notes",
    desc: "Wildlife, conservation, and field experience.",
  },
  {
    label: "Beyond Cutoff",
    to: "/beyond-cutoff",
    desc: "UPSC strategy, discipline, and mindset.",
  },
  {
    label: "The Wild Within",
    to: "/wild-within",
    desc: "Travel, trekking, and personal explorations.",
  },
  {
    label: "Personal Essays",
    to: "/personal-essays",
    desc: "Leadership, service, and growth.",
  },
];

const DEFAULT_BIO_SECTIONS = [
  {
    heading: "Forest Service & Career",
    body: "A member of the Indian Forest Service, posted in one of India's biodiversity-rich landscapes. The work spans wildlife protection, community engagement, anti-poaching operations, forest policy implementation, and the endless negotiation between human needs and ecological imperatives.\n\nThe IFS is one of those careers where the work is never abstract. Every decision lands somewhere real — on a tiger corridor, on a tribal community's livelihood, on a river's health. That groundedness is both a discipline and a gift.",
  },
  {
    heading: "Academic Background",
    body: "Academic training in the natural sciences, with sustained independent study in international relations, strategic affairs, and the political economy of conservation. The IFS prepares you for the field; the rest you build yourself.",
  },
  {
    heading: "Interest in Geopolitics & Strategy",
    body: "India's forests are not isolated from its geopolitics. Shared river systems, transboundary wildlife corridors, climate diplomacy, the strategic use of environmental agreements — these connect the canopy to the Security Council in ways rarely mapped. That intersection is where a significant part of this writing lives.",
  },
  {
    heading: "Personal Philosophy",
    body: "Depth over breadth. Sustained attention over quick takes. A willingness to sit with difficult questions longer than is comfortable — in the forest, in policy, in one's own thinking. Writing is one way of forcing that patience on oneself.\n\nThis platform is an attempt at building something durable: a long-term archive of honest thinking from a practitioner's vantage point, not a pundit's perch.",
  },
];

export default function AboutPage() {
  const settings = useSiteSettings();
  const { actor, isFetching } = useActor();
  const { data: aboutData } = useQuery<AboutContent | null>({
    queryKey: ["aboutContent"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAboutContent();
    },
    enabled: !!actor && !isFetching,
  });

  useEffect(() => {
    document.title = "About Shubham Vats — Indian Forest Service Officer";
  }, []);

  const portraitUrl =
    aboutData?.portraitUrl ||
    "/assets/generated/portrait-placeholder.dim_600x750.jpg";
  const contactEmail = aboutData?.email || "contact@vatsinthewild.in";
  const linkedinUrl =
    aboutData?.socialLinks?.linkedin || "https://linkedin.com";
  const twitterUrl = aboutData?.socialLinks?.twitter || "https://x.com";
  const instagramUrl =
    aboutData?.socialLinks?.instagram || "https://instagram.com";
  const bioSections =
    aboutData?.bioSections && aboutData.bioSections.length > 0
      ? aboutData.bioSections
      : DEFAULT_BIO_SECTIONS;

  return (
    <div className="pt-16">
      {/* Page Header */}
      <section
        className="py-20 lg:py-28 border-b border-border relative overflow-hidden"
        style={
          settings.aboutPageBg
            ? {
                backgroundImage: `url(${settings.aboutPageBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : { background: "oklch(var(--card))" }
        }
      >
        {settings.aboutPageBg && (
          <div className="absolute inset-0 bg-background/75" />
        )}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">
            {settings.aboutPageTitle || "About"}
          </p>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-foreground mb-4 leading-tight">
            Shubham Vats
          </h1>
          <p className="text-lg text-muted-foreground tracking-wide">
            {settings.aboutPageSubtitle || "Indian Forest Service Officer"} ·
            Writer · Observer
          </p>
        </div>
      </section>

      {/* Bio Section */}
      <section
        className="py-16 lg:py-24 bg-background relative"
        style={
          settings.aboutBioBg
            ? {
                backgroundImage: `url(${settings.aboutBioBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {settings.aboutBioBg && (
          <div className="absolute inset-0 bg-background/80 pointer-events-none" />
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
            {/* Portrait */}
            <div className="lg:col-span-2">
              <div className="relative max-w-sm">
                <div className="aspect-[4/5] overflow-hidden rounded-sm">
                  <img
                    src={portraitUrl}
                    alt="Shubham Vats"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 w-full h-full border border-primary/30 rounded-sm -z-10" />
              </div>

              {/* Contact quick links */}
              <div className="mt-10 space-y-3">
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail size={14} />
                  {contactEmail}
                </a>
                <div className="flex gap-3 pt-1">
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <SiLinkedin size={16} />
                  </a>
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter/X"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <SiX size={16} />
                  </a>
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <SiInstagram size={16} />
                  </a>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="lg:col-span-3 space-y-8">
              <div className="space-y-5 text-base text-muted-foreground leading-relaxed">
                {bioSections.map((section, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: sections are ordered and not individually keyed
                  <div key={index}>
                    {section.heading && (
                      <h2
                        className={`font-display text-2xl font-semibold text-foreground ${index > 0 ? "pt-4" : ""}`}
                      >
                        {section.heading}
                      </h2>
                    )}
                    {section.body?.split("\n\n").map((para, pIndex) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: paragraph order is deterministic
                      <p key={pIndex}>{para}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section
        className="py-16 lg:py-20 bg-card border-y border-border relative"
        style={
          settings.aboutValuesBg
            ? {
                backgroundImage: `url(${settings.aboutValuesBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {settings.aboutValuesBg && (
          <div className="absolute inset-0 bg-background/80 pointer-events-none" />
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
              Principles
            </p>
            <h2 className="font-display text-3xl font-bold text-foreground">
              What Guides the Work
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="bg-background border border-border p-6 space-y-3"
              >
                <div className="w-8 h-0.5 bg-primary" />
                <h3 className="font-display text-xl font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What I Write About */}
      <section
        className="py-16 lg:py-20 bg-background relative"
        style={
          settings.aboutWritingBg
            ? {
                backgroundImage: `url(${settings.aboutWritingBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {settings.aboutWritingBg && (
          <div className="absolute inset-0 bg-background/80 pointer-events-none" />
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
              Writing
            </p>
            <h2 className="font-display text-3xl font-bold text-foreground">
              What I Write About
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHAT_I_WRITE.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group p-6 border border-border hover:border-primary/50 bg-card hover:bg-card/80 transition-all"
              >
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                  {item.label}
                </h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section
        className="py-16 bg-card border-t border-border relative"
        style={
          settings.aboutContactBg
            ? {
                backgroundImage: `url(${settings.aboutContactBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {settings.aboutContactBg && (
          <div className="absolute inset-0 bg-background/80 pointer-events-none" />
        )}
        <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary">
            Get in Touch
          </p>
          <h2 className="font-display text-2xl font-bold text-foreground">
            For serious correspondence
          </h2>
          <p className="text-sm text-muted-foreground">
            For research collaborations, interview requests, or substantive
            questions about the work.
          </p>
          <a href={`mailto:${contactEmail}`}>
            <Button className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium tracking-wide">
              Send an Email
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
