import Link from "next/link";

const backClassName =
  "-ml-3 inline-flex min-h-11 items-center px-3 text-base text-zinc-500 underline decoration-zinc-400 underline-offset-4 transition-colors hover:text-zinc-900 hover:decoration-zinc-600 focus-visible:text-zinc-900 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-500 rounded-sm";

export default function RndmPage() {
  return (
    <main
      className="flex min-h-svh flex-col px-6 py-16 sm:px-8 sm:py-20"
      style={{
        background: "var(--foreground)",
        color: "var(--background)",
      }}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center">
          <p className="font-mono text-xs tracking-[0.2em] sm:text-sm">
            Created in Argentina, a bicontinental country.
          </p>
        </div>

        <nav aria-label="Back">
          <Link href="/" className={backClassName}>
            back
          </Link>
        </nav>
      </div>
    </main>
  );
}
