import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Post, ReadingRecommendation } from "../backend.d";
import { useActor } from "./useActor";

export function useAllPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<Post[]>({
    queryKey: ["allPosts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllSubscribers() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["subscribers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSubscribers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminActiveQuote() {
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

export function useAdminRecommendations() {
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

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (post: Post) => {
      if (!actor) throw new Error("Backend not available");
      return actor.createPost(post);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
      queryClient.invalidateQueries({ queryKey: ["latestPosts"] });
      queryClient.invalidateQueries({ queryKey: ["featuredPosts"] });
    },
  });
}

export function useUpdatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, post }: { slug: string; post: Post }) => {
      if (!actor) throw new Error("Backend not available");
      return actor.updatePost(slug, post);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
      queryClient.invalidateQueries({ queryKey: ["latestPosts"] });
      queryClient.invalidateQueries({ queryKey: ["featuredPosts"] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      if (!actor) throw new Error("Backend not available");
      return actor.deletePost(slug);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
      queryClient.invalidateQueries({ queryKey: ["latestPosts"] });
      queryClient.invalidateQueries({ queryKey: ["featuredPosts"] });
    },
  });
}

export function useToggleDraft() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      if (!actor) throw new Error("Backend not available");
      return actor.toggleDraft(slug);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
    },
  });
}

export function useToggleFeatured() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      if (!actor) throw new Error("Backend not available");
      return actor.toggleFeatured(slug);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
      queryClient.invalidateQueries({ queryKey: ["featuredPosts"] });
    },
  });
}

export function useSetActiveQuote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ text, author }: { text: string; author: string }) => {
      if (!actor) throw new Error("Backend not available");
      return actor.setActiveQuote(text, author);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeQuote"] });
    },
  });
}

export function useAddRecommendation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rec: ReadingRecommendation) => {
      if (!actor) throw new Error("Backend not available");
      return actor.addRecommendation(rec);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
  });
}

export function useDeleteRecommendation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error("Backend not available");
      return actor.deleteRecommendation(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
  });
}
