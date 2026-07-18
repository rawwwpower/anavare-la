import Link from "next/link";

export default function RndmPage() {
  return (
    <main
      className="flex min-h-screen flex-col px-6 py-16 sm:px-8 sm:py-20"
      style={{
        background: "var(--foreground)",
        color: "var(--background)",
      }}
    >
      <div className="flex flex-1 items-center justify-center">
        <p className="max-w-md text-center font-serif text-2xl leading-relaxed sm:text-3xl">
          Created in Argentina, a bicontinental country.
        </p>
      </div>

      <nav aria-label="Back">
        <Link
          href="/"
          aria-label="Back to home"
          className="group -ml-3 inline-flex h-11 items-center px-3 opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 rounded-sm"
          style={{ outlineColor: "var(--background)" }}
        >
          <svg
            width="34"
            height="12"
            viewBox="0 0 34 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="transition-transform duration-200 ease-out group-hover:-translate-x-0.5 motion-reduce:transform-none"
          >
            <path d="M33 6 H1" />
            <path d="M6.5 1 L1 6 L6.5 11" />
          </svg>
        </Link>
      </nav>
    </main>
  );
}
