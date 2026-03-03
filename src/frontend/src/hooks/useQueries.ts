import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Category, Post, ReadingRecommendation } from "../backend.d";
import { useActor } from "./useActor";

export function useLatestPosts(limit = 3n) {
  const { actor, isFetching } = useActor();
  return useQuery<Post[]>({
    queryKey: ["latestPosts", limit.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLatestPosts(limit);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFeaturedPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<Post[]>({
    queryKey: ["featuredPosts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePostBySlug(slug: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Post | null>({
    queryKey: ["post", slug],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPostBySlug(slug);
    },
    enabled: !!actor && !isFetching && !!slug,
  });
}

export function usePostsByCategory(category: Category) {
  const { actor, isFetching } = useActor();
  return useQuery<Post[]>({
    queryKey: ["postsByCategory", category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPostsByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useActiveQuote() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["activeQuote"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getActiveQuote();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useReadingRecommendations() {
  const { actor, isFetching } = useActor();
  return useQuery<ReadingRecommendation[]>({
    queryKey: ["recommendations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listRecommendations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubscribeNewsletter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error("Backend not available");
      return actor.subscribeNewsletter(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscribers"] });
    },
  });
}
