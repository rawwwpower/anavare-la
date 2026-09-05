import Link from "next/link";
import { HoverArtwork } from "@/components/hover-artwork";

const backClassName =
  "-ml-3 inline-flex min-h-11 items-center px-3 text-base text-zinc-500 underline decoration-zinc-400 underline-offset-4 transition-colors hover:text-zinc-900 hover:decoration-zinc-600 focus-visible:text-zinc-900 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-500 rounded-sm";

export default function Note20260905Page() {
  return (
    <main
      className="flex min-h-svh flex-col px-[var(--page-pad-x)] py-[var(--page-pad-y)]"
      style={{
        background: "var(--foreground)",
        color: "var(--background)",
      }}
    >
      <HoverArtwork
        defaultSrc="/toys/sisifo-clean.jpg"
        hoverSrc="/toys/sisifo-hover.jpg"
        alt="Sísifo, Franz von Stuck, 1920"
      />

      <div className="mx-auto flex w-full flex-1 flex-col">
        <p className="max-w-md font-mono text-xs font-light leading-relaxed tracking-wide text-zinc-600">
          Agotá el rango de lo posible y de lo imposible.
        </p>

        <div className="flex-1" />

        <nav aria-label="Back">
          <Link href="/rndm" className={backClassName}>
            back
          </Link>
        </nav>
      </div>
    </main>
  );
}
