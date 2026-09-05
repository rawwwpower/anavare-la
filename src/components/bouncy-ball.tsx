"use client";

import { useEffect, useRef, useState } from "react";

// Vending-machine bouncy ball: drops from the top the first time the user
// tries to scroll after DWELL_MS on the page. Physics tuned to feel like the
// real late-90s rubber balls: high first bounce, energy loss per hit, squash
// on impact, then a short roll before resting on the bottom edge.
//
// The cursor (or a dragging finger) is an invisible Arkanoid-style paddle,
// but only while a mouse button is actually held down (or a finger is
// actively touching) — a passive hover has no effect at all, so the ball
// just falls unless someone deliberately reaches for it. Catching it under
// the held pointer bounces it back up at an angle based on where it hit and
// how fast the pointer was moving — so it can be kept in the air on
// purpose, not just watched fall.
//
// Pressing down directly ON the ball (not just near it) grabs it instead:
// it rides the pointer exactly, physics paused, until release throws it
// with the pointer's recent velocity — a real toss against the same walls,
// not just a swat.

const DWELL_MS = 4000;
const SIZE = 64;
// Drop a square transparent PNG here (ball filling the canvas, ~512x512) and
// it replaces the CSS-drawn eyeball. Until then the CSS version renders.
const IMAGE_SRC = "/toys/eyeball-v2.png";
const GRAVITY = 3400; // px/s²
const BOUNCE = 0.82;
const WALL_BOUNCE = 0.6;
const ROLL_FRICTION = 320; // px/s²
const SETTLE_SPEED = 55; // px/s
const PADDLE_HALF_WIDTH = 50; // paddle hit zone around the pointer
const PADDLE_HALF_HEIGHT = 14;
const PADDLE_MIN_BOUNCE = 700; // px/s upward, even on a soft/still catch
const PADDLE_COOLDOWN_MS = 90; // guards against re-triggering next substep
const GRAB_RADIUS = 46; // must press the ball itself, not just nearby
const THROW_SCALE = 0.85; // softens a raw cursor flick — still a ball, not a projectile
const THROW_MAX_SPEED = 2000; // px/s cap against a noisy/spiky velocity sample

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

    // The paddle: wherever the mouse currently sits, or wherever a finger is
    // actively dragging. pointerActive tracks whether we know a position at
    // all (touch has no hover, so it only exists mid-drag); pointerHeld
    // gates whether that position actually acts as a paddle — true only
    // while a mouse button is down or a finger is touching, never from a
    // bare hover.
    let pointerX = 0;
    let pointerY = 0;
    let pointerActive = false;
    let pointerHeld = false;
    let pointerVX = 0;
    let pointerVY = 0;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let lastPointerT = 0;
    let paddleCooldownUntil = 0;

    // Grabbing: physics pauses and the ball rides the pointer exactly,
    // preserving wherever on it you first pressed (grabDX/DY) rather than
    // snapping its center to the cursor.
    let grabbed = false;
    let grabDX = 0;
    let grabDY = 0;

    const radius = SIZE / 2;

    // The shelf is the same --shelf-bottom token every fixed-position corner
    // object (poster, note artwork) aligns to — read from CSS instead of
    // measured from the links row, so the ball can never drift from that
    // shared line. Side walls match --page-pad-x (where the "A" and the
    // paragraphs start), and the ceiling matches --page-pad-y (the "A"'s own
    // top) — the ball stays inside that content box instead of roaming into
    // a wide desktop's empty margins or flying off the top of the screen.
    // All refreshed on resize since the tokens step at the sm breakpoint or
    // scale with viewport width.
    let shelfBottomPx = 0;
    let pagePadXPx = 0;
    let pagePadYPx = 0;

    // getComputedStyle on a custom property returns its raw, unresolved
    // text ("calc(5rem + 44px + 18px)") — parseFloat on that is NaN. A
    // probe element with the var applied to a real property resolves it
    // to actual pixels, the same way the poster and note artwork see it.
    const shelfProbe = document.createElement("div");
    shelfProbe.style.cssText =
      "position: fixed; bottom: var(--shelf-bottom); visibility: hidden;";
    document.body.appendChild(shelfProbe);

    const padXProbe = document.createElement("div");
    padXProbe.style.cssText =
      "position: fixed; left: var(--page-pad-x); visibility: hidden;";
    document.body.appendChild(padXProbe);

    const padYProbe = document.createElement("div");
    padYProbe.style.cssText =
      "position: fixed; top: var(--page-pad-y); visibility: hidden;";
    document.body.appendChild(padYProbe);

    function refreshLayout() {
      shelfBottomPx = parseFloat(getComputedStyle(shelfProbe).bottom) || 0;
      pagePadXPx = parseFloat(getComputedStyle(padXProbe).left) || 0;
      pagePadYPx = parseFloat(getComputedStyle(padYProbe).top) || 0;
    }

    function floorAt() {
      const trueFloor = window.innerHeight - SIZE;
      const shelfFloor = window.innerHeight - shelfBottomPx - SIZE;
      return Math.min(trueFloor, shelfFloor);
    }

    function leftWall() {
      return pagePadXPx;
    }

    function rightWall() {
      return window.innerWidth - pagePadXPx - SIZE;
    }

    function ceiling() {
      return pagePadYPx;
    }

    // Arkanoid-style paddle collision: an invisible rectangle around the
    // pointer, live only while pointerHeld — a passive hover must never
    // touch the ball. Beyond that, only fires while the ball is actually
    // falling onto it or the pointer is swatting at speed — holding still
    // near a settled ball shouldn't launch it by accident. A short cooldown
    // stops the same contact from re-triggering across consecutive
    // sub-steps.
    function checkPaddleHit() {
      if (!launched || !pointerActive || !pointerHeld) return;
      if (performance.now() < paddleCooldownUntil) return;

      const dx = x + radius - pointerX;
      const dy = y + radius - pointerY;
      if (Math.abs(dx) > PADDLE_HALF_WIDTH + radius) return;
      if (Math.abs(dy) > PADDLE_HALF_HEIGHT + radius) return;

      const pointerSpeed = Math.hypot(pointerVX, pointerVY);
      if (vy <= 40 && pointerSpeed <= 250) return;

      const offset = Math.max(-1, Math.min(1, dx / PADDLE_HALF_WIDTH));
      vx = offset * 480 + pointerVX * 0.25;
      vy = -Math.max(
        PADDLE_MIN_BOUNCE,
        Math.abs(vy) * 0.95 + Math.max(0, -pointerVY) * 0.4,
      );
      y = pointerY - PADDLE_HALF_HEIGHT - radius - 2;
      resting = false;
      squash = Math.min(1, Math.abs(vy) / 1500);
      paddleCooldownUntil = performance.now() + PADDLE_COOLDOWN_MS;
      startLoop();
    }

    function render() {
      const floor = floorAt();
      ball!.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      squashEl!.style.transform = `scale(${1 + 0.22 * squash}, ${1 - 0.3 * squash})`;
      spinEl!.style.transform = `rotate(${rotDeg}deg)`;

      const proximity = Math.max(0, Math.min(1, 1 - (floor - y) / 300));
      shadowEl!.style.opacity = `${proximity * 0.5}`;
      shadowEl!.style.transform = `translate3d(${x + SIZE / 2}px, ${floor + SIZE - 7}px, 0) translateX(-50%) scaleX(${0.6 + 0.4 * proximity})`;
    }

    function simulate(dt: number) {
      // While grabbed, position comes straight from the pointer (see
      // onPointerMove) — no gravity, no walls, no paddle. Rotation and
      // squash just settle back to neutral so it doesn't look frozen mid-air.
      if (grabbed) {
        squash = Math.max(0, squash - squash * 14 * dt);
        return;
      }

      const left = leftWall();
      const right = rightWall();

      checkPaddleHit();

      if (!resting) {
        vy += GRAVITY * dt;
        x += vx * dt;
        y += vy * dt;

        if (x < left) {
          x = left;
          vx = -vx * WALL_BOUNCE;
        } else if (x > right) {
          x = right;
          vx = -vx * WALL_BOUNCE;
        }

        const top = ceiling();
        if (y < top && vy < 0) {
          y = top;
          vy = -vy * WALL_BOUNCE;
        }

        const floor = floorAt();
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
        x = Math.min(Math.max(x + vx * dt, left), right);
        if (x === left || x === right) vx = 0;
        y = floorAt();
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

    function launch() {
      if (launched) return;
      launched = true;
      refreshLayout();

      const left = leftWall();
      const right = rightWall();
      const margin = (right - left) * 0.15;
      x = left + margin + Math.random() * (right - left - margin * 2);
      y = -SIZE * 2;
      vx = (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 120);
      vy = 0;
      rotDeg = Math.random() * 360;

      ball!.style.opacity = "1";
      ball!.style.pointerEvents = "auto";
      ball!.style.cursor = "pointer";
      startLoop();
      removeListeners();

      // Scroll was only ever a way to say "wake up" pre-launch. Once the
      // eye exists, a touch-drag aimed at the paddle would otherwise also
      // scroll the page underneath it, fighting the very gesture meant to
      // catch the ball.
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    }

    function onIntent() {
      if (armed) launch();
    }

    // Tracks the paddle for checkPaddleHit(). Kept alive for the component's
    // whole lifetime (unlike the pre-launch intent listeners below), since
    // the paddle only matters once the ball actually exists to hit.
    function onPointerMove(e: PointerEvent) {
      const t = performance.now();
      const dt = (t - lastPointerT) / 1000;
      if (dt > 0 && dt < 0.1) {
        pointerVX = (e.clientX - lastPointerX) / dt;
        pointerVY = (e.clientY - lastPointerY) / dt;
      }
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      lastPointerT = t;
      pointerX = e.clientX;
      pointerY = e.clientY;
      pointerActive = true;
      // Defensive resync for mouse: e.buttons reflects the actual button
      // state on every move, in case a mouseup was missed (e.g. released
      // outside the window).
      if (e.pointerType === "mouse") pointerHeld = e.buttons > 0;

      if (grabbed) {
        x = e.clientX - grabDX;
        y = e.clientY - grabDY;
        startLoop();
        return;
      }
      checkPaddleHit();
    }

    // Pressing squarely on the ball grabs it instead of paddling it — an
    // explicit, deliberate contact, not just landing inside the wider swat
    // zone. Anywhere else, it's the existing paddle-hold behavior.
    function onPointerDown(e: PointerEvent) {
      pointerX = e.clientX;
      pointerY = e.clientY;
      pointerActive = true;
      pointerHeld = true;

      const dist = Math.hypot(
        e.clientX - (x + radius),
        e.clientY - (y + radius),
      );
      if (launched && dist <= GRAB_RADIUS) {
        grabbed = true;
        grabDX = e.clientX - x;
        grabDY = e.clientY - y;
        vx = 0;
        vy = 0;
        resting = false;
        ball!.style.cursor = "grabbing";
        startLoop();
        return;
      }
      checkPaddleHit();
    }

    // Touch has no hover: the paddle should vanish the instant the finger
    // lifts, not linger at its last position. Mouse never fires this for
    // merely leaving the window, so its last hovered position stays known —
    // it just stops being "held".
    function onPointerGone(e: PointerEvent) {
      pointerHeld = false;
      if (e.pointerType !== "mouse") pointerActive = false;

      if (grabbed) {
        grabbed = false;
        const speed = Math.hypot(pointerVX, pointerVY);
        const scale =
          speed > 0 ? Math.min(speed, THROW_MAX_SPEED) / speed : 0;
        vx = pointerVX * scale * THROW_SCALE;
        vy = pointerVY * scale * THROW_SCALE;
        squash = Math.min(1, speed / 2000);
        ball!.style.cursor = "pointer";
        startLoop();
      }
    }

    // --page-pad-y (and so --shelf-bottom) steps at the sm breakpoint, and
    // window.innerHeight shifts as iOS Safari collapses its bars on scroll.
    // Recompute and wake the ball so it re-settles at the shelf's real height.
    function onViewportChange() {
      refreshLayout();
      if (launched && !running) {
        resting = false;
        startLoop();
      }
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

    refreshLayout();
    window.addEventListener("wheel", onIntent, { passive: true });
    window.addEventListener("touchmove", onIntent, { passive: true });
    window.addEventListener("scroll", onIntent, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, { passive: true });
    window.visualViewport?.addEventListener("resize", onViewportChange);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerGone);
    window.addEventListener("pointercancel", onPointerGone);

    return () => {
      clearTimeout(armTimer);
      cancelAnimationFrame(rafId);
      removeListeners();
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange);
      window.visualViewport?.removeEventListener("resize", onViewportChange);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerGone);
      window.removeEventListener("pointercancel", onPointerGone);
      shelfProbe.remove();
      padXProbe.remove();
      padYProbe.remove();
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
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
            "radial-gradient(ellipse, rgba(205,235,165,0.2), transparent 60%)",
          filter: "blur(7px)",
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
                    "drop-shadow(0 -9px 16px rgba(210,240,180,0.3)) drop-shadow(0 -6px 32px rgba(195,230,155,0.1))",
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
