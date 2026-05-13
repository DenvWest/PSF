"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_ORG, type OrgConfig } from "@/config/org";

const OrgContext = createContext<OrgConfig>(DEFAULT_ORG);

export function useOrg(): OrgConfig {
  return useContext(OrgContext);
}

interface OrgProviderProps {
  org?: OrgConfig;
  children: ReactNode;
}

export function OrgProvider({ org = DEFAULT_ORG, children }: OrgProviderProps) {
  return <OrgContext.Provider value={org}>{children}</OrgContext.Provider>;
}
