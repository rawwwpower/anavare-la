import { links } from "@/lib/links";

export default function Home() {
  return (
    <main className="w-full max-w-2xl mx-auto px-6 pt-16 pb-16 sm:px-8 sm:pt-24">
      <div className="flex flex-col gap-6 md:flex-row md:items-baseline md:justify-between md:gap-16">
        <div className="max-w-sm">
          <h1 className="text-xl font-medium tracking-tight text-zinc-900 sm:text-2xl">
            Ana Varela
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500 sm:text-base">
            designer based in Argentina. Raised by FADU & soulseek and making
            the internet fun (and raw) again.
          </p>
        </div>

        <nav aria-label="Social links">
          <ul className="flex gap-5 text-sm md:flex-col md:gap-2">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="-m-3 inline-block p-3 text-zinc-500 underline decoration-zinc-300 underline-offset-4 transition-colors hover:text-zinc-900 hover:decoration-zinc-400"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
