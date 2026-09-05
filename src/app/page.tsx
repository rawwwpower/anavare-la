import Link from "next/link";
import { links } from "@/lib/links";
import { BouncyBall } from "@/components/bouncy-ball";
import { PosterProjection } from "@/components/poster-projection";
import { DisplayProvider, DisplayStage } from "@/components/display-stage";

const linkClassName =
  "inline-flex min-h-11 items-center px-3 text-zinc-400 underline decoration-zinc-600 underline-offset-4 transition-[color,text-decoration-color,transform] duration-150 ease-out hover:text-zinc-100 hover:decoration-zinc-400 active:scale-[0.97] focus-visible:text-zinc-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-500 rounded-sm";

export default function Home() {
  return (
    <DisplayProvider>
      <main className="mx-auto flex min-h-svh w-full flex-col px-[var(--page-pad-x)] py-[var(--page-pad-y)]">
        <BouncyBall />
        <PosterProjection />

        <div>
          <h1 className="text-base font-semibold tracking-tight text-zinc-100">
            A
          </h1>
          <p className="text-base text-zinc-500">designer</p>
        </div>

        <p className="mt-12 max-w-md text-base leading-relaxed text-zinc-400 sm:mt-14">
          Ana Belén Varela in real life. On the internet, you might know me
          as{" "}
          <a
            href="https://youtu.be/ED3mufU58bk?si=6SR5NY0_-KCdtNQ-&t=75"
            target="_blank"
            rel="noreferrer"
            className="inline-block underline decoration-zinc-600 underline-offset-4 transition-[color,text-decoration-color,transform] duration-150 ease-out hover:text-zinc-100 hover:decoration-zinc-400 active:scale-[0.97]"
          >
            raw power
          </a>
          . Graphic design degree from FADU, raised by soulseek, keeping an
          eye on what&apos;s moving on the web.
        </p>

        <DisplayStage className="my-10 flex flex-1 min-h-40 items-center justify-center sm:my-14" />

        <nav aria-label="Social links">
          <ul className="-ml-3 flex flex-row flex-wrap items-center text-base">
            {links.map((link) => (
              <li key={link.label}>
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.aria}
                    className={linkClassName}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    aria-label={link.aria}
                    className={linkClassName}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </DisplayProvider>
  );
}
