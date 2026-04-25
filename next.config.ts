import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  async redirects() {
    return [
      {
        source: "/symptomen",
        destination: "/supplementen",
        permanent: true,
      },
      {
        source: "/symptomen/slaap",
        destination: "/thema/slaap",
        permanent: true,
      },
      {
        source: "/symptomen/slaap/:path*",
        destination: "/thema/slaap",
        permanent: true,
      },
      {
        source: "/symptomen/stress",
        destination: "/thema/stress",
        permanent: true,
      },
      {
        source: "/symptomen/stress/:path*",
        destination: "/thema/stress",
        permanent: true,
      },
      {
        source: "/symptomen/energie",
        destination: "/thema/energie",
        permanent: true,
      },
      {
        source: "/symptomen/energie/:path*",
        destination: "/thema/energie",
        permanent: true,
      },
      {
        source: "/symptomen/herstel",
        destination: "/thema/herstel",
        permanent: true,
      },
      {
        source: "/symptomen/herstel/:path*",
        destination: "/thema/herstel",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
