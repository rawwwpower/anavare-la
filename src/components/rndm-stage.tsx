"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { CoveredContext } from "@/components/sheet-context";

// Holds /rndm's two layers apart: the ground, which is whatever the section's
// own route renders, and the sheet slot on top of it.
//
// The slot is what keeps the ground still. Because a note arrives through an
// intercepted route (src/app/rndm/@sheet), navigating to one leaves `children`
// exactly as it was — the index is not re-rendered, does not replay its
// entrance, and does not lose its scroll. It is the same layer the whole
// visit, which is the only way dragging a note off it can be honest.
//
// While a note is on top the ground pulls back and dims (see .rndm-ground),
// driven by the sheet through --sheet-progress. The class is only attached
// while there is something to be underneath: a permanent transform on the
// index would make it the containing block for any fixed child it ever grows.

// A slot with nothing matched still reports a segment — the one Next uses for
// default.js — so an empty sheet slot has to be read as empty, not as open.
const NO_SHEET = "__DEFAULT__";

export function RndmStage({
  children,
  sheet,
}: {
  children: React.ReactNode;
  sheet: React.ReactNode;
}) {
  const segment = useSelectedLayoutSegment("sheet");
  const covered = segment !== null && segment !== NO_SHEET;

  return (
    <>
      <div
        className={`flex flex-1 flex-col${covered ? " rndm-ground" : ""}`}
        // Nothing under a sheet should take focus or a tap. The gesture that
        // closes the sheet listens on the document, so this alone doesn't
        // stop the index answering it — CoveredContext does that.
        inert={covered}
      >
        <CoveredContext value={covered}>{children}</CoveredContext>
      </div>
      {sheet}
    </>
  );
}
