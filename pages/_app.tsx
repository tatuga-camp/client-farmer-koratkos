import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppProps } from "next/app";
import { Anuphan } from "next/font/google";
import { useState } from "react";
import NextTopLoader from "nextjs-toploader";

const anuphan = Anuphan({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: false,
});

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          // Farmers often switch to the camera or gallery mid-form; refetching on
          // return would overwrite what they have typed.
          queries: { refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <style jsx global>{`
        :root {
          --font-anuphan: ${anuphan.style.fontFamily};
        }
      `}</style>
      <ReactQueryDevtools initialIsOpen={false} />
      <NextTopLoader color="#597E52" showSpinner={false} />
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
