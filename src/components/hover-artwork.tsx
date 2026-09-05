"use client";

import { useEffect, useRef, useState } from "react";
import { preload } from "react-dom";

// A piece anchored bottom-right (same corner and gutter as the home page's
// poster, at 2x its size). With hoverSrc, it swaps for a second image on
// hover — e.g. a clean painting that reveals its title/credit, blurred, once
// you look closer (touch has no real hover, so a press does the same job
// there). Without hoverSrc, it's just the still image: same spot, same
// arrival, no interactivity.
type HoverArtworkProps = {
  defaultSrc: string;
  hoverSrc?: string;
  // Intrinsic pixel size. Required, not decorative: it lets the browser
  // reserve the box from the aspect ratio alone, so on mobile — where the
  // piece sits in normal flow — the text above it never gets shoved when the
  // image finally decodes.
  width: number;
  height: number;
  alt?: string;
};

// A crossfade between two different images reads as two objects swapping,
// not one thing transforming. A shared blur peak mid-transition bridges
// them into what looks like a single continuous change.
const PRESSED_CLEAN_STYLE = { opacity: 0, filter: "blur(3px)" };
const PRESSED_HOVER_STYLE = { opacity: 1, filter: "blur(0px)" };

export function HoverArtwork({
  defaultSrc,
  hoverSrc,
  width,
  height,
  alt = "",
}: HoverArtworkProps) {
  // The artwork is the whole point of a note, so it starts downloading with
  // the document instead of waiting for React to hydrate and mount an <img>.
  preload(defaultSrc, { as: "image", fetchPriority: "high" });

  // Holds the piece back until the image is actually decoded, so it resolves
  // into place instead of popping in mid-download.
  const [loaded, setLoaded] = useState(false);
  const defaultImgRef = useRef<HTMLImageElement>(null);

  // The hover image is only fetched once something actually reveals it —
  // most visits never trigger it.
  const [everHovered, setEverHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  // A cached image can already be .complete by the time this effect runs,
  // in which case the load event fired before React attached the handler.
  useEffect(() => {
    if (defaultImgRef.current?.complete) setLoaded(true);
  }, []);

  function onTouchDown(e: React.PointerEvent) {
    if (e.pointerType === "mouse") return;
    setEverHovered(true);
    setPressed(true);
  }
  function onTouchUp(e: React.PointerEvent) {
    if (e.pointerType === "mouse") return;
    setPressed(false);
  }

  return (
    <div
      // right/bottom only apply at sm+, paired with sm:fixed — position:
      // relative (needed on mobile so the absolute hover image has a
      // containing block) honors offsets too, so leaving them as an
      // always-on inline style shifted the whole box on mobile instead of
      // leaving it in normal flow.
      className="group relative mt-10 sm:fixed sm:right-[var(--page-pad-x)] sm:bottom-[var(--shelf-bottom)] sm:mt-0 z-40 transition-[opacity,filter,transform] duration-[600ms] ease-out motion-reduce:transition-opacity motion-reduce:duration-200"
      style={{
        width: "clamp(176px, 28vw, 320px)",
        aspectRatio: `${width} / ${height}`,
        opacity: loaded ? 1 : 0,
        // Resolving out of a blur reads as the image developing rather than
        // switching on — the right register for a scanned poster or a
        // painting. Transform and filter only, and only for the ~600ms it
        // takes to arrive; nothing here animates again afterwards.
        filter: loaded ? "blur(0px)" : "blur(6px)",
        transform: loaded ? "scale(1)" : "scale(0.985)",
      }}
      onPointerEnter={hoverSrc ? () => setEverHovered(true) : undefined}
      onPointerDown={hoverSrc ? onTouchDown : undefined}
      onPointerUp={hoverSrc ? onTouchUp : undefined}
      onPointerCancel={hoverSrc ? onTouchUp : undefined}
      onPointerLeave={hoverSrc ? onTouchUp : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={defaultImgRef}
        src={defaultSrc}
        alt={alt}
        width={width}
        height={height}
        draggable={false}
        decoding="async"
        fetchPriority="high"
        onLoad={() => setLoaded(true)}
        className={
          hoverSrc
            ? "w-full select-none transition-[opacity,filter] duration-1000 ease-in-out group-hover:opacity-0 group-hover:blur-[3px]"
            : "w-full select-none"
        }
        style={pressed ? PRESSED_CLEAN_STYLE : undefined}
      />
      {hoverSrc && everHovered && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hoverSrc}
          alt=""
          aria-hidden
          width={width}
          height={height}
          draggable={false}
          decoding="async"
          className="absolute inset-0 w-full select-none opacity-0 blur-[2px] transition-[opacity,filter] duration-1000 ease-in-out group-hover:opacity-100 group-hover:blur-none"
          style={pressed ? PRESSED_HOVER_STYLE : undefined}
        />
      )}
    </div>
  );
}
