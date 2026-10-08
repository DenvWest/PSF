import { promisify } from "node:util";
import { deflateRaw } from "node:zlib";

const deflateRawAsync = promisify(deflateRaw);

export type ZipBestand = { naam: string; inhoud: Uint8Array };

const CRC_TABEL = (() => {
  const tabel = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    tabel[n] = c >>> 0;
  }
  return tabel;
})();

export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) crc = CRC_TABEL[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosTijd(d: Date): { tijd: number; datum: number } {
  return {
    tijd: (d.getUTCHours() << 11) | (d.getUTCMinutes() << 5) | (d.getUTCSeconds() >> 1),
    datum: ((d.getUTCFullYear() - 1980) << 9) | ((d.getUTCMonth() + 1) << 5) | d.getUTCDate(),
  };
}

const UTF8_NAMEN = 0x0800;
const METHODE_OPGESLAGEN = 0;
const METHODE_DEFLATE = 8;

/**
 * Een zip zonder afhankelijkheden: bestanden met deflate (of opgeslagen als dat
 * kleiner is), UTF-8-namen, geen zip64. Genoeg voor een handvol bestanden onder 4 GB.
 */
export async function maakZip(bestanden: readonly ZipBestand[], tijdstip: Date): Promise<Buffer> {
  const { tijd, datum } = dosTijd(tijdstip);
  const delen: Buffer[] = [];
  const centraal: Buffer[] = [];
  let positie = 0;

  for (const { naam, inhoud } of bestanden) {
    const naamBytes = Buffer.from(naam, "utf8");
    const gecomprimeerd = await deflateRawAsync(inhoud);
    const gedeflate = gecomprimeerd.length < inhoud.length;
    const data = gedeflate ? gecomprimeerd : Buffer.from(inhoud);
    const methode = gedeflate ? METHODE_DEFLATE : METHODE_OPGESLAGEN;
    const crc = crc32(inhoud);

    const lokaal = Buffer.alloc(30);
    lokaal.writeUInt32LE(0x04034b50, 0);
    lokaal.writeUInt16LE(20, 4);
    lokaal.writeUInt16LE(UTF8_NAMEN, 6);
    lokaal.writeUInt16LE(methode, 8);
    lokaal.writeUInt16LE(tijd, 10);
    lokaal.writeUInt16LE(datum, 12);
    lokaal.writeUInt32LE(crc, 14);
    lokaal.writeUInt32LE(data.length, 18);
    lokaal.writeUInt32LE(inhoud.length, 22);
    lokaal.writeUInt16LE(naamBytes.length, 26);

    const kop = Buffer.alloc(46);
    kop.writeUInt32LE(0x02014b50, 0);
    kop.writeUInt16LE(20, 4);
    kop.writeUInt16LE(20, 6);
    kop.writeUInt16LE(UTF8_NAMEN, 8);
    kop.writeUInt16LE(methode, 10);
    kop.writeUInt16LE(tijd, 12);
    kop.writeUInt16LE(datum, 14);
    kop.writeUInt32LE(crc, 16);
    kop.writeUInt32LE(data.length, 20);
    kop.writeUInt32LE(inhoud.length, 24);
    kop.writeUInt16LE(naamBytes.length, 28);
    kop.writeUInt32LE(positie, 42);

    delen.push(lokaal, naamBytes, data);
    centraal.push(kop, naamBytes);
    positie += lokaal.length + naamBytes.length + data.length;
  }

  const centraalGrootte = centraal.reduce((som, deel) => som + deel.length, 0);
  const einde = Buffer.alloc(22);
  einde.writeUInt32LE(0x06054b50, 0);
  einde.writeUInt16LE(bestanden.length, 8);
  einde.writeUInt16LE(bestanden.length, 10);
  einde.writeUInt32LE(centraalGrootte, 12);
  einde.writeUInt32LE(positie, 16);

  return Buffer.concat([...delen, ...centraal, einde]);
}
