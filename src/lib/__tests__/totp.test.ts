import { describe, expect, it } from "vitest";
import { generateBase32Secret, verifyTotpCode } from "@/lib/totp";

// RFC 6238 Appendix B testvectoren (SHA1, 8-cijferig in de RFC — hier
// afgekapt tot de laatste 6 cijfers, want deze implementatie gebruikt 6
// cijfers zoals elke consumenten-authenticator-app). Secret = base32 van
// de RFC-testwaarde "12345678901234567890" (ASCII).
const RFC_SECRET = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

describe("verifyTotpCode", () => {
  it("accepteert de RFC 6238-testvector op T=59s", () => {
    expect(verifyTotpCode(RFC_SECRET, "287082", 59_000)).toBe(true);
  });

  it("accepteert de RFC 6238-testvector op T=1111111109s", () => {
    expect(verifyTotpCode(RFC_SECRET, "081804", 1_111_111_109_000)).toBe(true);
  });

  it("weigert een foute code", () => {
    expect(verifyTotpCode(RFC_SECRET, "000000", 59_000)).toBe(false);
  });

  it("weigert een code buiten het ±1-stapvenster (30s)", () => {
    // T=59s hoort bij counter 1 (0-29s=counter0, 30-59s=counter1).
    // Counter 1 ± 1 = {0,1,2}, dus T=120s (counter 4) moet falen.
    expect(verifyTotpCode(RFC_SECRET, "287082", 120_000)).toBe(false);
  });

  it("weigert een niet-6-cijferige input", () => {
    expect(verifyTotpCode(RFC_SECRET, "12345", 59_000)).toBe(false);
    expect(verifyTotpCode(RFC_SECRET, "1234567", 59_000)).toBe(false);
    expect(verifyTotpCode(RFC_SECRET, "abcdef", 59_000)).toBe(false);
  });

  it("weigert een leeg secret", () => {
    expect(verifyTotpCode("", "287082", 59_000)).toBe(false);
  });

  it("accepteert de vorige tijdstap (drift -1, T=29s met code van T=59s' buur)", () => {
    // Counter voor T=59s is 1. Counter-1=0 hoort bij T=0-29s. De RFC-vector
    // "287082" (counter 1) moet dus ook nog gelden op T=29s (counter 0, binnen
    // het ±1-venster).
    expect(verifyTotpCode(RFC_SECRET, "287082", 29_000)).toBe(true);
  });
});

describe("generateBase32Secret", () => {
  it("genereert alleen geldige base32-tekens", () => {
    const secret = generateBase32Secret();
    expect(secret).toMatch(/^[A-Z2-7]+$/);
  });

  it("genereert verschillende secrets bij elke aanroep", () => {
    const a = generateBase32Secret();
    const b = generateBase32Secret();
    expect(a).not.toBe(b);
  });

  it("een gegenereerd secret werkt met verifyTotpCode (geen crash, consistent algoritme)", () => {
    const secret = generateBase32Secret();
    // Een willekeurige 6-cijferige code hoeft niet te kloppen, maar de call
    // mag nooit throwen op een geldig gegenereerd secret.
    expect(() => verifyTotpCode(secret, "123456")).not.toThrow();
  });
});
