import Link from "next/link";
import { links } from "@/lib/links";
import { BouncyBall } from "@/components/bouncy-ball";
import { HoverPreviewLink } from "@/components/hover-preview-link";
import { DisplayProvider, DisplayStage } from "@/components/display-stage";

const linkClassName =
  "-m-3 inline-block p-3 text-zinc-400 underline decoration-zinc-600 underline-offset-4 transition-colors hover:text-zinc-100 hover:decoration-zinc-400";

export default function Home() {
  return (
    <DisplayProvider>
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 py-16 sm:px-8 sm:py-20">
        <BouncyBall />

        <div>
          <h1 className="text-base font-semibold tracking-tight text-zinc-100">
            Ana Varela
          </h1>
          <p className="text-base text-zinc-500">designer</p>
        </div>

        <p className="mt-12 max-w-md text-base leading-relaxed text-zinc-400 sm:mt-14">
          You might know me as{" "}
          <HoverPreviewLink
            href="https://youtu.be/ED3mufU58bk?si=6SR5NY0_-KCdtNQ-&t=75"
            previewSrc="/toys/raw-power-halftone.png"
            className="underline decoration-zinc-600 underline-offset-4 transition-colors hover:text-zinc-100 hover:decoration-zinc-400"
          >
            raw power
          </HoverPreviewLink>
          . Raised by FADU & soulseek, keeping an eye on what&apos;s moving on
          the web.
        </p>

        <DisplayStage className="my-10 flex flex-1 min-h-40 items-center justify-center sm:my-14" />

        <nav aria-label="Social links">
          <ul className="flex flex-col items-start gap-2 text-base">
            {links.map((link) => (
              <li key={link.label}>
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={linkClassName}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link href={link.href} className={linkClassName}>
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
