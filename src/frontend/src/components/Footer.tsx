import { Link } from "@tanstack/react-router";
import { SiInstagram, SiLinkedin, SiX } from "react-icons/si";
import { useSiteSettings } from "../hooks/useSiteSettings";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;
  const settings = useSiteSettings();

  return (
    <footer className="bg-card border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link
              to="/"
              className="font-display text-2xl font-semibold text-foreground hover:text-primary transition-colors"
            >
              {settings.siteName}
            </Link>
            <p className="text-xs tracking-widest uppercase text-muted-foreground">
              {settings.footerTagline}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {settings.footerDescription}
            </p>
          </div>

          {/* Navigation Column */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Sections
            </h3>
            <nav className="space-y-2">
              <Link
                to="/international-relations"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                International Relations
              </Link>
              <Link
                to="/forest-field-notes"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Forest & Field Notes
              </Link>
              <Link
                to="/beyond-cutoff"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Beyond Cutoff (UPSC)
              </Link>
              <Link
                to="/wild-within"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                The Wild Within
              </Link>
              <Link
                to="/personal-essays"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Personal Essays
              </Link>
              <Link
                to="/reading"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Reading List
              </Link>
            </nav>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Connect
            </h3>
            <div className="space-y-2">
              {settings.footerEmail && (
                <a
                  href={`mailto:${settings.footerEmail}`}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {settings.footerEmail}
                </a>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              {settings.footerLinkedin && (
                <a
                  href={settings.footerLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <SiLinkedin size={18} />
                </a>
              )}
              {settings.footerTwitter && (
                <a
                  href={settings.footerTwitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <SiX size={18} />
                </a>
              )}
              {settings.footerInstagram && (
                <a
                  href={settings.footerInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <SiInstagram size={18} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Quote */}
        {settings.footerQuoteText && (
          <div className="border-t border-border pt-8 mb-8">
            <blockquote className="text-center text-sm text-muted-foreground italic max-w-2xl mx-auto">
              "{settings.footerQuoteText}"
              {settings.footerQuoteAuthor && (
                <>
                  <br />
                  <span className="not-italic text-xs tracking-wider uppercase mt-1 block">
                    — {settings.footerQuoteAuthor}
                  </span>
                </>
              )}
            </blockquote>
          </div>
        )}

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © {currentYear} {settings.footerCopyright}
          </p>
          <p>
            Built with ♥ using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
