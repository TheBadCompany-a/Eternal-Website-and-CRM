import React, { useEffect, useRef } from 'react';

// A realistic night sky, drawn on a canvas: a deep gradient with a faint warm glow at the horizon,
// a Milky Way with a bright core, dust lanes and thousands of faint stars, a few bright stars with
// soft bloom, and a low line of dark hills. A second layer lets some stars twinkle and sends a rare
// shooting star across (both stay still for people who prefer reduced motion).
const seeded = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};
const gauss = (rand: () => number) => (rand() + rand() + rand() + rand() - 2) / 2;
const ANG = -0.38;

interface Twinkler { x: number; y: number; r: number; a: number; speed: number; phase: number; rgb: string }

const along = (W: number, H: number, t: number, off: number) => {
  const x = W * 0.5 + Math.cos(ANG) * t * W * 0.75 - Math.sin(ANG) * off;
  const y = H * 0.46 + Math.sin(ANG) * t * W * 0.75 + Math.cos(ANG) * off;
  return [x, y] as const;
};


// Smooth value noise on a repeating grid, summed over several scales.
function makeNoise(rand: () => number) {
  const N = 256;
  const grid = new Float32Array(N * N);
  for (let i = 0; i < grid.length; i++) grid[i] = rand();
  const at = (x: number, y: number) => grid[(y & (N - 1)) * N + (x & (N - 1))];
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const tx = smooth(x - xi);
    const ty = smooth(y - yi);
    const top = at(xi, yi) * (1 - tx) + at(xi + 1, yi) * tx;
    const bottom = at(xi, yi + 1) * (1 - tx) + at(xi + 1, yi + 1) * tx;
    return top * (1 - ty) + bottom * ty;
  };
  return (x: number, y: number, octaves = 5) => {
    let sum = 0;
    let amp = 0.5;
    let f = 1;
    for (let o = 0; o < octaves; o++) {
      sum += amp * noise(x * f, y * f);
      amp *= 0.5;
      f *= 2.03;
    }
    return sum;
  };
}

function milkyWay(ctx: CanvasRenderingContext2D, W: number, H: number, rand: () => number) {
  const fbm = makeNoise(rand);
  const scale = Math.min(1, 900 / W);
  const lw = Math.max(1, Math.round(W * scale));
  const lh = Math.max(1, Math.round(H * scale));
  const img = ctx.createImageData(lw, lh);
  const cosA = Math.cos(-ANG);
  const sinA = Math.sin(-ANG);
  const cx = W * 0.5;
  const cy = H * 0.46;
  for (let py = 0; py < lh; py++) {
    for (let px = 0; px < lw; px++) {
      const x = px / scale;
      const y = py / scale;
      const dx = x - cx;
      const dy = y - cy;
      const u = dx * cosA - dy * sinA; // along the band
      const v = dx * sinA + dy * cosA; // across the band
      const wob = (fbm(x / (H * 0.55), y / (H * 0.55), 3) - 0.5) * H * 0.16; // the band meanders
      const vv = v + wob;
      const core = Math.exp(-Math.pow(vv / (H * 0.1), 2));
      const halo = Math.exp(-Math.pow(vv / (H * 0.3), 2));
      const bulge = 1 + 0.55 * Math.exp(-Math.pow((u + W * 0.26) / (W * 0.2), 2));
      const cloud = 0.1 + 1.7 * Math.pow(fbm(u / (H * 0.22) + 11, vv / (H * 0.11) + 3, 6), 1.25);
      const dustField = fbm(u / (H * 0.5) + 40, vv / (H * 0.07) + 9, 5);
      const lane = Math.max(0, Math.min(1, (dustField - 0.46) * 4.6)) * Math.min(1, core * 1.6);
      const glow = (core * 0.5 + halo * 0.12) * bulge * cloud * (1 - 0.88 * lane);
      const warm = Math.min(1, Math.max(0, (bulge - 1) * 0.7));
      const r = 128 + 70 * warm;
      const g = 148 + 38 * warm;
      const bl = 198 - 10 * warm;
      const k = (py * lw + px) * 4;
      const strength = Math.min(1, glow * 0.55);
      img.data[k] = r * strength + 4;
      img.data[k + 1] = g * strength + 6;
      img.data[k + 2] = bl * strength + 14;
      img.data[k + 3] = Math.min(255, Math.round(255 * Math.min(1, glow * 1.5 + lane * core * 0.5)));
    }
  }
  const tmp = document.createElement('canvas');
  tmp.width = lw;
  tmp.height = lh;
  tmp.getContext('2d')?.putImageData(img, 0, 0);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(tmp, 0, 0, W, H);
  ctx.restore();
}

