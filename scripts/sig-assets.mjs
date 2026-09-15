// Builds the email-signature assets: contact icons, the light monogram, the
// horizontal lockup, the animated monogram GIF and the vCards.
// Rendering uses headless Chrome; the GIF is encoded with gifenc.
//   MODULES_DIR=/path/with/node_modules node scripts/sig-assets.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const out = path.join(root, "assets", "sig");
const logo = path.join(root, "assets", "logo");
mkdirSync(out, { recursive: true });
const tmp = path.join(process.env.TMPDIR || "/tmp", "mv-sig-frames");
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const INK = "#131E2C", BRASS = "#8F7238", BRASS_LIGHT = "#C6A667", GLINT = "#EFDDB0", PAPER = "#F5F4EF", SLATE = "#47566B";

function render(html, w, h, dest, transparent = true) {
  const src = path.join(tmp, `${path.basename(dest)}.html`);
  writeFileSync(src, `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;width:${w}px;height:${h}px;overflow:hidden;background:${transparent ? "transparent" : PAPER}}svg{display:block}</style></head><body>${html}</body></html>`);
  const args = ["--headless=new", `--user-data-dir=${tmp}/profile`, "--no-first-run", "--no-default-browser-check", "--disable-extensions", "--disable-gpu", "--hide-scrollbars", "--no-sandbox", `--window-size=${w},${h}`, `--screenshot=${dest}`, "--force-device-scale-factor=1"];
  if (transparent) args.push("--default-background-color=00000000");
  try { execFileSync(chrome, [...args, pathToFileURL(src).href], { stdio: "ignore", timeout: 25000, killSignal: "SIGKILL" }); } catch (e) { if (!existsSync(dest)) throw e; }
}

