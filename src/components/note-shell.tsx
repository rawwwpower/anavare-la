"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// The note's text content, closing like a bottom sheet: slides down and
// fades out on "close", then navigates back to the index. Kept to this one
// wrapper (not the artwork, which is independently positioned/fixed) so the
// animation is a plain transform+opacity transition — no layout properties,
// nothing that fights a fixed-position descendant's own containing block.
const CLOSE_MS = 180;

const closeClassName =
  "-ml-3 inline-flex min-h-11 items-center px-3 text-base text-zinc-500 underline decoration-zinc-400 underline-offset-4 transition-[color,text-decoration-color,transform] duration-150 ease-out hover:text-zinc-900 hover:decoration-zinc-600 active:scale-[0.97] focus-visible:text-zinc-900 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-500 rounded-sm";

export function NoteShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [closing, setClosing] = useState(false);

  function handleClose(e: React.MouseEvent) {
    e.preventDefault();
    if (closing) return;
    setClosing(true);
    setTimeout(() => router.push("/rndm"), CLOSE_MS);
  }

  return (
    <div
      className="mx-auto flex w-full flex-1 flex-col transition-[transform,opacity] ease-in"
      style={{
        transitionDuration: `${CLOSE_MS}ms`,
        transform: closing ? "translateY(12%)" : "translateY(0)",
        opacity: closing ? 0 : 1,
      }}
    >
      {children}

      <div className="flex-1" />

      <nav aria-label="Close">
        <a href="/rndm" onClick={handleClose} className={closeClassName}>
          close
        </a>
      </nav>
    </div>
  );
}
