import { existsSync } from "node:fs";
import { join } from "node:path";

function publicPad(src: string): string {
  return join(process.cwd(), "public", src.replace(/^\//, ""));
}

/**
 * Kies de nieuwste versie van een JPG: `naam-v2.jpg` wint van `naam.jpg`.
 * Bestaat geen bestand, dan blijft het aangeleverde pad staan.
 */
export function newestPublicJpg(src: string): string {
  const match = src.match(/^(.*?)(?:-v\d+)?(\.jpe?g)$/i);
  if (!match) {
    return src;
  }
  const stem = match[1];
  const ext = match[2];
  for (let n = 9; n >= 2; n -= 1) {
    const candidate = `${stem}-v${n}${ext}`;
    if (existsSync(publicPad(candidate))) {
      return candidate;
    }
  }
  const plain = `${stem}${ext}`;
  return existsSync(publicPad(plain)) ? plain : src;
}

/** Nieuwste JPG onder `dir/slug`, of `undefined` als er niets op schijf staat. */
export function publicJpgForSlug(dir: string, slug: string): string | undefined {
  const guessed = newestPublicJpg(`${dir}/${slug}.jpg`);
  return existsSync(publicPad(guessed)) ? guessed : undefined;
}
