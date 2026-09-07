import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// Web-only root document (Expo Router static rendering). Adds the PWA
// manifest/icons/theme-color and registers the offline-shell service worker
// on top of the default head Expo Router would otherwise generate.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Casey — DIY Phone Case Studio</title>

        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FF3E9A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Casey" />
        <link rel="apple-touch-icon" href="/icons/icon-180.png" />
        <link rel="icon" href="/icons/icon-192.png" />

        <ScrollViewStyleReset />

        <script
          // Registered as network-first (see public/sw.js) so it never
          // shadows a fresh Metro bundle — only used as an offline fallback.
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker.register('/sw.js').catch(function () {});
                });
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
