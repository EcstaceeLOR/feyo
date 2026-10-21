import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-8 sm:px-10 lg:px-16">
      <nav className="mx-auto flex max-w-6xl items-center justify-between" aria-label="Primary navigation">
        <Link href="/" className="text-xl font-bold tracking-tight">feyo<span className="text-[var(--accent)]">.</span></Link>
        <div className="flex items-center gap-5 text-sm font-semibold text-[var(--muted)]">
          <Link href="/docs" className="hover:text-[var(--foreground)]">Docs</Link>
          <a href="https://github.com/Feyo-Protocol/feyo" target="_blank" rel="noreferrer" className="hover:text-[var(--foreground)]">GitHub ↗</a>
        </div>
      </nav>
      <section className="mx-auto flex max-w-6xl flex-col gap-12 pb-20 pt-28 lg:flex-row lg:items-end lg:justify-between lg:pt-44">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-bold uppercase tracking-[.2em] text-[var(--accent)]">Open-source payment infrastructure</p>
          <h1 className="max-w-3xl text-5xl font-bold leading-[.98] tracking-[-.06em] sm:text-7xl">Move stablecoin payments with clarity.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">Feyo is building a Stellar-powered foundation for web apps, developer APIs, and AI agents to request, authorize, and verify payments.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/docs" className="rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-bold text-[var(--background)] hover:opacity-85">Read the docs →</Link>
            <a href="https://github.com/Feyo-Protocol/feyo" target="_blank" rel="noreferrer" className="rounded-full border border-[var(--line)] px-6 py-3 text-sm font-bold hover:border-[var(--accent)]">Contribute on GitHub</a>
          </div>
        </div>
        <div className="grid max-w-sm gap-3 text-sm text-[var(--muted)]">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5"><span className="mb-3 block text-2xl">◌</span><strong className="text-[var(--foreground)]">Permission-based</strong><br />Explicit authorization before payment execution.</div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5"><span className="mb-3 block text-2xl">✦</span><strong className="text-[var(--foreground)]">Verifiable</strong><br />Designed around observable on-chain status.</div>
        </div>
      </section>
      <footer className="mx-auto max-w-6xl border-t border-[var(--line)] pt-6 text-sm text-[var(--muted)]">Feyo is early-stage infrastructure. See the <Link href="/docs/roadmap" className="text-[var(--accent)] underline">roadmap</Link> for what is implemented, in progress, and planned.</footer>
    </main>
  );
}