function drawSky(canvas: HTMLCanvasElement): Twinkler[] {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  if (!W || !H) return [];
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const rand = seeded(7919);
  const twinklers: Twinkler[] = [];

  // Sky: black-blue overhead, a little lighter and warmer near the horizon.
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#010208');
  sky.addColorStop(0.55, '#040816');
  sky.addColorStop(0.86, '#0a1222');
  sky.addColorStop(1, '#17192a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  const blob = (x: number, y: number, rad: number, rgb: string, alpha: number) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, `rgba(${rgb},${alpha})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  };

  // Milky Way: built pixel by pixel from layered noise, so it has the uneven, cloudy look of a long
  // exposure: a bright core off to one side, thin glowing filaments, and dark dust lanes cutting across.
  milkyWay(ctx, W, H, rand);

  const narrow = H * 0.09;

  // Fine star dust: thousands of tiny dim points, thick inside the band.
  ctx.globalCompositeOperation = 'lighter';
  const dust = (x: number, y: number) => {
    const a = 0.08 + rand() * 0.3;
    ctx.fillStyle = `rgba(${rand() < 0.7 ? '225,232,255' : '255,232,205'},${a})`;
    const s = 0.4 + rand() * 0.6;
    ctx.fillRect(x, y, s, s);
  };
  for (let i = 0; i < 1500; i++) dust(rand() * W, rand() * H);
  for (let i = 0; i < 6500; i++) {
    const [x, y] = along(W, H, rand() * 2 - 1, gauss(rand) * narrow * 1.15);
    if (x > 0 && x < W && y > 0 && y < H) dust(x, y);
  }

  // Visible stars: mostly faint, a few medium, very few bright with a soft bloom.
  const star = (x: number, y: number) => {
    const m = rand();
    const mag = m < 0.9 ? 0 : m < 0.985 ? 1 : 2;
    const tint = rand();
    const rgb = tint < 0.55 ? '238,243,255' : tint < 0.78 ? '255,236,208' : tint < 0.92 ? '188,210,255' : '255,205,176';
    const a = mag === 0 ? 0.3 + rand() * 0.4 : mag === 1 ? 0.7 + rand() * 0.25 : 0.95;
    const r = mag === 0 ? 0.45 + rand() * 0.35 : mag === 1 ? 0.8 + rand() * 0.4 : 1.3 + rand() * 0.5;
    if (mag > 0) blob(x, y, mag === 2 ? 9 : 4, rgb, mag === 2 ? 0.2 : 0.14);
    ctx.fillStyle = `rgba(${rgb},${a})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    if (mag === 2) {
      ctx.strokeStyle = `rgba(${rgb},0.22)`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(x - 11, y); ctx.lineTo(x + 11, y);
      ctx.moveTo(x, y - 11); ctx.lineTo(x, y + 11);
      ctx.stroke();
    }
    if (mag > 0 && twinklers.length < 70) twinklers.push({ x, y, r, a, speed: 0.6 + rand() * 1.4, phase: rand() * 6.28, rgb });
  };
  for (let i = 0; i < 320; i++) star(rand() * W, rand() * H);
  for (let i = 0; i < 380; i++) {
    const [x, y] = along(W, H, rand() * 2 - 1, gauss(rand) * narrow * 1.3);
    if (x > 0 && x < W && y > 0 && y < H) star(x, y);
  }

  // Horizon: a soft glow, then a low, uneven line of dark hills.
  ctx.globalCompositeOperation = 'source-over';
  const glow = ctx.createLinearGradient(0, H * 0.84, 0, H);
  glow.addColorStop(0, 'rgba(120,96,110,0)');
  glow.addColorStop(1, 'rgba(120,96,110,0.18)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, H * 0.84, W, H * 0.16);
  const base = H * 0.955;
  const hills = [0, 0.18, 0.4, 0.62, 0.8, 1].map((p) => ({ x: p * W, y: base - rand() * H * 0.028 }));
  ctx.fillStyle = '#02040a';
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(0, hills[0].y);
  for (let i = 1; i < hills.length; i++) {
    const p = hills[i - 1];
    const q = hills[i];
    ctx.quadraticCurveTo((p.x + q.x) / 2, Math.min(p.y, q.y) - H * 0.012, q.x, q.y);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();

  // Vignette: the corners fall away, like a long exposure through a lens.
  const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.38)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  // Film grain: a faint, even speckle over everything, as in a real long exposure.
  const tile = document.createElement('canvas');
  tile.width = 160;
  tile.height = 160;
  const tctx = tile.getContext('2d');
  if (tctx) {
    const g = tctx.createImageData(160, 160);
    for (let i = 0; i < g.data.length; i += 4) {
      const v = rand() * 255;
      g.data[i] = v; g.data[i + 1] = v; g.data[i + 2] = v; g.data[i + 3] = 11;
    }
    tctx.putImageData(g, 0, 0);
    const pat = ctx.createPattern(tile, 'repeat');
    if (pat) { ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H); }
  }
  return twinklers;
}

export const NightSkyBackdrop: React.FC = () => {
  const skyRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const sky = skyRef.current;
    const live = liveRef.current;
    if (!sky || !live) return;
    let twinklers: Twinkler[] = [];
    let raf = 0;
    let shoot: { x: number; y: number; dx: number; dy: number; born: number } | null = null;
    let nextShoot = performance.now() + 6000 + Math.random() * 8000;
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const setup = () => {
      twinklers = drawSky(sky);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      live.width = sky.clientWidth * dpr;
      live.height = sky.clientHeight * dpr;
    };

    const frame = (now: number) => {
      const ctx = live.getContext('2d');
      if (ctx) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const W = live.width / dpr;
        const H = live.height / dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';
        for (const s of twinklers) {
          const k = 0.55 + 0.45 * Math.sin((now / 1000) * s.speed + s.phase);
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5);
          g.addColorStop(0, `rgba(${s.rgb},${0.55 * s.a * k})`);
          g.addColorStop(1, `rgba(${s.rgb},0)`);
          ctx.fillStyle = g;
          ctx.fillRect(s.x - s.r * 5, s.y - s.r * 5, s.r * 10, s.r * 10);
        }
        if (!shoot && now > nextShoot) {
          const fromLeft = Math.random() < 0.5;
          shoot = { x: (fromLeft ? 0.1 : 0.9) * W, y: (0.05 + Math.random() * 0.3) * H, dx: (fromLeft ? 1 : -1) * W * 0.28, dy: H * 0.14, born: now };
        }
        if (shoot) {
          const t = (now - shoot.born) / 650;
          if (t >= 1) {
            shoot = null;
            nextShoot = now + 9000 + Math.random() * 12000;
          } else {
            const hx = shoot.x + shoot.dx * t;
            const hy = shoot.y + shoot.dy * t;
            const tx = hx - shoot.dx * 0.22;
            const ty = hy - shoot.dy * 0.22;
            const g = ctx.createLinearGradient(tx, ty, hx, hy);
            g.addColorStop(0, 'rgba(255,255,255,0)');
            g.addColorStop(1, `rgba(255,255,255,${0.85 * (1 - t * 0.6)})`);
            ctx.strokeStyle = g;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(hx, hy);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(frame);
    };

    setup();
    if (!still) raf = requestAnimationFrame(frame);
    const ro = new ResizeObserver(setup);
    ro.observe(sky);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <>
      <canvas ref={skyRef} className="pointer-events-none absolute inset-0 w-full h-full" aria-hidden="true" />
      <canvas ref={liveRef} className="pointer-events-none absolute inset-0 w-full h-full" aria-hidden="true" />
    </>
  );
};
