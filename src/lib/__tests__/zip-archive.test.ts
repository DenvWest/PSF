import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { crc32, maakZip } from "@/lib/zip-archive";

describe("crc32", () => {
  it("geeft de standaardwaarde voor een bekende invoer", () => {
    expect(crc32(Buffer.from("123456789"))).toBe(0xcbf43926);
    expect(crc32(new Uint8Array())).toBe(0);
  });
});

describe("maakZip", () => {
  const bestanden = [
    { naam: "data.csv", inhoud: Buffer.from("a,b\r\n".repeat(500)) },
    { naam: "LEESMIJ.txt", inhoud: Buffer.from("© Open Food Facts contributors\r\n") },
    { naam: "leeg.txt", inhoud: new Uint8Array() },
  ];

  it("eindigt met een geldig einde-record dat het aantal bestanden noemt", async () => {
    const zip = await maakZip(bestanden, new Date("2026-10-09T10:00:00Z"));
    expect(zip.readUInt32LE(zip.length - 22)).toBe(0x06054b50);
    expect(zip.readUInt16LE(zip.length - 22 + 10)).toBe(3);
  });

  it("is leesbaar met een echte unzip, met bestandsnamen en inhoud intact", async () => {
    const map = mkdtempSync(join(tmpdir(), "zip-test-"));
    try {
      const pad = join(map, "test.zip");
      writeFileSync(pad, await maakZip(bestanden, new Date("2026-10-09T10:00:00Z")));
      const python = [
        "import sys, zipfile",
        "z = zipfile.ZipFile(sys.argv[1])",
        "assert z.testzip() is None",
        "print('|'.join(f'{i.filename}:{len(z.read(i))}' for i in z.infolist()))",
      ].join("\n");
      const uit = execFileSync("python3", ["-I", "-c", python, pad], { encoding: "utf8" }).trim();
      expect(uit).toBe(`data.csv:2500|LEESMIJ.txt:${Buffer.byteLength("© Open Food Facts contributors\r\n")}|leeg.txt:0`);
    } finally {
      rmSync(map, { recursive: true, force: true });
    }
  });
});
