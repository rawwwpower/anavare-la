import Link from "next/link";
import { HoverArtwork } from "@/components/hover-artwork";

const backClassName =
  "-ml-3 inline-flex min-h-11 items-center px-3 text-base text-zinc-500 underline decoration-zinc-400 underline-offset-4 transition-[color,text-decoration-color,transform] duration-150 ease-out hover:text-zinc-900 hover:decoration-zinc-600 active:scale-[0.97] focus-visible:text-zinc-900 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-500 rounded-sm";

export default function Note202609051821Page() {
  return (
    <main
      className="flex min-h-svh flex-col px-[var(--page-pad-x)] py-[var(--page-pad-y)]"
      style={{
        background: "var(--foreground)",
        color: "var(--background)",
      }}
    >
      <HoverArtwork
        defaultSrc="/toys/sopa-de-cerebro-de-mono.jpg"
        alt="Indiana Jones y los Cazadores del Arca Perdida, póster"
      />

      <div className="mx-auto flex w-full flex-1 flex-col">
        <h1 className="sr-only">
          Nota — Indiana Jones y los Cazadores del Arca Perdida
        </h1>
        <p className="max-w-md font-mono text-xs font-light leading-relaxed tracking-wide text-zinc-600">
          Indiana Jones y los Cazadores del Arca Perdida.
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
