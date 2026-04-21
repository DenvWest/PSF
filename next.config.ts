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
        source: "/symptomen/slaap",
        destination: "/thema/slaap",
        permanent: true,
      },
      {
        source: "/symptomen/slaap/oorzaken",
        destination: "/thema/slaap",
        permanent: true,
      },
      {
        source: "/symptomen/slaap/oplossingen",
        destination: "/thema/slaap",
        permanent: true,
      },
      {
        source: "/symptomen/stress",
        destination: "/thema/stress",
        permanent: true,
      },
      {
        source: "/symptomen/stress/oorzaken",
        destination: "/thema/stress",
        permanent: true,
      },
      {
        source: "/symptomen/stress/oplossingen",
        destination: "/thema/stress",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
