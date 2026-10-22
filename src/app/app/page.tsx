import Link from "next/link";

export default function AppPage() {
  return (
    <main className="app-placeholder-page">
      <div className="app-placeholder-card"><span className="app-placeholder-mark">f</span><p className="eyebrow">Feyo application</p><h1>The product surface is taking shape.</h1><p>The functional payment application is not available yet. This route is reserved for the future Feyo workspace; no payment is processed here.</p><div><Link className="button button-dark" href="/docs">Read the documentation ↗</Link><Link className="text-link" href="/">Return home</Link></div></div>
    </main>
  );
}
