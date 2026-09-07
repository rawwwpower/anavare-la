"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

// Two facts a /rndm page may need about the layer it is on, kept in one
// place because they are opposite sides of the same arrangement: a note
// lying on the index knows it is a sheet, and the index underneath knows it
// is covered.

// Set by NoteSheet for whatever it is carrying. `close` is the sheet's own
// exit, so a note's exit link plays the sheet leaving instead of doing a
// second, competing navigation of its own. `bottom` says whether this is the
// phone's bottom sheet — the one you drag away — because that is the only
// place where dropping the exit link still leaves a way out.
export const SheetContext = createContext<{
  close: () => void;
  bottom: boolean;
} | null>(null);
export const useSheet = () => useContext(SheetContext);

// Set by RndmStage for whatever is underneath a sheet. The index keeps its
// own swipe-to-home gesture, and that gesture listens on the document — so
// without this it would answer a drag aimed at the sheet sitting on top of
// it and pull the ground sideways under someone's finger.
export const CoveredContext = createContext(false);
export const useCovered = () => useContext(CoveredContext);

// Media queries, subscribed to rather than read once, so rotating a phone or
// turning motion down mid-visit doesn't leave a gesture in the wrong mode.
// One MediaQueryList per query, shared by every caller — matchMedia is not
// free and these are asked for on every note.
const lists = new Map<string, MediaQueryList>();
const listFor = (q: string) => {
  let m = lists.get(q);
  if (!m) lists.set(q, (m = window.matchMedia(q)));
  return m;
};

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const m = listFor(query);
      m.addEventListener("change", onChange);
      return () => m.removeEventListener("change", onChange);
    },
    () => listFor(query).matches,
    // Server-side there is no viewport and no stated preference: report
    // false, so anything gated on a query stays off until hydration can
    // actually tell.
    () => false,
  );
}

// Below sm: where a note's artwork stops being fixed to the corner and rides
// along in normal flow, which is the only place an ancestor of it can safely
// be transformed.
export const NARROW = "(max-width: 639.98px)";
export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
