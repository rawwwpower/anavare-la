"use client";

import { useEffect, useRef } from "react";

// Vending-machine bouncy ball: drops from the top the first time the user
// tries to scroll after DWELL_MS on the page. Physics tuned to feel like the
// real late-90s rubber balls: high first bounce, energy loss per hit, squash
// on impact, then a short roll before resting on the bottom edge.

const DWELL_MS = 4000;
const SIZE = 64;
const GRAVITY = 2600; // px/s²
const BOUNCE = 0.74;
const WALL_BOUNCE = 0.6;
const ROLL_FRICTION = 320; // px/s²
const SETTLE_SPEED = 90; // px/s

export function BouncyBall() {
  const ballRef = useRef<HTMLDivElement>(null);
  const squashRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ball = ballRef.current;
    const squashEl = squashRef.current;
    const spinEl = spinRef.current;
    const shadowEl = shadowRef.current;
    if (!ball || !squashEl || !spinEl || !shadowEl) return;

    let armed = false;
    let launched = false;
    let rafId = 0;

    const armTimer = setTimeout(() => {
      armed = true;
    }, DWELL_MS);

    let x = 0;
    let y = -SIZE * 2;
    let vx = 0;
    let vy = 0;
    let rotDeg = 0;
    let squash = 0;
    let resting = false;
    let last = 0;

    const radius = SIZE / 2;

    function render() {
      const floor = window.innerHeight - SIZE;
      ball!.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      squashEl!.style.transform = `scale(${1 + 0.22 * squash}, ${1 - 0.3 * squash})`;
      spinEl!.style.transform = `rotate(${rotDeg}deg)`;

      const proximity = Math.max(0, Math.min(1, 1 - (floor - y) / 300));
      shadowEl!.style.opacity = `${proximity * 0.5}`;
      shadowEl!.style.transform = `translate3d(${x + SIZE / 2}px, ${window.innerHeight - 7}px, 0) translateX(-50%) scaleX(${0.6 + 0.4 * proximity})`;
    }

    function simulate(dt: number) {
      const floor = window.innerHeight - SIZE;
      const rightWall = window.innerWidth - SIZE;

      if (!resting) {
        vy += GRAVITY * dt;
        x += vx * dt;
        y += vy * dt;

        if (x < 0) {
          x = 0;
          vx = -vx * WALL_BOUNCE;
        } else if (x > rightWall) {
          x = rightWall;
          vx = -vx * WALL_BOUNCE;
        }

        if (y >= floor && vy > 0) {
          y = floor;
          squash = Math.min(1, Math.abs(vy) / 1500);
          vy = -vy * BOUNCE;
          vx *= 0.985;
          if (Math.abs(vy) < SETTLE_SPEED) {
            vy = 0;
            resting = true;
          }
        }
      } else {
        const decel = ROLL_FRICTION * dt;
        vx = Math.abs(vx) <= decel ? 0 : vx - Math.sign(vx) * decel;
        x += vx * dt;
        y = floor;
        if (x < 0) {
          x = 0;
          vx = 0;
        } else if (x > rightWall) {
          x = rightWall;
          vx = 0;
        }
      }

      const omega = vx / radius;
      rotDeg += omega * (180 / Math.PI) * dt;
      squash = Math.max(0, squash - squash * 14 * dt);
    }

    // Fixed-timestep sub-stepping: physics advance in real time even when the
    // browser delivers few frames, without tunneling through the floor.
    function step(t: number) {
      let frameDt = Math.min((t - last) / 1000, 0.12);
      last = t;
      while (frameDt > 0) {
        const h = Math.min(frameDt, 1 / 120);
        simulate(h);
        frameDt -= h;
      }

      render();

      if (resting && vx === 0 && squash < 0.01) return;
      rafId = requestAnimationFrame(step);
    }

    function launch() {
      if (launched) return;
      launched = true;

      const margin = window.innerWidth * 0.15;
      x = margin + Math.random() * (window.innerWidth - margin * 2 - SIZE);
      y = -SIZE * 2;
      vx = (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 120);
      vy = 0;
      rotDeg = Math.random() * 360;

      ball!.style.opacity = "1";
      last = performance.now();
      rafId = requestAnimationFrame(step);
      removeListeners();
    }

    function onIntent() {
      if (armed) launch();
    }
    function onKey(e: KeyboardEvent) {
      if (["ArrowDown", "ArrowUp", "PageDown", "Space", " "].includes(e.key)) {
        onIntent();
      }
    }

    function removeListeners() {
      window.removeEventListener("wheel", onIntent);
      window.removeEventListener("touchmove", onIntent);
      window.removeEventListener("scroll", onIntent);
      window.removeEventListener("keydown", onKey);
    }

    window.addEventListener("wheel", onIntent, { passive: true });
    window.addEventListener("touchmove", onIntent, { passive: true });
    window.addEventListener("scroll", onIntent, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(armTimer);
      cancelAnimationFrame(rafId);
      removeListeners();
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50">
      <div
        ref={shadowRef}
        className="absolute left-0 top-0 h-2.5 rounded-full opacity-0"
        style={{
          width: SIZE * 0.9,
          background:
            "radial-gradient(ellipse, rgba(0,0,0,0.35), transparent 70%)",
          filter: "blur(3px)",
        }}
      />
      <div
        ref={ballRef}
        className="absolute left-0 top-0 opacity-0"
        style={{ width: SIZE, height: SIZE, willChange: "transform" }}
      >
        <div
          ref={squashRef}
          className="h-full w-full overflow-hidden rounded-full"
          style={{
            transformOrigin: "50% 100%",
            background:
              "radial-gradient(circle at 35% 30%, #ffd9e8 0%, #ff9ec4 35%, #f0559b 65%, #b81f74 88%, #7d1050 100%)",
          }}
        >
          {/* Material layer: iris + tint spots tumble with the ball's spin */}
          <div ref={spinRef} className="absolute inset-0">
            <div
              className="absolute rounded-full"
              style={{
                width: SIZE * 0.42,
                height: SIZE * 0.42,
                left: "50%",
                top: "18%",
                background:
                  "radial-gradient(circle at 42% 40%, #1f1006 0%, #1f1006 30%, #6b3c14 42%, #a06018 58%, #7a4210 74%, #5c300c 84%, rgba(92,48,12,0) 92%)",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: SIZE * 0.36,
                height: SIZE * 0.36,
                left: "8%",
                top: "48%",
                background:
                  "radial-gradient(circle, rgba(45,190,165,0.5) 0%, rgba(45,190,165,0.18) 55%, transparent 75%)",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: SIZE * 0.3,
                height: SIZE * 0.3,
                left: "22%",
                top: "-4%",
                background:
                  "radial-gradient(circle, rgba(150,235,90,0.45) 0%, transparent 70%)",
              }}
            />
          </div>
          {/* Gloss layer: highlights track the light, so they don't spin */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(ellipse 32% 22% at 30% 20%, rgba(255,255,255,0.95), rgba(255,255,255,0) 100%), radial-gradient(ellipse 45% 30% at 68% 94%, rgba(255,175,220,0.5), transparent 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
