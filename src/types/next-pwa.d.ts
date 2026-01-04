declare module "next-pwa" {
  import type { NextConfig } from "next";

  interface RuntimeCacheOptions {
    cacheName: string;
    expiration?: {
      maxEntries?: number;
      maxAgeSeconds?: number;
    };
    networkTimeoutSeconds?: number;
  }

  interface RuntimeCacheRule {
    urlPattern: RegExp | string;
    handler: "CacheFirst" | "NetworkFirst" | "StaleWhileRevalidate" | "NetworkOnly" | "CacheOnly";
    options?: RuntimeCacheOptions;
  }

  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
    skipWaiting?: boolean;
    runtimeCaching?: RuntimeCacheRule[];
    publicExcludes?: string[];
    buildExcludes?: (RegExp | string)[];
    cacheOnFrontEndNav?: boolean;
    fallbacks?: {
      document?: string;
      image?: string;
      audio?: string;
      video?: string;
      font?: string;
    };
    cacheStartUrl?: boolean;
    dynamicStartUrl?: boolean;
    reloadOnOnline?: boolean;
  }

  function withPWA(config?: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  
  export default withPWA;
}

