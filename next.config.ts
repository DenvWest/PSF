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
        destination: "/beste/magnesium",
        permanent: true,
      },
      {
        source: "/beste-omega-3-supplement",
        destination: "/beste/omega-3-supplement",
        permanent: true,
      },
      {
        source: "/beste-ashwagandha",
        destination: "/beste/ashwagandha",
        permanent: true,
      },
      {
        source: "/beste-vitamine-d",
        destination: "/beste/vitamine-d",
        permanent: true,
      },
      {
        source: "/beste-creatine",
        destination: "/beste/creatine",
        permanent: true,
      },
      {
        source: "/beste-zink",
        destination: "/beste/zink",
        permanent: true,
      },
      {
        source: "/beste-melatonine",
        destination: "/supplementen/melatonine",
        permanent: true,
      },
      {
        source: "/beste/melatonine",
        destination: "/supplementen/melatonine",
        permanent: true,
      },
      {
        source: "/beste-eiwitpoeder",
        destination: "/beste/eiwitpoeder",
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
        destination: "/profiel/lage-batterij",
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
        source: "/thema/herstel",
        destination: "/herstel-verbeteren-na-40",
        permanent: true,
      },
      {
        source: "/thema/:thema",
        destination: "/gids/:thema",
        permanent: true,
      },
      {
        source: "/symptomen/slaap",
        destination: "/gids/slaap",
        permanent: true,
      },
      {
        source: "/symptomen/slaap/:path*",
        destination: "/gids/slaap",
        permanent: true,
      },
      {
        source: "/symptomen/stress",
        destination: "/gids/stress",
        permanent: true,
      },
      {
        source: "/symptomen/stress/:path*",
        destination: "/gids/stress",
        permanent: true,
      },
      {
        source: "/symptomen/energie",
        destination: "/gids/energie",
        permanent: true,
      },
      {
        source: "/symptomen/energie/:path*",
        destination: "/gids/energie",
        permanent: true,
      },
      {
        source: "/symptomen/herstel",
        destination: "/gids/herstel",
        permanent: true,
      },
      {
        source: "/symptomen/herstel/:path*",
        destination: "/gids/herstel",
        permanent: true,
      },
      {
        source: "/profiel/herstel",
        destination: "/profiel/overtrainer",
        permanent: true,
      },
      {
        source: "/omega-3-vergelijken",
        destination: "/beste/omega-3-supplement",
        permanent: true,
      },
      {
        source: "/magnesium-vergelijken",
        destination: "/beste/magnesium",
        permanent: true,
      },
      {
        source: "/slaap-supplement-vergelijken",
        destination: "/gids/slaap",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
