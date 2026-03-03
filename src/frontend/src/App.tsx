import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { useActor } from "./hooks/useActor";
import AboutPage from "./pages/AboutPage";
import ArticlePage from "./pages/ArticlePage";
import BeyondCutoffPage from "./pages/BeyondCutoffPage";
import ForestFieldNotesPage from "./pages/ForestFieldNotesPage";
import HomePage from "./pages/HomePage";
import InternationalRelationsPage from "./pages/InternationalRelationsPage";
import PersonalEssaysPage from "./pages/PersonalEssaysPage";
import ReadingPage from "./pages/ReadingPage";
import WildWithinPage from "./pages/WildWithinPage";

// Theme context
export type Theme = "dark" | "light";

function BackendInit() {
  const { actor } = useActor();

  useEffect(() => {
    if (!actor) return;
    const init = async () => {
      try {
        const initialized = await actor.isInitialized();
        if (!initialized) {
          await actor.initialize();
        }
      } catch {
        // Silent fail
      }
    };
    init();
  }, [actor]);

  return null;
}

function RootLayout() {
  return (
    <>
      <BackendInit />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const irRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/international-relations",
  component: InternationalRelationsPage,
});

const forestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forest-field-notes",
  component: ForestFieldNotesPage,
});

const upscRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/beyond-cutoff",
  component: BeyondCutoffPage,
});

const wildRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wild-within",
  component: WildWithinPage,
});

const essaysRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/personal-essays",
  component: PersonalEssaysPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});

const readingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reading",
  component: ReadingPage,
});

const articleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog/$slug",
  component: ArticlePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  irRoute,
  forestRoute,
  upscRoute,
  wildRoute,
  essaysRoute,
  aboutRoute,
  readingRoute,
  articleRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");
    return (saved as Theme) || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Expose theme setter for Navbar without prop drilling
  (window as unknown as Record<string, unknown>).__setTheme = setTheme;
  (window as unknown as Record<string, unknown>).__theme = theme;

  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}
