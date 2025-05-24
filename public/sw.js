if (!self.define) {
  let e,
    s = {};
  const a = (a, n) => (
    (a = new URL(a + '.js', n).href),
    s[a] ||
      new Promise((s) => {
        if ('document' in self) {
          const e = document.createElement('script');
          (e.src = a), (e.onload = s), document.head.appendChild(e);
        } else (e = a), importScripts(a), s();
      }).then(() => {
        let e = s[a];
        if (!e) throw new Error(`Module ${a} didn’t register its module`);
        return e;
      })
  );
  self.define = (n, i) => {
    const t = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (s[t]) return;
    let c = {};
    const r = (e) => a(e, t),
      o = { module: { uri: t }, exports: c, require: r };
    s[t] = Promise.all(n.map((e) => o[e] || r(e))).then((e) => (i(...e), c));
  };
}
define(['./workbox-4754cb34'], function (e) {
  'use strict';
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/_next/app-build-manifest.json', revision: '82a29556b8d8bd1b414a69b751eb6393' },
        {
          url: '/_next/static/MTCFrxW19vrVbd8g2BRWg/_buildManifest.js',
          revision: '5305b2958ac14d85b17e4a13b784a465',
        },
        {
          url: '/_next/static/MTCFrxW19vrVbd8g2BRWg/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        { url: '/_next/static/chunks/193-bf3023caaafb0cf3.js', revision: 'MTCFrxW19vrVbd8g2BRWg' },
        { url: '/_next/static/chunks/315-79e1ade063c516ee.js', revision: 'MTCFrxW19vrVbd8g2BRWg' },
        { url: '/_next/static/chunks/453-b5ac28e2834644da.js', revision: 'MTCFrxW19vrVbd8g2BRWg' },
        {
          url: '/_next/static/chunks/4bd1b696-e1b3c7bcbfce1e14.js',
          revision: 'MTCFrxW19vrVbd8g2BRWg',
        },
        { url: '/_next/static/chunks/518-6aaf781ab4c221d4.js', revision: 'MTCFrxW19vrVbd8g2BRWg' },
        { url: '/_next/static/chunks/684-e7e3200b42f0ec79.js', revision: 'MTCFrxW19vrVbd8g2BRWg' },
        { url: '/_next/static/chunks/714-a19ee67df0355cf0.js', revision: 'MTCFrxW19vrVbd8g2BRWg' },
        { url: '/_next/static/chunks/779-e1a2cdf194c6ee12.js', revision: 'MTCFrxW19vrVbd8g2BRWg' },
        {
          url: '/_next/static/chunks/app/_not-found/page-636a13c122b18458.js',
          revision: 'MTCFrxW19vrVbd8g2BRWg',
        },
        {
          url: '/_next/static/chunks/app/api/auth/%5B...nextauth%5D/route-3c9ed5a42f8d3bca.js',
          revision: 'MTCFrxW19vrVbd8g2BRWg',
        },
        {
          url: '/_next/static/chunks/app/api/exercises/route-e72d88eb7348d930.js',
          revision: 'MTCFrxW19vrVbd8g2BRWg',
        },
        {
          url: '/_next/static/chunks/app/api/workouts/route-c0b233ddaf0a8a2c.js',
          revision: 'MTCFrxW19vrVbd8g2BRWg',
        },
        {
          url: '/_next/static/chunks/app/exercises/page-f1172dafca5ff528.js',
          revision: 'MTCFrxW19vrVbd8g2BRWg',
        },
        {
          url: '/_next/static/chunks/app/history/page-f01612f4402df878.js',
          revision: 'MTCFrxW19vrVbd8g2BRWg',
        },
        {
          url: '/_next/static/chunks/app/layout-309f02070f556aca.js',
          revision: 'MTCFrxW19vrVbd8g2BRWg',
        },
        {
          url: '/_next/static/chunks/app/not-found-602e0f06d24f89ce.js',
          revision: 'MTCFrxW19vrVbd8g2BRWg',
        },
        {
          url: '/_next/static/chunks/app/page-84247090481ccaa4.js',
          revision: 'MTCFrxW19vrVbd8g2BRWg',
        },
        {
          url: '/_next/static/chunks/framework-f593a28cde54158e.js',
          revision: 'MTCFrxW19vrVbd8g2BRWg',
        },
        {
          url: '/_next/static/chunks/main-app-69af22d06a075451.js',
          revision: 'MTCFrxW19vrVbd8g2BRWg',
        },
        { url: '/_next/static/chunks/main-d1b16d17a1485cc3.js', revision: 'MTCFrxW19vrVbd8g2BRWg' },
        {
          url: '/_next/static/chunks/pages/_app-da15c11dea942c36.js',
          revision: 'MTCFrxW19vrVbd8g2BRWg',
        },
        {
          url: '/_next/static/chunks/pages/_error-cc3f077a18ea1793.js',
          revision: 'MTCFrxW19vrVbd8g2BRWg',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-f976005041799024.js',
          revision: 'MTCFrxW19vrVbd8g2BRWg',
        },
        { url: '/_next/static/css/1a5b4ce70a919875.css', revision: '1a5b4ce70a919875' },
        { url: '/_next/static/css/b728cf532d3ea9ea.css', revision: 'b728cf532d3ea9ea' },
        {
          url: '/_next/static/media/569ce4b8f30dc480-s.p.woff2',
          revision: 'ef6cefb32024deac234e82f932a95cbd',
        },
        {
          url: '/_next/static/media/747892c23ea88013-s.woff2',
          revision: 'a0761690ccf4441ace5cec893b82d4ab',
        },
        {
          url: '/_next/static/media/8d697b304b401681-s.woff2',
          revision: 'cc728f6c0adb04da0dfcb0fc436a8ae5',
        },
        {
          url: '/_next/static/media/93f479601ee12b01-s.p.woff2',
          revision: 'da83d5f06d825c5ae65b7cca706cb312',
        },
        {
          url: '/_next/static/media/9610d9e46709d722-s.woff2',
          revision: '7b7c0ef93df188a852344fc272fc096b',
        },
        {
          url: '/_next/static/media/ba015fad6dcf6784-s.woff2',
          revision: '8ea4f719af3312a055caf09f34c89a77',
        },
        { url: '/bland-image.png', revision: '18384b2440d696dcf57ae084bf1a61e3' },
        { url: '/file.svg', revision: 'd09f95206c3fa0bb9bd9fefabfd0ea71' },
        { url: '/globe.svg', revision: '2aaafa6a49b6563925fe440891e32717' },
        { url: '/icon512_maskable.png', revision: '95a6fd79eb3f4b0dd546a220c7680695' },
        { url: '/icon512_rounded.png', revision: '6c8e11d49202193afaa25fb65b55c13f' },
        { url: '/manifest.json', revision: '21459fa05d7b433c34cf558c5bad9cb2' },
        { url: '/next.svg', revision: '8e061864f388b47f33a1c3780831193e' },
        { url: '/vercel.svg', revision: 'c0af2f507b369b085b35ef4bbe3bcf1e' },
        { url: '/window.svg', revision: 'a2760511c65806022ad20adf74370ff3' },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({ request: e, response: s, event: a, state: n }) =>
              s && 'opaqueredirect' === s.type
                ? new Response(s.body, { status: 200, statusText: 'OK', headers: s.headers })
                : s,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const s = e.pathname;
        return !s.startsWith('/api/auth/') && !!s.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })],
      }),
      'GET'
    );
});
