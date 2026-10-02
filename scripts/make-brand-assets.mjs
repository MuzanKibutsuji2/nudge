/**
 * Draws the Nudge mark — a small dot giving a larger curve a gentle push —
 * straight into PNG files, so the app icon, splash and favicon are the exact
 * same geometry as components/Logo.tsx.
 *
 *   node scripts/make-brand-assets.mjs
 *
 * No image libraries: the shapes are analytic (a disc and a stroked arc), so
 * coverage is computed per pixel with 4x supersampling and written out as a
 * plain zlib-deflated PNG.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const OUT = path.join(process.cwd(), 'assets');

/* ---- the mark, in a 48x48 design space (same as the SVG in the app) ---- */
const DOT = { x: 12, y: 24, r: 5.5 };
const ARC = { x: 30.099, y: 24, r: 13.5, half: 112.2, width: 4.5 };
// Tight bounds of the drawn shapes, so the mark optically centres in a square.
const BOUNDS = {
  minX: DOT.x - DOT.r,
  maxX: ARC.x + ARC.r + ARC.width / 2,
  minY: ARC.y - ARC.r * Math.sin((ARC.half * Math.PI) / 180) - ARC.width / 2,
  maxY: ARC.y + ARC.r * Math.sin((ARC.half * Math.PI) / 180) + ARC.width / 2,
};
const MARK = {
  cx: (BOUNDS.minX + BOUNDS.maxX) / 2,
  cy: (BOUNDS.minY + BOUNDS.maxY) / 2,
  size: Math.max(BOUNDS.maxX - BOUNDS.minX, BOUNDS.maxY - BOUNDS.minY),
};

/** Signed coverage test for one sample point in design space. */
function inMark(x, y) {
  // dot
  if ((x - DOT.x) ** 2 + (y - DOT.y) ** 2 <= DOT.r ** 2) return true;

  // arc band
  const dx = x - ARC.x;
  const dy = y - ARC.y;
  const d = Math.hypot(dx, dy);
  const half = ARC.width / 2;
  if (Math.abs(d - ARC.r) <= half) {
    const angle = Math.abs((Math.atan2(dy, dx) * 180) / Math.PI);
    if (angle <= ARC.half) return true;
  }

  // round caps at both ends of the arc
  for (const sign of [-1, 1]) {
    const a = (sign * ARC.half * Math.PI) / 180;
    const cx = ARC.x + Math.cos(a) * ARC.r;
    const cy = ARC.y + Math.sin(a) * ARC.r;
    if ((x - cx) ** 2 + (y - cy) ** 2 <= half ** 2) return true;
  }

  return false;
}

function hex(color) {
  const h = color.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/**
 * @param size    pixel size of the square canvas
 * @param scale   how much of the canvas the mark fills (0–1)
 * @param fg      mark colour
 * @param bg      background colour, or null for transparent
 */
function render({ size, scale, fg, bg }) {
  const [fr, fg_, fb] = hex(fg);
  const [br, bg_, bb] = bg ? hex(bg) : [0, 0, 0];
  const pixels = Buffer.alloc(size * size * 4);

  const span = MARK.size / scale;
  const originX = MARK.cx - span / 2;
  const originY = MARK.cy - span / 2;
  const SS = 4; // supersampling

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      let hits = 0;
      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          const x = originX + ((px + (sx + 0.5) / SS) / size) * span;
          const y = originY + ((py + (sy + 0.5) / SS) / size) * span;
          if (inMark(x, y)) hits += 1;
        }
      }
      const coverage = hits / (SS * SS);
      const i = (py * size + px) * 4;

      if (bg) {
        pixels[i] = Math.round(br + (fr - br) * coverage);
        pixels[i + 1] = Math.round(bg_ + (fg_ - bg_) * coverage);
        pixels[i + 2] = Math.round(bb + (fb - bb) * coverage);
        pixels[i + 3] = 255;
      } else {
        pixels[i] = fr;
        pixels[i + 1] = fg_;
        pixels[i + 2] = fb;
        pixels[i + 3] = Math.round(coverage * 255);
      }
    }
  }

  return encodePng(pixels, size, size);
}

function encodePng(rgba, width, height) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const chunk = (type, data) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body) >>> 0);
    return Buffer.concat([length, body, crc]);
  };

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ 0xffffffff;
}

const ACCENT = '#2E6B5E';
const PAPER = '#FBF8F4';

const files = [
  ['icon.png', { size: 1024, scale: 0.56, fg: ACCENT, bg: PAPER }],
  ['android-icon-foreground.png', { size: 1024, scale: 0.4, fg: ACCENT, bg: null }],
  ['android-icon-monochrome.png', { size: 1024, scale: 0.4, fg: '#000000', bg: null }],
  ['splash-icon.png', { size: 512, scale: 0.68, fg: ACCENT, bg: null }],
  ['favicon.png', { size: 64, scale: 0.74, fg: ACCENT, bg: PAPER }],
];

fs.mkdirSync(OUT, { recursive: true });
for (const [name, opts] of files) {
  const png = render(opts);
  fs.writeFileSync(path.join(OUT, name), png);
  console.log(`${name.padEnd(30)} ${opts.size}px  ${(png.length / 1024).toFixed(1)}KB`);
}
