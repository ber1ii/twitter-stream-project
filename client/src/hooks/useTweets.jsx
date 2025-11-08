import { useQuery } from "@tanstack/react-query";

export function useTweets() {
  return useQuery({
    queryKey: ["tweets"],
    queryFn: async () => {
      const res = await fetch("/api/tweets");
      if (!res.ok) throw new Error("Failed to fetch tweets");
      return res.json();
    },
    refetchInterval: false,
    staleTime: 5000,
  });
}