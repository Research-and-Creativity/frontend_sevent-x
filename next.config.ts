import type { NextConfig } from "next";
import withBundleAnalyzerFactory from "@next/bundle-analyzer";

// Dipakai hanya saat ANALYZE=true, jadi build normal tidak terpengaruh.
const withBundleAnalyzer = withBundleAnalyzerFactory({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withBundleAnalyzer(nextConfig);
