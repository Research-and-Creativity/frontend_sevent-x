import type { NextConfig } from "next";
import withBundleAnalyzerFactory from "@next/bundle-analyzer";

// Dipakai hanya saat ANALYZE=true, jadi build normal tidak terpengaruh.
const withBundleAnalyzer = withBundleAnalyzerFactory({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  async headers() {
    const privateRoutes = [
      "/admin/:path*",
      "/peserta/:path*",
      "/juri/:path*",
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/verify-email",
      "/auth/:path*",
    ];

    return privateRoutes.map((source) => ({
      source,
      headers: [
        {
          key: "X-Robots-Tag",
          value: "noindex, nofollow",
        },
      ],
    }));
  },
};

export default withBundleAnalyzer(nextConfig);
