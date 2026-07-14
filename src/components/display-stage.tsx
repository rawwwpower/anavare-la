"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type DisplayContextValue = {
  src: string | null;
  show: (src: string) => void;
  hide: () => void;
};

const DisplayContext = createContext<DisplayContextValue | null>(null);

// Wraps the page. Any trigger (hover, tap) calls useDisplay() to put an
// image on the shared central stage, instead of rendering its own popover.
// This is the reusable "display" for future objects, not just raw power.
export function DisplayProvider({ children }: { children: ReactNode }) {
  const [src, setSrc] = useState<string | null>(null);
  return (
    <DisplayContext.Provider
      value={{ src, show: setSrc, hide: () => setSrc(null) }}
    >
      {children}
    </DisplayContext.Provider>
  );
}

export function useDisplay() {
  const ctx = useContext(DisplayContext);
  if (!ctx) throw new Error("useDisplay must be used within DisplayProvider");
  return ctx;
}

// The always-present blank slot. Empty by default; shows whatever the
// active trigger puts there. Reserves its own space so nothing shifts
// when an image appears, and keeps the last image mounted while it fades
// out instead of popping away.
export function DisplayStage({ className }: { className?: string }) {
  const { src, hide } = useDisplay();
  const [renderedSrc, setRenderedSrc] = useState<string | null>(null);

  // Adjust state during render (React-sanctioned pattern) instead of an
  // effect: keeps the last image mounted so it can fade out, and swaps in
  // the new one immediately when a different trigger shows something.
  if (src && src !== renderedSrc) {
    setRenderedSrc(src);
  }

  return (
    <div className={className} aria-hidden>
      {renderedSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={renderedSrc}
          alt=""
          draggable={false}
          onError={hide}
          className={`max-h-full max-w-full rounded-sm object-contain shadow-lg transition-opacity duration-150 ${
            src ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
