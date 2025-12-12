const byteToHex = new Array<string>(256);
for (let i = 0; i < 256; i++) {
  byteToHex[i] = (i + 0x100).toString(16).substring(1);
}

const randomBytes = new Uint8Array(16);
const cryptoObj =
  typeof globalThis !== "undefined" ? (globalThis as any).crypto : undefined;

const fillRandomBytes = (bytes: Uint8Array) => {
  if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
    cryptoObj.getRandomValues(bytes);
    return;
  }

  // Fallback when crypto is unavailable
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = (Math.random() * 256) | 0;
  }
};

export const uuidv4 = (): string => {
  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    return cryptoObj.randomUUID();
  }

  fillRandomBytes(randomBytes);

  randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40;
  randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80;

  return (
    byteToHex[randomBytes[0]] +
    byteToHex[randomBytes[1]] +
    byteToHex[randomBytes[2]] +
    byteToHex[randomBytes[3]] +
    "-" +
    byteToHex[randomBytes[4]] +
    byteToHex[randomBytes[5]] +
    "-" +
    byteToHex[randomBytes[6]] +
    byteToHex[randomBytes[7]] +
    "-" +
    byteToHex[randomBytes[8]] +
    byteToHex[randomBytes[9]] +
    "-" +
    byteToHex[randomBytes[10]] +
    byteToHex[randomBytes[11]] +
    byteToHex[randomBytes[12]] +
    byteToHex[randomBytes[13]] +
    byteToHex[randomBytes[14]] +
    byteToHex[randomBytes[15]]
  );
};
