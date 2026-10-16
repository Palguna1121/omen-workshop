import {
  CanvasTexture,
  ClampToEdgeWrapping,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from "three";

// Tekstur dibuat di browser dari canvas: tidak ada unduhan gambar tambahan.
const cache = new Map<string, Texture>();

function seeded(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) =>
    Math.max(0, Math.min(255, Math.round(c + amount * 255)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

function make(
  key: string,
  width: number,
  height: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
  repeat = true,
) {
  let texture = cache.get(key);
  if (texture) return texture;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d")!, width, height);
  texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  texture.wrapS = texture.wrapT = repeat ? RepeatWrapping : ClampToEdgeWrapping;
  cache.set(key, texture);
  return texture;
}

function roundRect(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
}

/** Ubin batu jalan masuk; satu tekstur = 2 m. */
export function pavingTexture() {
  return make("paving", 512, 512, (g, w, h) => {
    const rand = seeded(7);
    g.fillStyle = "#4a3c40";
    g.fillRect(0, 0, w, h);
    const rows = 5;
    const rh = h / rows;
    for (let r = 0; r < rows; r++) {
      let x = -rand() * 80;
      while (x < w) {
        const sw = 70 + rand() * 90;
        const base = ["#9a8584", "#8c7676", "#a38f88", "#7f6d72"][
          Math.floor(rand() * 4)
        ];
        g.fillStyle = shade(base, (rand() - 0.5) * 0.08);
        roundRect(g, x + 3, r * rh + 3, sw - 6, rh - 6, 6);
        g.fill();
        g.fillStyle = "rgba(255,230,210,0.07)";
        roundRect(g, x + 5, r * rh + 5, sw - 10, 6, 3);
        g.fill();
        for (let i = 0; i < 6; i++) {
          g.fillStyle = `rgba(40,25,35,${0.05 + rand() * 0.06})`;
          g.beginPath();
          g.arc(
            x + rand() * sw,
            r * rh + rand() * rh,
            3 + rand() * 9,
            0,
            Math.PI * 2,
          );
          g.fill();
        }
        // Wrap horizontal agar sambungan tekstur tidak terlihat.
        if (x + sw > w) {
          g.fillStyle = shade(base, 0);
          roundRect(g, x + 3 - w, r * rh + 3, sw - 6, rh - 6, 6);
          g.fill();
        }
        x += sw;
      }
    }
  });
}

/** Papan kayu; satu tekstur = 2 m. */
export function plankTexture(tone: "warm" | "dark" = "warm") {
  return make(`planks-${tone}`, 512, 512, (g, w, h) => {
    const rand = seeded(tone === "warm" ? 11 : 13);
    const colors =
      tone === "warm"
        ? ["#a8724a", "#9c6842", "#b37d51", "#94603c"]
        : ["#5e3b2a", "#553424", "#664230", "#4d2f22"];
    const count = 8;
    const pw = w / count;
    for (let i = 0; i < count; i++) {
      const base = colors[Math.floor(rand() * colors.length)];
      g.fillStyle = base;
      g.fillRect(i * pw, 0, pw, h);
      for (let k = 0; k < 14; k++) {
        g.strokeStyle = `rgba(50,25,15,${0.08 + rand() * 0.1})`;
        g.lineWidth = 1 + rand() * 1.5;
        const x = i * pw + rand() * pw;
        g.beginPath();
        g.moveTo(x, 0);
        g.bezierCurveTo(x + 6, h * 0.3, x - 6, h * 0.6, x + 2, h);
        g.stroke();
      }
      const cut = rand() * h;
      g.fillStyle = "rgba(30,15,10,0.55)";
      g.fillRect(i * pw, cut, pw, 3);
      g.fillRect(i * pw, 0, 3, h);
      g.fillStyle = "rgba(255,220,180,0.08)";
      g.fillRect(i * pw + 3, 0, 3, h);
    }
  });
}

/** Genteng tanah liat gelap; satu tekstur = 1.2 m. */
export function roofTexture() {
  return make("roof", 256, 256, (g, w, h) => {
    const rand = seeded(5);
    g.fillStyle = "#211a26";
    g.fillRect(0, 0, w, h);
    const rows = 6;
    const cols = 6;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols + 1; c++) {
        const x = c * (w / cols) - (r % 2) * (w / cols / 2);
        const y = r * (h / rows);
        const grad = g.createLinearGradient(x, 0, x + w / cols, 0);
        const tint = (rand() - 0.5) * 0.06;
        grad.addColorStop(0, shade("#2f2836", tint));
        grad.addColorStop(0.5, shade("#4b4252", tint));
        grad.addColorStop(1, shade("#2a2331", tint));
        g.fillStyle = grad;
        roundRect(g, x + 1, y + 1, w / cols - 2, h / rows + 6, 10);
        g.fill();
      }
  });
}

/** Dinding batu penahan; satu tekstur = 2 m. */
export function stoneWallTexture() {
  return make("stonewall", 512, 512, (g, w, h) => {
    const rand = seeded(21);
    g.fillStyle = "#3d3036";
    g.fillRect(0, 0, w, h);
    let y = 0;
    while (y < h) {
      const rh = 40 + rand() * 40;
      let x = -rand() * 60;
      while (x < w) {
        const sw = 60 + rand() * 80;
        g.fillStyle = shade(
          ["#7d6a6b", "#6f5d61", "#8b7774", "#655458"][Math.floor(rand() * 4)],
          (rand() - 0.5) * 0.08,
        );
        roundRect(g, x + 3, y + 3, sw - 6, Math.min(rh, h - y) - 6, 12);
        g.fill();
        g.fillStyle = "rgba(255,220,200,0.06)";
        roundRect(g, x + 6, y + 5, sw - 14, 6, 3);
        g.fill();
        x += sw;
      }
      y += rh;
    }
  });
}

/** Plester kasar untuk dinding rumah. */
export function stuccoTexture() {
  return make("stucco", 256, 256, (g, w, h) => {
    const rand = seeded(3);
    g.fillStyle = "#f4efea";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = `rgba(${rand() > 0.5 ? "255,250,240" : "90,70,70"},${0.04 + rand() * 0.05})`;
      g.beginPath();
      g.arc(rand() * w, rand() * h, 1 + rand() * 6, 0, Math.PI * 2);
      g.fill();
    }
  });
}

/** Karpet bermotif tenun. */
export function rugTexture(
  variant: "red" | "navy" = "red",
) {
  return make(
    `rug-${variant}`,
    512,
    512,
    (g, w, h) => {
      const [base, mid, accent, light] =
        variant === "red"
          ? ["#7c2430", "#a83a3a", "#e3a24a", "#ecdcc0"]
          : ["#242a52", "#3b3f7a", "#d0613a", "#e8d6b8"];
      g.fillStyle = base;
      g.fillRect(0, 0, w, h);
      g.strokeStyle = light;
      g.lineWidth = 10;
      g.strokeRect(22, 22, w - 44, h - 44);
      g.strokeStyle = accent;
      g.lineWidth = 6;
      g.strokeRect(44, 44, w - 88, h - 88);
      g.fillStyle = mid;
      g.fillRect(60, 60, w - 120, h - 120);
      g.save();
      g.translate(w / 2, h / 2);
      for (let ring = 4; ring > 0; ring--) {
        g.fillStyle = [light, accent, base, accent][ring - 1];
        g.beginPath();
        const s = ring * 42;
        g.moveTo(0, -s);
        g.lineTo(s, 0);
        g.lineTo(0, s);
        g.lineTo(-s, 0);
        g.closePath();
        g.fill();
      }
      g.restore();
      g.fillStyle = accent;
      for (let i = 0; i < 12; i++) {
        const t = 80 + i * ((w - 160) / 11);
        for (const [x, y] of [
          [t, 72],
          [t, h - 72],
          [72, t],
          [w - 72, t],
        ]) {
          g.beginPath();
          g.moveTo(x, y - 7);
          g.lineTo(x + 7, y);
          g.lineTo(x, y + 7);
          g.lineTo(x - 7, y);
          g.fill();
        }
      }
      const rand = seeded(9);
      for (let i = 0; i < 3000; i++) {
        g.fillStyle = `rgba(0,0,0,${rand() * 0.06})`;
        g.fillRect(rand() * w, rand() * h, 2, 2);
      }
    },
    false,
  );
}

/** Lambang Omen: tiga garis mata cyan di dalam hood bersudut. */
export function drawEmblem(
  g: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  stroke: string,
) {
  g.save();
  g.translate(cx, cy);
  g.strokeStyle = stroke;
  g.lineWidth = s * 0.07;
  g.lineJoin = "round";
  g.beginPath();
  g.moveTo(0, -s * 0.55);
  g.lineTo(s * 0.48, 0);
  g.lineTo(0, s * 0.55);
  g.lineTo(-s * 0.48, 0);
  g.closePath();
  g.stroke();
  g.beginPath();
  g.moveTo(0, -s * 0.3);
  g.lineTo(s * 0.24, s * 0.05);
  g.lineTo(0, s * 0.3);
  g.lineTo(-s * 0.24, s * 0.05);
  g.closePath();
  g.stroke();
  g.restore();
}

/** Spanduk ungu dengan lambang. */
export function bannerTexture() {
  return make(
    "banner",
    256,
    512,
    (g, w, h) => {
      const grad = g.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#4a2183");
      grad.addColorStop(1, "#6a33b4");
      g.fillStyle = grad;
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#2b1150";
      g.fillRect(0, 0, w, 26);
      g.strokeStyle = "#c9a7ff";
      g.lineWidth = 5;
      g.strokeRect(16, 40, w - 32, h - 130);
      drawEmblem(g, w / 2, h * 0.43, 150, "#efe2ff");
      g.fillStyle = "#6a33b4";
      g.beginPath();
      g.moveTo(0, h - 70);
      g.lineTo(w / 2, h);
      g.lineTo(w, h - 70);
      g.lineTo(w, h);
      g.lineTo(0, h);
      g.fill();
    },
    false,
  );
}

/** Pola rotan untuk lampion; dipakai sebagai alpha map. */
export function latticeTexture() {
  return make("lattice", 128, 128, (g, w, h) => {
    g.fillStyle = "#000";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#fff";
    g.lineWidth = 7;
    for (let i = -4; i < 8; i++) {
      g.beginPath();
      g.moveTo(i * 32, 0);
      g.lineTo(i * 32 + 128, h);
      g.stroke();
      g.beginPath();
      g.moveTo(i * 32 + 128, 0);
      g.lineTo(i * 32, h);
      g.stroke();
    }
  });
}

/** Layar monitor UI ungu/cyan. */
export function screenTexture(variant: 0 | 1 | 2 = 0) {
  return make(
    `screen-${variant}`,
    256,
    160,
    (g, w, h) => {
      const rand = seeded(30 + variant);
      g.fillStyle = "#0b0f2a";
      g.fillRect(0, 0, w, h);
      const grad = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w);
      grad.addColorStop(0, "rgba(120,70,255,0.35)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "#5fe9ff";
      g.lineWidth = 2;
      g.strokeRect(6, 6, w - 12, h - 12);
      if (variant === 0) {
        drawEmblem(g, w / 2, h / 2, 90, "#b88bff");
        g.fillStyle = "#5fe9ff";
        g.fillRect(w / 2 - 50, h - 30, 100, 4);
      } else {
        for (let i = 0; i < 9; i++) {
          g.fillStyle = i % 3 === 0 ? "#b88bff" : "#5fe9ff";
          g.globalAlpha = 0.5 + rand() * 0.5;
          g.fillRect(18, 18 + i * 14, 30 + rand() * (w * 0.55), 5);
        }
        g.globalAlpha = 1;
        g.strokeStyle = "#ff9b5c";
        g.beginPath();
        for (let x = 0; x < 70; x++)
          g.lineTo(w - 90 + x, h - 30 - Math.abs(Math.sin(x * 0.2 + variant)) * 30);
        g.stroke();
      }
    },
    false,
  );
}

/** Papan blueprint perjalanan. */
export function blueprintTexture() {
  return make(
    "blueprint",
    512,
    320,
    (g, w, h) => {
      g.fillStyle = "#14254a";
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(120,200,255,0.18)";
      g.lineWidth = 1;
      for (let x = 0; x < w; x += 16) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, h);
        g.stroke();
      }
      for (let y = 0; y < h; y += 16) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(w, y);
        g.stroke();
      }
      g.strokeStyle = "#8fe3ff";
      g.lineWidth = 3;
      // Garis perjalanan: titik-titik milestone.
      g.beginPath();
      const points = [
        [50, 250],
        [140, 180],
        [230, 210],
        [320, 120],
        [410, 150],
        [470, 60],
      ];
      points.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
      for (const [x, y] of points) {
        g.fillStyle = "#ffb35c";
        g.beginPath();
        g.arc(x, y, 9, 0, Math.PI * 2);
        g.fill();
      }
      drawEmblem(g, 110, 80, 80, "#c9b1ff");
      g.fillStyle = "#8fe3ff";
      for (let i = 0; i < 4; i++) g.fillRect(300, 230 + i * 16, 160 - i * 25, 5);
    },
    false,
  );
}