/* ---------- 1. Contact icons, 32px files shown at 16px ---------- */
const icons = {
  mail: `<path d="M2 4h12v8H2z" fill="none" stroke="${SLATE}" stroke-width="1.2"/><path d="M2 4l6 5 6-5" fill="none" stroke="${SLATE}" stroke-width="1.2"/>`,
  globe: `<circle cx="8" cy="8" r="6" fill="none" stroke="${SLATE}" stroke-width="1.2"/><path d="M2 8h12M8 2c2.2 2 2.2 10 0 12M8 2c-2.2 2-2.2 10 0 12" fill="none" stroke="${SLATE}" stroke-width="1.1"/>`,
  pin: `<path d="M8 14.5s-4.5-4.6-4.5-8a4.5 4.5 0 0 1 9 0c0 3.4-4.5 8-4.5 8z" fill="none" stroke="${SLATE}" stroke-width="1.2"/><circle cx="8" cy="6.5" r="1.6" fill="none" stroke="${SLATE}" stroke-width="1.2"/>`,
  card: `<rect x="2" y="3.5" width="12" height="9" fill="none" stroke="${SLATE}" stroke-width="1.2"/><circle cx="5.5" cy="7.5" r="1.4" fill="none" stroke="${SLATE}" stroke-width="1.1"/><path d="M9 6.5h3M9 9h3M3.5 11c.4-1.2 1.2-1.7 2-1.7s1.6.5 2 1.7" fill="none" stroke="${SLATE}" stroke-width="1.1"/>`,
};
for (const [name, body] of Object.entries(icons)) {
  render(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="32" height="32">${body}</svg>`, 32, 32, path.join(out, `icon-${name}.png`));
}

/* ---------- 2. Light monogram (for paper backgrounds) and lockup ---------- */
const monogramLight = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Marchbank &amp; Vale Associates">
  <rect width="512" height="512" fill="${PAPER}"/>
  <rect x="28" y="28" width="456" height="456" fill="none" stroke="${BRASS}" stroke-width="1.5" opacity=".7"/>
  <text x="256" y="268" text-anchor="middle" style="font-family:'Libre Caslon Display',Georgia,'Times New Roman',serif;font-size:176px;fill:${INK};letter-spacing:2px">M<tspan fill="${BRASS}">&amp;</tspan>V</text>
  <line x1="150" y1="316" x2="362" y2="316" stroke="${BRASS}" stroke-width="2"/>
  <text x="256" y="366" text-anchor="middle" style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:30px;font-weight:500;letter-spacing:7.5px;fill:${SLATE}">ASSOCIATES</text>
</svg>`;
writeFileSync(path.join(logo, "mv-monogram-light.svg"), monogramLight);
render(monogramLight.replace('viewBox="0 0 512 512"', 'viewBox="0 0 512 512" width="512" height="512"'), 512, 512, path.join(logo, "mv-monogram-light-512.png"), false);

const lockup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 150" role="img" aria-label="Marchbank &amp; Vale Associates">
  <rect width="980" height="150" fill="${PAPER}"/>
  <g transform="translate(0 0) scale(0.29296875)">
    <rect width="512" height="512" fill="${INK}"/>
    <rect x="28" y="28" width="456" height="456" fill="none" stroke="${BRASS}" stroke-width="1.5" opacity=".55"/>
    <text x="256" y="268" text-anchor="middle" style="font-family:'Libre Caslon Display',Georgia,'Times New Roman',serif;font-size:176px;fill:${PAPER};letter-spacing:2px">M<tspan fill="${BRASS_LIGHT}">&amp;</tspan>V</text>
    <line x1="150" y1="316" x2="362" y2="316" stroke="${BRASS}" stroke-width="2"/>
    <text x="256" y="366" text-anchor="middle" style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:30px;font-weight:500;letter-spacing:7.5px;fill:#9AA6B8">ASSOCIATES</text>
  </g>
  <text x="192" y="70" style="font-family:'Libre Caslon Display',Georgia,'Times New Roman',serif;font-size:52px;letter-spacing:4.6px;fill:${INK}">MARCHBANK <tspan style="fill:${BRASS}">&amp;</tspan> VALE</text>
  <line x1="194" y1="92" x2="964" y2="92" stroke="${BRASS}" stroke-width="1.25"/>
  <text x="194" y="119" style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:13px;font-weight:500;letter-spacing:8.5px;fill:${SLATE}">ASSOCIATES  ·  RECOVERIES &amp; LITIGATION SUPPORT</text>
</svg>`;
writeFileSync(path.join(logo, "mv-lockup.svg"), lockup);
render(lockup.replace('viewBox="0 0 980 150"', 'viewBox="0 0 980 150" width="980" height="150"'), 980, 150, path.join(logo, "mv-lockup-980.png"), false);

/* ---------- 3. Animated monogram: full logo first, then a brass glint sweeps the rule ---------- */
const SIZE = 144;
function frame(p) {
  // p in [0,1]: position of the glint along the rule; p<0 means no glint
  const glint = p < 0 ? "" : `
    <defs><linearGradient id="g" x1="150" x2="362" y1="0" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="${Math.max(0, p - 0.22)}" stop-color="${BRASS}"/>
      <stop offset="${p}" stop-color="${GLINT}"/>
      <stop offset="${Math.min(1, p + 0.22)}" stop-color="${BRASS}"/>
    </linearGradient></defs>
    <line x1="150" y1="316" x2="362" y2="316" stroke="url(#g)" stroke-width="2"/>`;
  const near = p < 0 ? 0 : Math.max(0, 1 - Math.abs(p - 0.5) / 0.3);
  const amp = mix(BRASS_LIGHT, GLINT, near);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${SIZE}" height="${SIZE}">
    <rect width="512" height="512" fill="${INK}"/>
    <rect x="28" y="28" width="456" height="456" fill="none" stroke="${BRASS}" stroke-width="1.5" opacity=".55"/>
    <text x="256" y="268" text-anchor="middle" style="font-family:'Libre Caslon Display',Georgia,'Times New Roman',serif;font-size:176px;fill:${PAPER};letter-spacing:2px">M<tspan fill="${amp}">&amp;</tspan>V</text>
    <line x1="150" y1="316" x2="362" y2="316" stroke="${BRASS}" stroke-width="2"/>${glint}
    <text x="256" y="366" text-anchor="middle" style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:30px;font-weight:500;letter-spacing:7.5px;fill:#9AA6B8">ASSOCIATES</text>
  </svg>`;
  return svg;
}
function mix(a, b, t) {
  const A = a.match(/\w\w/g).map((x) => parseInt(x, 16)), B = b.match(/\w\w/g).map((x) => parseInt(x, 16));
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
const steps = [-1];
for (let i = 0; i <= 22; i++) steps.push(i / 22);
const frames = [];
steps.forEach((p, i) => { const f = path.join(tmp, `f${String(i).padStart(2, "0")}.png`); render(frame(p), SIZE, SIZE, f, false); frames.push(f); });

const mods = process.env.MODULES_DIR;
const { GIFEncoder, quantize, applyPalette } = await import(pathToFileURL(path.join(mods, "node_modules/gifenc/dist/gifenc.esm.js")).href);
const { PNG } = await import(pathToFileURL(path.join(mods, "node_modules/pngjs/lib/png.js")).href).then((m) => m.default || m);
const gif = GIFEncoder();
let palette = null;
frames.forEach((f, i) => {
  const png = PNG.sync.read(readFileSync(f));
  const rgba = new Uint8ClampedArray(png.data.buffer, png.data.byteOffset, png.data.length);
  if (!palette) palette = quantize(rgba, 128, { format: "rgb444" });
  const index = applyPalette(rgba, palette, "rgb444");
  const hold = i === 0 ? 2600 : i === frames.length - 1 ? 1400 : 45;
  gif.writeFrame(index, png.width, png.height, { palette: i === 0 ? palette : undefined, delay: hold, repeat: 2 });
});
gif.finish();
writeFileSync(path.join(out, "mv-monogram-144.gif"), gif.bytes());

/* ---------- 4. vCards, one per mailbox ---------- */
const boxes = { casework: "Casework", enquiries: "Enquiries", accounts: "Accounts", complaints: "Complaints", contact: "Contact" };
for (const [box, label] of Object.entries(boxes)) {
  const v = ["BEGIN:VCARD", "VERSION:3.0", `FN:Marchbank & Vale Associates (${label})`, "N:;Marchbank & Vale Associates;;;", "ORG:Marchbank & Vale Associates;Recoveries & Litigation Support",
    `EMAIL;TYPE=INTERNET,WORK:${box}@marchbankvale.co.uk`, "URL:https://marchbankvale.co.uk", "ADR;TYPE=WORK:;;Lancaster House, Brownrigg Drive;Cramlington;;NE23 6UN;United Kingdom",
    "NOTE:Trading name of Sure Lets and Manage Limited, company number 16613860. Not solicitors.", "END:VCARD"].join("\r\n") + "\r\n";
  writeFileSync(path.join(out, `marchbank-vale-${box}.vcf`), v);
}
console.log("done:", out);
