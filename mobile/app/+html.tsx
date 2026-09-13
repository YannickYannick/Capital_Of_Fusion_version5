import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

/**
 * HTML racine web / PWA (static export).
 * Ne pas créer public/index.html — ça casse Expo Router.
 */
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, shrink-to-fit=no"
        />
        <title>PBVF — Paris Bachata Vibe Festival</title>
        <meta
          name="description"
          content="Planning, artistes, navettes et infos du Paris Bachata Vibe Festival."
        />
        <meta name="theme-color" content="#0a0e27" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PBVF" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/pwa-icon-192.png" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        <script dangerouslySetInnerHTML={{ __html: registerServiceWorker }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
html, body {
  height: 100%;
  background-color: #0a0e27;
}
body {
  margin: 0;
  overflow: hidden;
}
#root, [data-reactroot] {
  min-height: 100%;
}
`;

/** Enregistre le SW uniquement hors localhost (évite cache de dev). */
const registerServiceWorker = `
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    var host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return;
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });
}
`;
