"use client";

import { useEffect, useRef } from "react";

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
const IMAGE_SRC = "/toys/eyeball-v2.webp";
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
// A pointer that has been parked for longer than this is standing still, no
// matter what the last sample said. Without it, holding the ball for a
// second and then just letting go throws it with whatever velocity the
// gesture happened to end on — the ball leaps out of a hand that never moved.
const VELOCITY_STALE_MS = 90;

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

    // Any sample older than VELOCITY_STALE_MS describes a gesture that has
    // already stopped, so it must not be read as speed.
    function pointerSpeedNow() {
      if (performance.now() - lastPointerT > VELOCITY_STALE_MS) return 0;
      return Math.hypot(pointerVX, pointerVY);
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

      const speed = pointerSpeedNow();
      if (vy <= 40 && speed <= 250) return;

      const swatVX = speed > 0 ? pointerVX : 0;
      const swatVY = speed > 0 ? pointerVY : 0;
      const offset = Math.max(-1, Math.min(1, dx / PADDLE_HALF_WIDTH));
      vx = offset * 480 + swatVX * 0.25;
      vy = -Math.max(
        PADDLE_MIN_BOUNCE,
        Math.abs(vy) * 0.95 + Math.max(0, -swatVY) * 0.4,
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
      // onPointerMove) — no gravity, no paddle. Rotation and squash just
      // settle back to neutral so it doesn't look frozen mid-air.
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

      if (!grabbed && resting && vx === 0 && squash < 0.01) {
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
      ball!.style.cursor = "grab";
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
      // state on every move, so a mouseup the window never saw (released
      // outside the viewport, or swallowed by a devtools/alert focus change)
      // still ends the hold — otherwise a grabbed ball stays welded to the
      // cursor forever, which is exactly how it used to break.
      if (e.pointerType === "mouse" && e.buttons === 0 && pointerHeld) {
        release();
        return;
      }

      if (grabbed) {
        moveGrabbed(e.clientX, e.clientY);
        startLoop();
        return;
      }
      checkPaddleHit();
    }

    // Even while held, the ball belongs inside the same content column it
    // bounces in — dragging it into the margin and letting go shouldn't
    // teleport it back across the page.
    function moveGrabbed(clientX: number, clientY: number) {
      x = Math.min(Math.max(clientX - grabDX, leftWall()), rightWall());
      y = Math.min(Math.max(clientY - grabDY, ceiling()), floorAt());
    }

    // Pressing squarely on the ball grabs it instead of paddling it — an
    // explicit, deliberate contact, not just landing inside the wider swat
    // zone. Anywhere else, it's the existing paddle-hold behavior.
    function onPointerDown(e: PointerEvent) {
      pointerX = e.clientX;
      pointerY = e.clientY;
      pointerActive = true;
      pointerHeld = true;

      // A new gesture starts from a standstill. Without this reset the first
      // sample of the next press is measured against wherever the *previous*
      // gesture ended, so a grab-and-release with no movement inherits the
      // speed of the throw before it.
      pointerVX = 0;
      pointerVY = 0;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      lastPointerT = performance.now();

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
        // A press-and-drag across body copy otherwise paints a text
        // selection under the ball for the whole throw.
        document.body.style.userSelect = "none";
        window.getSelection()?.removeAllRanges();
        startLoop();
        return;
      }
      checkPaddleHit();
    }

    // Touch has no hover: the paddle should vanish the instant the finger
    // lifts, not linger at its last position. Mouse never fires pointerup
    // for merely leaving the window, so its last hovered position stays
    // known — it just stops being "held".
    function onPointerGone(e: PointerEvent) {
      release(e.pointerType !== "mouse");
    }

    function release(clearPosition = false) {
      pointerHeld = false;
      if (clearPosition) pointerActive = false;
      document.body.style.userSelect = "";

      if (!grabbed) return;
      grabbed = false;

      const speed = pointerSpeedNow();
      const scale = speed > 0 ? Math.min(speed, THROW_MAX_SPEED) / speed : 0;
      vx = pointerVX * scale * THROW_SCALE;
      vy = pointerVY * scale * THROW_SCALE;
      squash = Math.min(1, speed / 2000);
      ball!.style.cursor = "grab";
      startLoop();
    }

    // --page-pad-y (and so --shelf-bottom) steps at the sm breakpoint, and
    // window.innerHeight shifts as iOS Safari collapses its bars on scroll.
    // Recompute and wake the ball so it re-settles at the shelf's real
    // height — but coalesced into one rAF, because each refresh forces three
    // style resolutions and iOS fires these in bursts.
    let layoutQueued = false;
    function onViewportChange() {
      if (layoutQueued) return;
      layoutQueued = true;
      requestAnimationFrame(() => {
        layoutQueued = false;
        refreshLayout();
        if (launched && !running) {
          resting = false;
          startLoop();
        }
      });
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

    function onWindowBlur() {
      release(true);
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
    window.addEventListener("blur", onWindowBlur);

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
      window.removeEventListener("blur", onWindowBlur);
      shelfProbe.remove();
      padXProbe.remove();
      padYProbe.remove();
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.body.style.userSelect = "";
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
          willChange: "transform, opacity",
        }}
      />
      <div
        ref={ballRef}
        className="absolute left-0 top-0 opacity-0"
        style={{
          width: SIZE,
          height: SIZE,
          willChange: "transform",
          touchAction: "none",
        }}
      >
        <div
          ref={squashRef}
          className="h-full w-full rounded-full"
          style={{ transformOrigin: "50% 100%" }}
        >
          {/* Material layer: everything here tumbles with the ball's spin */}
          <div ref={spinRef} className="absolute inset-0">
            {/* The halo stays a drop-shadow on the image itself. Two other
                versions were tried and both looked worse: a radial-gradient
                behind the ball bands and rings the whole eye instead of
                fading out under it, and a second motionless copy carrying
                the shadow shows through, because the artwork has
                semi-transparent areas. Only the filter follows the eye's own
                alpha with a real gaussian falloff. It is redrawn as the ball
                rotates — at 64px that is a cheap layer, and cheaper than the
                glow being wrong. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={IMAGE_SRC}
              alt=""
              width={SIZE}
              height={SIZE}
              draggable={false}
              decoding="async"
              // It cannot appear for at least four seconds, so it must never
              // compete with the fonts and copy that make up the first paint.
              fetchPriority="low"
              className="h-full w-full select-none"
              style={{
                filter:
                  "drop-shadow(0 -9px 16px rgba(210,240,180,0.3)) drop-shadow(0 -6px 32px rgba(195,230,155,0.1))",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
