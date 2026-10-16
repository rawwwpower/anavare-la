"use client";

import { useEffect, useRef, useState } from "react";

// How every image on the site arrives: held back until it is decoded, then
// resolved out of a light blur with a hair of scale — the image developing
// rather than switching on, the right register for a scanned poster, a
// painting or a record sleeve. One definition, so wherever an image has to
// wait for the network it waits, and lands, the same way; nothing animates
// again afterwards.
//
// 240ms on the site's strong ease-out: under the 300ms a piece of interface
// should take, so it reads as quick, and long enough to read as a
// development rather than a cut (Ana, October 2026: "fast as hell, without
// losing subtlety"). An image that is already decoded when it mounts — a
// second visit, a preloaded cover — skips it entirely: there was no wait, so
// there is nothing to animate. Reduced motion keeps a short fade only.
export const ARRIVAL_CLASS =
  "transition-[opacity,filter,transform] duration-[240ms] ease-out motion-reduce:transition-opacity motion-reduce:duration-150";

export const arrivalStyle = (loaded: boolean, instant = false) => ({
  opacity: loaded ? 1 : 0,
  filter: loaded ? "blur(0px)" : "blur(4px)",
  transform: loaded ? "scale(1)" : "scale(0.985)",
  ...(instant ? { transition: "none" } : null),
});

// Tracks whether an <img> has decoded. A cached image can already be
// `complete` by the time the effect runs, in which case its load event fired
// before React attached the handler.
export function useArrival() {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [instant, setInstant] = useState(false);
  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth > 0) {
      setInstant(true);
      setLoaded(true);
    }
  }, []);
  return { ref, loaded, instant, onLoad: () => setLoaded(true) };
}

// A plain image that arrives the site's way. Takes the props of a sized
// <img> (for a Next-optimised one, getImageProps(...).props).
export function ArrivalImage({
  className = "",
  style,
  ...img
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const { ref, loaded, instant, onLoad } = useArrival();
  return (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img
      ref={ref}
      onLoad={onLoad}
      {...img}
      className={`${ARRIVAL_CLASS} ${className}`}
      style={{ ...style, ...arrivalStyle(loaded, instant) }}
    />
  );
}
