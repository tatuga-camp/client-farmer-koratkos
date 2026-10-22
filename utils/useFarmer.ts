import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { destroyCookie, parseCookies } from "nookies";
import { useCallback, useEffect, useState } from "react";
import { GetFarmerClientSideService } from "../services/farmer";

/**
 * The signed-in farmer, loaded in the browser so pages can be served statically.
 * Without a token (or when the server says it expired) it sends the farmer to sign in.
 */
export function useFarmer() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState<boolean>();

  useEffect(() => {
    const token = parseCookies().access_token;
    setHasToken(!!token);
    if (!token) router.replace("/auth/sign-in");
  }, [router]);

  const farmer = useQuery({
    queryKey: ["farmer"],
    queryFn: () => GetFarmerClientSideService(),
    enabled: hasToken === true,
    retry: (count, error) => (error as { statusCode?: number } | undefined)?.statusCode !== 401 && count < 1,
  });

  useEffect(() => {
    const status = (farmer.error as { statusCode?: number } | null)?.statusCode;
    if (status === 401 || status === 403) {
      destroyCookie(null, "access_token", { path: "/" });
      router.replace("/auth/sign-in");
    }
  }, [farmer.error, router]);

  return farmer;
}

export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useCallback(() => {
    destroyCookie(null, "access_token", { path: "/" });
    queryClient.removeQueries();
    router.push("/auth/sign-in");
  }, [queryClient, router]);
}
