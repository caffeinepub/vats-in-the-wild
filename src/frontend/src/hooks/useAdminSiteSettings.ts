import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SiteSettings } from "../backend.d";
import { useActor } from "./useActor";
import { DEFAULT_SETTINGS } from "./useSiteSettings";

export function useGetSiteSettings() {
  const { actor, isFetching } = useActor();
  return useQuery<SiteSettings>({
    queryKey: ["siteSettings"],
    queryFn: async () => {
      if (!actor) return DEFAULT_SETTINGS;
      return actor.getSiteSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetSiteSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: SiteSettings) => {
      if (!actor) throw new Error("Backend not available");
      return actor.setSiteSettings(settings);
    },
    onSuccess: (_data, settings) => {
      queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
      // Also update localStorage so public pages pick it up immediately
      try {
        localStorage.setItem("site_settings", JSON.stringify(settings));
      } catch {
        // Ignore storage errors
      }
    },
  });
}
