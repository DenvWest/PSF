#!/usr/bin/env node
// Genereert een nieuw TOTP-secret voor admin-MFA (audit N8).
// Gebruik: node scripts/generate-admin-totp-secret.mjs
//
// 1. Draai dit script, zet de geprinte ADMIN_TOTP_SECRET in .env op de server.
// 2. Scan de otpauth://-URI (of voer het secret handmatig in) in een
//    authenticator-app (Google/Microsoft Authenticator, 1Password, Authy).
// 3. Herstart de app (systemctl restart perfectsupplement) zodat de nieuwe
//    env-variabele geladen wordt.
// 4. Vanaf dat moment vraagt /admin/login na het wachtwoord ook een 6-cijferige code.

import { randomBytes } from "node:crypto";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function generateBase32Secret(byteLength = 20) {
  const bytes = randomBytes(byteLength);
  let bits = "";
  for (const byte of bytes) {
    bits += byte.toString(2).padStart(8, "0");
  }
  let out = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    out += ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  }
  return out;
}

const secret = generateBase32Secret();
const issuer = "PerfectSupplement";
const account = "admin";
const otpauthUri = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&digits=6&period=30`;

console.log("ADMIN_TOTP_SECRET=" + secret);
console.log("");
console.log("otpauth-URI (handmatig invoeren of QR-code van maken):");
console.log(otpauthUri);
console.log("");
console.log("Volgende stappen:");
console.log("1. Zet ADMIN_TOTP_SECRET in /root/perfectsupplement/.env");
console.log("2. Voeg het secret toe aan je authenticator-app");
console.log("3. sudo systemctl restart perfectsupplement");
