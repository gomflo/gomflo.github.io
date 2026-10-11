// Lee un papelito del fragmento del enlace. Es la misma cuenta que `SlipLink` en la app, al revés:
// base64url -> 4 bytes de sal -> XOR con un xorshift32 sembrado con la sal -> campos separados por U+001F.
// Todo pasa en el navegador: el fragmento nunca se manda al servidor.
function decodeSlip(link) {
  const hash = link.indexOf('#');
  const fragment = (hash >= 0 ? link.slice(hash + 1) : link).trim();
  if (!/^[A-Za-z0-9_-]+$/.test(fragment)) return null;
  let binary;
  try {
    binary = atob(fragment.replace(/-/g, '+').replace(/_/g, '/'));
  } catch (e) {
    return null;
  }
  if (binary.length <= 4) return null;
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  let x = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) | 0;
  if (x === 0) x = 0x9e3779b9 | 0;
  const plain = new Uint8Array(bytes.length - 4);
  for (let i = 0; i < plain.length; i++) {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    plain[i] = bytes[i + 4] ^ (x & 0xff);
  }
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(plain);
  } catch (e) {
    return null;
  }
  const fields = text.split('\u001f');
  if (fields.length < 7 || fields[0] !== '1' || !fields[1] || !fields[2]) return null;
  return { owner: fields[1], receiver: fields[2], exchange: fields[3], amount: fields[4], when: fields[5], place: fields[6], paper: fields[7] || '' };
}

if (typeof module !== 'undefined') module.exports = { decodeSlip };
