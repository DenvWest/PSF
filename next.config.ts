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
        source: "/beste-magnesium",
        destination: "/beste-magnesium",
        permanent: true,
      },
      {
        source: "/beste-omega-3-supplement",
        destination: "/beste-omega-3-supplement",
        permanent: true,
      },
      {
        source: "/beste-ashwagandha",
        destination: "/beste-ashwagandha",
        permanent: true,
      },
      {
        source: "/beste-vitamine-d",
        destination: "/beste-vitamine-d",
        permanent: true,
      },
      {
        source: "/beste-creatine",
        destination: "/beste-creatine",
        permanent: true,
      },
      {
        source: "/beste-zink",
        destination: "/beste-zink",
        permanent: true,
      },
      {
        source: "/beste-melatonine",
        destination: "/beste-melatonine",
        permanent: true,
      },
      {
        source: "/beste-eiwitpoeder",
        destination: "/beste-eiwitpoeder",
        permanent: true,
      },
      {
        source: "/profiel/basis-mist",
        destination: "/profiel",
        permanent: true,
      },
      {
        source: "/profiel/stille-tekorten",
        destination: "/profiel",
        permanent: true,
      },
      {
        source: "/profiel/stille-slijter",
        destination: "/profiel",
        permanent: true,
      },
      {
        source: "/profiel/stilzitter",
        destination: "/profiel/lage-batterij",
        permanent: true,
      },
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
      {
        source: "/profiel/herstel",
        destination: "/profiel/overtrainer",
        permanent: true,
      },
      {
        source: "/omega-3-vergelijken",
        destination: "/beste-omega-3-supplement",
        permanent: true,
      },
      {
        source: "/magnesium-vergelijken",
        destination: "/beste-magnesium",
        permanent: true,
      },
      {
        source: "/slaap-supplement-vergelijken",
        destination: "/thema/slaap",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
