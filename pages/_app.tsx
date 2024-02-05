import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppProps } from "next/app";
import { useState } from "react";
import { PrimeReactProvider } from "primereact/api";
import NextTopLoader from "nextjs-toploader";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 6,
            refetchInterval: 1000 * 6,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <PrimeReactProvider>
        <NextTopLoader color="#5C430D" showSpinner={false} />
        <Component {...pageProps} />
      </PrimeReactProvider>
    </QueryClientProvider>
  );
}
