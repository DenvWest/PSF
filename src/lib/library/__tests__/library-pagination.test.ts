import { describe, expect, it } from "vitest";
import {
  LIBRARY_PAGE_SIZE,
  libraryPageCount,
  libraryPageTokens,
  sliceLibraryPage,
} from "@/lib/library/library-pagination";

describe("library-pagination", () => {
  it("telt pagina's in stappen van tien", () => {
    expect(LIBRARY_PAGE_SIZE).toBe(10);
    expect(libraryPageCount(0)).toBe(1);
    expect(libraryPageCount(10)).toBe(1);
    expect(libraryPageCount(11)).toBe(2);
    expect(libraryPageCount(84)).toBe(9);
  });

  it("snijdt de gevraagde pagina zonder overlap", () => {
    const items = Array.from({ length: 23 }, (_, index) => index + 1);
    expect(sliceLibraryPage(items, 1)).toEqual(items.slice(0, 10));
    expect(sliceLibraryPage(items, 3)).toEqual([21, 22, 23]);
  });

  it("toont alle nummers tot en met zeven pagina's", () => {
    expect(libraryPageTokens(1, 4)).toEqual([1, 2, 3, 4]);
  });

  it("houdt de reeks compact bij meer pagina's", () => {
    expect(libraryPageTokens(1, 9)).toEqual([1, 2, 3, "ellipsis", 9]);
    expect(libraryPageTokens(5, 9)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 9]);
    expect(libraryPageTokens(9, 9)).toEqual([1, "ellipsis", 7, 8, 9]);
  });
});
