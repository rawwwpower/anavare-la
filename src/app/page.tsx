import Link from "next/link";
import { links } from "@/lib/links";
import { BouncyBall } from "@/components/bouncy-ball";
import { HoverPreviewLink } from "@/components/hover-preview-link";

const linkClassName =
  "-m-3 inline-block p-3 text-zinc-400 underline decoration-zinc-600 underline-offset-4 transition-colors hover:text-zinc-100 hover:decoration-zinc-400";

export default function Home() {
  return (
    <main className="w-full max-w-2xl mx-auto px-6 pt-16 pb-16 sm:px-8 sm:pt-24">
      <BouncyBall />
      <div className="flex flex-col gap-6 md:flex-row md:items-baseline md:justify-between md:gap-16">
        <div className="max-w-md">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Ana Varela
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Product Designer</p>

          <p className="mt-5 text-sm leading-relaxed text-zinc-400 sm:text-base">
            You might know me as{" "}
            <HoverPreviewLink
              href="https://youtu.be/ED3mufU58bk?si=6SR5NY0_-KCdtNQ-&t=75"
              previewSrc="/toys/raw-power-halftone.png"
              className="underline decoration-zinc-600 underline-offset-4 transition-colors hover:text-zinc-100 hover:decoration-zinc-400"
            >
              raw power
            </HoverPreviewLink>
            . Raised by FADU & soulseek, keeping an eye on what&apos;s moving
            on the web.
          </p>
        </div>

        <nav aria-label="Social links">
          <ul className="flex gap-5 text-sm md:flex-col md:gap-2">
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
      </div>
    </main>
  );
}
