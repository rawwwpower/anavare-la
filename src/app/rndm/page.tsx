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
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="transition-transform duration-200 ease-out group-hover:-translate-x-0.5 motion-reduce:transform-none"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="11 5 4 12 11 19" />
          </svg>
        </Link>
      </nav>
    </main>
  );
}