/** Poster film/game bergaya. */
export function posterTexture(variant: 0 | 1 = 0) {
  return make(
    `poster-${variant}`,
    256,
    360,
    (g, w, h) => {
      const grad = g.createLinearGradient(0, 0, 0, h);
      if (variant === 0) {
        grad.addColorStop(0, "#2b1458");
        grad.addColorStop(0.6, "#b0347a");
        grad.addColorStop(1, "#ff9150");
      } else {
        grad.addColorStop(0, "#0e2a3a");
        grad.addColorStop(1, "#2c7a8a");
      }
      g.fillStyle = grad;
      g.fillRect(0, 0, w, h);
      g.fillStyle = variant === 0 ? "#ffd27a" : "#9ff3ff";
      g.beginPath();
      g.arc(w / 2, h * 0.62, 50, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#170c24";
      g.beginPath();
      g.moveTo(w * 0.5, h * 0.3);
      g.lineTo(w * 0.78, h * 0.85);
      g.lineTo(w * 0.22, h * 0.85);
      g.fill();
      g.fillStyle = "#5fe9ff";
      g.fillRect(w * 0.44, h * 0.55, 6, 22);
      g.fillRect(w * 0.49, h * 0.55, 6, 22);
      g.fillRect(w * 0.54, h * 0.55, 6, 22);
      g.fillStyle = "#fff";
      g.font = "bold 30px sans-serif";
      g.textAlign = "center";
      g.fillText(variant === 0 ? "OMEN" : "SHADOW", w / 2, 50);
      g.strokeStyle = "#f6e6c8";
      g.lineWidth = 10;
      g.strokeRect(0, 0, w, h);
    },
    false,
  );
}

/** Panel kayu berukir di atas sofa. */
export function carvedTexture() {
  return make(
    "carved",
    256,
    256,
    (g, w, h) => {
      g.fillStyle = "#6b4028";
      g.fillRect(0, 0, w, h);
      g.save();
      g.translate(w / 2, h / 2);
      for (let i = 0; i < 12; i++) {
        g.rotate(Math.PI / 6);
        g.fillStyle = i % 2 ? "#8a5634" : "#4e2c1b";
        g.beginPath();
        g.ellipse(0, -62, 16, 46, 0, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = "#a36a40";
      g.beginPath();
      g.arc(0, 0, 26, 0, Math.PI * 2);
      g.fill();
      g.restore();
      g.strokeStyle = "#3d2214";
      g.lineWidth = 12;
      g.strokeRect(6, 6, w - 12, h - 12);
    },
    false,
  );
}

/** Ikon hotspot: kotak kaca gelap, bingkai neon, glyph dari path SVG 24×24. */
export function hotspotTexture(path: string, color: string) {
  return make(
    `hotspot-${path}-${color}`,
    256,
    300,
    (g, w) => {
      g.clearRect(0, 0, w, 300);
      g.shadowColor = color;
      g.shadowBlur = 24;
      g.fillStyle = "rgba(20,14,36,0.88)";
      roundRect(g, 24, 24, w - 48, w - 48, 44);
      g.fill();
      g.shadowBlur = 0;
      g.lineWidth = 9;
      g.strokeStyle = color;
      g.stroke();
      g.fillStyle = "rgba(20,14,36,0.88)";
      g.beginPath();
      g.moveTo(w / 2 - 26, w - 26);
      g.lineTo(w / 2, w + 18);
      g.lineTo(w / 2 + 26, w - 26);
      g.fill();
      g.beginPath();
      g.moveTo(w / 2 - 26, w - 24);
      g.lineTo(w / 2, w + 18);
      g.lineTo(w / 2 + 26, w - 24);
      g.stroke();
      g.save();
      g.translate(w / 2 - 66, w / 2 - 66);
      g.scale(5.5, 5.5);
      g.lineWidth = 1.6;
      g.lineCap = "round";
      g.lineJoin = "round";
      g.strokeStyle = "#ffffff";
      g.shadowColor = color;
      g.shadowBlur = 6;
      g.stroke(new Path2D(path));
      g.restore();
    },
    false,
  );
}
