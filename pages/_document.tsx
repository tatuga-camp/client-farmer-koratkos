import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="th">
      <Head>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />
        <meta name="theme-color" content="#FFFFEC" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
