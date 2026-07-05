import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  // The path to our service worker source code.
  swSrc: "src/app/sw.ts",
  // The path where the compiled service worker will be written.
  swDest: "public/sw.js",
  // Disable in development if required, or keep enabled to test it
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSerwist(nextConfig);
