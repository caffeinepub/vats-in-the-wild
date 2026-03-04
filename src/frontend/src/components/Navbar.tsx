import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { useTheme } from "../hooks/useTheme";

const navLinks = [
  { label: "Journal", to: "/", ocid: "nav.home_link" },
  { label: "IR", to: "/international-relations", ocid: "nav.ir_link" },
  { label: "Forest", to: "/forest-field-notes", ocid: "nav.forest_link" },
  { label: "UPSC", to: "/beyond-cutoff", ocid: "nav.upsc_link" },
  { label: "Wild Within", to: "/wild-within", ocid: "nav.wild_link" },
  { label: "Essays", to: "/personal-essays", ocid: "nav.essays_link" },
  { label: "About", to: "/about", ocid: "nav.about_link" },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const isHome = routerState.location.pathname === "/";
  const settings = useSiteSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparent = isHome && !isScrolled && !mobileOpen;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent
          ? "bg-transparent"
          : "bg-background/95 backdrop-blur-sm border-b border-border shadow-sm"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Brand */}
          <Link
            to="/"
            className="flex flex-col group"
            data-ocid="nav.home_link"
          >
            <span
              className={`font-display text-xl lg:text-2xl font-semibold tracking-tight transition-colors ${
                isTransparent ? "text-white" : "text-foreground"
              }`}
            >
              {settings.siteName}
            </span>
            <span
              className={`font-body text-xs tracking-widest uppercase transition-colors ${
                isTransparent ? "text-white/60" : "text-muted-foreground"
              }`}
            >
              {settings.siteSubtitle}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.slice(1).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-ocid={link.ocid}
                className={`px-3 py-2 text-sm font-medium tracking-wide transition-colors rounded-sm hover:text-primary ${
                  isTransparent
                    ? "text-white/80 hover:text-white"
                    : "text-muted-foreground hover:text-foreground"
                } [&.active]:text-primary`}
                activeProps={{ className: "text-primary" }}
              >
                {link.label}
              </Link>
            ))}

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              data-ocid="nav.theme_toggle"
              className={`ml-2 p-2 rounded-sm transition-colors ${
                isTransparent
                  ? "text-white/70 hover:text-white hover:bg-white/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              data-ocid="nav.theme_toggle"
              className={`p-2 rounded-sm transition-colors ${
                isTransparent
                  ? "text-white/70 hover:text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              data-ocid="nav.mobile_menu_button"
              className={`p-2 rounded-sm transition-colors ${
                isTransparent
                  ? "text-white/70 hover:text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-background border-t border-border py-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-ocid={link.ocid}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                activeProps={{ className: "text-primary bg-muted/50" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
