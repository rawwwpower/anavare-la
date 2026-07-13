import { links } from "@/lib/links";
import { BouncyBall } from "@/components/bouncy-ball";

export default function Home() {
  return (
    <main className="w-full max-w-2xl mx-auto px-6 pt-16 pb-16 sm:px-8 sm:pt-24">
      <BouncyBall />
      <div className="flex flex-col gap-6 md:flex-row md:items-baseline md:justify-between md:gap-16">
        <div className="max-w-md">
          <h1 className="text-xl font-medium tracking-tight text-zinc-100 sm:text-2xl">
            Ana Varela
          </h1>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            <p>
              I&apos;m Ana. Though online you might know me as{" "}
              <a
                href="https://youtu.be/ED3mufU58bk?si=6SR5NY0_-KCdtNQ-&t=75"
                target="_blank"
                rel="noreferrer"
                className="underline decoration-zinc-600 underline-offset-4 transition-colors hover:text-zinc-100 hover:decoration-zinc-400"
              >
                raw power
              </a>
              .
            </p>
            <p>
              With a background in graphic design from FADU, I believe
              (whichever your god) the magic is in the details.
            </p>
            <p>
              I love analyzing, experimenting, creating, and scrapping ideas,
              and now I do it as a product designer, always keeping an eye on
              what&apos;s moving on the web.
            </p>
          </div>
        </div>

        <nav aria-label="Social links">
          <ul className="flex gap-5 text-sm md:flex-col md:gap-2">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="-m-3 inline-block p-3 text-zinc-400 underline decoration-zinc-600 underline-offset-4 transition-colors hover:text-zinc-100 hover:decoration-zinc-400"
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
