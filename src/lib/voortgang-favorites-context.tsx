"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";

export type VoortgangFavoriteItem = {
  id: string;
  title: string;
  kind: "activiteit" | "supplement" | "dienst";
  domain?: string;
};

type VoortgangFavoritesContextValue = {
  items: VoortgangFavoriteItem[];
  isSaved: (id: string) => boolean;
  save: (item: VoortgangFavoriteItem) => void;
  remove: (id: string) => void;
};

const VoortgangFavoritesContext = createContext<VoortgangFavoritesContextValue | null>(null);

export function VoortgangFavoritesProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<VoortgangFavoriteItem[]>([]);

  const isSaved = useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items],
  );

  const save = useCallback((item: VoortgangFavoriteItem) => {
    setItems((current) => {
      if (current.some((row) => row.id === item.id)) {
        return current;
      }
      trackEvent("dashboard_favorieten_save", {
        item_id: item.id,
        kind: item.kind,
      });
      clarityTag("dashboard_favorieten", item.id);
      return [...current, item];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(
    () => ({ items, isSaved, save, remove }),
    [items, isSaved, save, remove],
  );

  return (
    <VoortgangFavoritesContext.Provider value={value}>
      {children}
    </VoortgangFavoritesContext.Provider>
  );
}

export function useVoortgangFavorites(): VoortgangFavoritesContextValue {
  const context = useContext(VoortgangFavoritesContext);
  if (!context) {
    throw new Error("useVoortgangFavorites must be used within VoortgangFavoritesProvider");
  }
  return context;
}
