"use client";

import { useEffect, useRef, useState } from "react";

// Vending-machine bouncy ball: drops from the top the first time the user
// tries to scroll after DWELL_MS on the page. Physics tuned to feel like the
// real late-90s rubber balls: high first bounce, energy loss per hit, squash
// on impact, then a short roll before resting on the bottom edge.

const DWELL_MS = 4000;
const SIZE = 64;
// Drop a square transparent PNG here (ball filling the canvas, ~512x512) and
// it replaces the CSS-drawn eyeball. Until then the CSS version renders.
const IMAGE_SRC = "/toys/eyeball.png";
const GRAVITY = 2600; // px/s²
const BOUNCE = 0.74;
const WALL_BOUNCE = 0.6;
const ROLL_FRICTION = 320; // px/s²
const SETTLE_SPEED = 90; // px/s
const STEP_PAD_X = 16; // clearance around the links column, so the ball
const STEP_PAD_Y = 18; // never overlaps a link even at the closest approach

export function BouncyBall() {
  const ballRef = useRef<HTMLDivElement>(null);
  const squashRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const [hasImage, setHasImage] = useState(true);

  // Probe the asset after mount: a broken <img> can error before React
  // hydrates, in which case its onError never fires.
  useEffect(() => {
    const probe = new window.Image();
    probe.onerror = () => setHasImage(false);
    probe.src = IMAGE_SRC;
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ball = ballRef.current;
    const squashEl = squashRef.current;
    const spinEl = spinRef.current;
    const shadowEl = shadowRef.current;
    if (!ball || !squashEl || !spinEl || !shadowEl) return;

    let armed = false;
    let launched = false;
    let running = false;
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

    // The links row acts as one raised step: the whole row's bounding box
    // (padded) becomes a single continuous shelf — an imaginary line drawn
    // across the links — so the ball rests on top of the row and never lands
    // between or on top of a link. Using the row box (not each link) keeps it
    // one flat line instead of the staircase the old vertical stack produced.
    // Refreshed on launch/dribble/resize rather than every frame.
    let stepZone: { left: number; right: number; top: number } | null = null;

    function refreshStepZone() {
      const list = document.querySelector(
        'nav[aria-label="Social links"] ul',
      );
      const rect = list?.getBoundingClientRect();
      if (!rect || !rect.width) {
        stepZone = null;
        return;
      }
      stepZone = {
        left: rect.left - STEP_PAD_X,
        right: rect.right + STEP_PAD_X,
        top: rect.top - STEP_PAD_Y,
      };
    }

    function floorAt(xPos: number) {
      const trueFloor = window.innerHeight - SIZE;
      if (
        stepZone &&
        xPos + SIZE > stepZone.left &&
        xPos < stepZone.right
      ) {
        return Math.min(trueFloor, stepZone.top - SIZE);
      }
      return trueFloor;
    }

    function render() {
      const floor = floorAt(x);
      ball!.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      squashEl!.style.transform = `scale(${1 + 0.22 * squash}, ${1 - 0.3 * squash})`;
      spinEl!.style.transform = `rotate(${rotDeg}deg)`;

      const proximity = Math.max(0, Math.min(1, 1 - (floor - y) / 300));
      shadowEl!.style.opacity = `${proximity * 0.5}`;
      shadowEl!.style.transform = `translate3d(${x + SIZE / 2}px, ${floor + SIZE - 7}px, 0) translateX(-50%) scaleX(${0.6 + 0.4 * proximity})`;
    }

    function simulate(dt: number) {
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

        const floor = floorAt(x);
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
        const newX = Math.min(Math.max(x + vx * dt, 0), rightWall);
        if (newX === 0 || newX === rightWall) vx = 0;

        const oldFloor = floorAt(x);
        const newFloor = floorAt(newX);
        x = newX;

        if (newFloor < oldFloor - 1) {
          // Rolled up against a step (a link's protected zone): hop onto it.
          resting = false;
          y = newFloor;
          vy = -420;
        } else if (newFloor > oldFloor + 1) {
          // Rolled off the edge of a step: fall to the lower floor.
          resting = false;
          vy = 0;
        } else {
          y = newFloor;
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

      if (resting && vx === 0 && squash < 0.01) {
        running = false;
        return;
      }
      rafId = requestAnimationFrame(step);
    }

    function startLoop() {
      if (running) return;
      running = true;
      last = performance.now();
      rafId = requestAnimationFrame(step);
    }

    // Tap the ball for a short basketball-style dribble off the floor:
    // much smaller impulse than the initial drop, so it pops up briefly
    // and settles again after a couple of bounces.
    function dribble() {
      if (!launched) return;
      refreshStepZone();
      resting = false;
      squash = Math.max(squash, 0.35);
      vy = -(700 + Math.random() * 250);
      vx += (Math.random() - 0.5) * 120;
      startLoop();
    }

    function launch() {
      if (launched) return;
      launched = true;
      refreshStepZone();

      const margin = window.innerWidth * 0.15;
      x = margin + Math.random() * (window.innerWidth - margin * 2 - SIZE);
      y = -SIZE * 2;
      vx = (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 120);
      vy = 0;
      rotDeg = Math.random() * 360;

      ball!.style.opacity = "1";
      ball!.style.pointerEvents = "auto";
      ball!.style.cursor = "pointer";
      startLoop();
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
    window.addEventListener("resize", refreshStepZone);
    ball.addEventListener("pointerdown", dribble);

    return () => {
      clearTimeout(armTimer);
      cancelAnimationFrame(rafId);
      removeListeners();
      window.removeEventListener("resize", refreshStepZone);
      ball.removeEventListener("pointerdown", dribble);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50">
      <div
        ref={shadowRef}
        className="absolute left-0 top-0 h-2.5 rounded-full opacity-0"
        style={{
          width: SIZE * 1.1,
          background:
            "radial-gradient(ellipse, rgba(190,235,140,0.4), transparent 70%)",
          filter: "blur(4px)",
        }}
      />
      <div
        ref={ballRef}
        className="absolute left-0 top-0 opacity-0"
        style={{ width: SIZE, height: SIZE, willChange: "transform" }}
      >
        <div
          ref={squashRef}
          className="h-full w-full rounded-full"
          style={{
            transformOrigin: "50% 100%",
            ...(hasImage
              ? {}
              : {
                  overflow: "hidden",
                  background:
                    "radial-gradient(circle at 35% 30%, #ffffff 0%, #f7f8f0 38%, #e6ead6 62%, #c6cfa9 84%, #99a37c 100%)",
                  boxShadow:
                    "0 0 26px 5px rgba(190,235,130,0.4), 0 0 60px 14px rgba(160,220,110,0.16), inset -6px -8px 14px rgba(120,140,80,0.25)",
                }),
          }}
        >
          {/* Material layer: everything here tumbles with the ball's spin */}
          <div ref={spinRef} className="absolute inset-0">
            {hasImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={IMAGE_SRC}
                alt=""
                draggable={false}
                className="h-full w-full select-none"
                style={{
                  filter:
                    "drop-shadow(0 0 10px rgba(190,235,130,0.5)) drop-shadow(0 0 26px rgba(160,220,110,0.25))",
                }}
                onError={() => setHasImage(false)}
              />
            ) : (
              <>
                <svg
                  viewBox="0 0 64 64"
                  className="absolute inset-0 h-full w-full"
                  fill="none"
                  strokeLinecap="round"
                >
                  <path
                    d="M2 30 C 10 27, 17 29, 24 33"
                    stroke="#b03a30"
                    strokeWidth="0.9"
                    opacity="0.55"
                  />
                  <path
                    d="M4 42 C 12 39, 19 39, 26 37"
                    stroke="#c04a3a"
                    strokeWidth="0.7"
                    opacity="0.4"
                  />
                  <path
                    d="M9 18 C 15 21, 20 25, 25 29"
                    stroke="#b03a30"
                    strokeWidth="0.7"
                    opacity="0.45"
                  />
                  <path
                    d="M62 40 C 54 37, 48 38, 43 40"
                    stroke="#b03a30"
                    strokeWidth="0.9"
                    opacity="0.5"
                  />
                  <path
                    d="M60 52 C 53 48, 48 46, 44 44"
                    stroke="#c04a3a"
                    strokeWidth="0.7"
                    opacity="0.38"
                  />
                  <path
                    d="M30 62 C 30 56, 31 51, 32 47"
                    stroke="#b03a30"
                    strokeWidth="0.8"
                    opacity="0.42"
                  />
                  <path
                    d="M14 52 C 19 48, 23 45, 27 42"
                    stroke="#c04a3a"
                    strokeWidth="0.6"
                    opacity="0.35"
                  />
                </svg>
                {/* Iris: dark limbal ring, amber body, black pupil */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: SIZE * 0.47,
                    height: SIZE * 0.47,
                    left: "44%",
                    top: "16%",
                    background:
                      "radial-gradient(circle at 46% 44%, #000000 0% 32%, #4a2c0a 38%, #8a5a16 50%, #a8701e 60%, #7a4a10 72%, #3d2606 84%, #17110a 93%, rgba(10,8,4,0) 97%)",
                  }}
                >
                  <div
                    className="absolute rounded-full bg-white"
                    style={{
                      width: SIZE * 0.07,
                      height: SIZE * 0.07,
                      left: "34%",
                      top: "28%",
                      opacity: 0.95,
                    }}
                  />
                </div>
              </>
            )}
          </div>
          {/* Gloss layer: highlights track the light, so they don't spin */}
          {!hasImage && (
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(ellipse 30% 20% at 30% 18%, rgba(255,255,255,0.9), rgba(255,255,255,0) 100%), radial-gradient(ellipse 50% 32% at 66% 96%, rgba(205,245,150,0.35), transparent 100%)",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
