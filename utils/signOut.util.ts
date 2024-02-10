import { useQueryClient } from "@tanstack/react-query";
import { destroyCookie } from "nookies";

export const useSignOut = () => {
  const queryClient = useQueryClient();
  destroyCookie(null, "access_token", { path: "/" });
  queryClient.removeQueries();
};
