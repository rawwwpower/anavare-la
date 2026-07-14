"use client";

import type { ReactNode } from "react";
import { useDisplay } from "@/components/display-stage";

// Puts previewSrc on the shared DisplayStage on hover (desktop) or press
// (mobile), instead of rendering its own popover next to the link.
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
  const { show, hide } = useDisplay();

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      onMouseEnter={() => show(previewSrc)}
      onMouseLeave={hide}
      onTouchStart={() => show(previewSrc)}
      onTouchEnd={hide}
      onTouchCancel={hide}
    >
      {children}
    </a>
  );
}
