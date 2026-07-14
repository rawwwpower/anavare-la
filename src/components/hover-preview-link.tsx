"use client";

import { useEffect, useState, type ReactNode } from "react";

// Desktop-only hover preview (see .hover-preview-trigger in globals.css).
// Probes the image after mount so a missing asset degrades to a plain link
// instead of showing a broken-image box on hover.
export function HoverPreviewLink({
  href,
  previewSrc,
  className,
  children,
}: {
  href: string;
  previewSrc: string;
  className?: string;
  children: ReactNode;
}) {
  const [previewOk, setPreviewOk] = useState(false);

  useEffect(() => {
    const probe = new window.Image();
    probe.onload = () => setPreviewOk(true);
    probe.src = previewSrc;
  }, [previewSrc]);

  return (
    <span className="hover-preview-trigger inline-block">
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
      {previewOk && (
        <span className="hover-preview-image" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt=""
            width={110}
            height={150}
            className="rounded-sm shadow-lg"
            draggable={false}
          />
        </span>
      )}
    </span>
  );
}
