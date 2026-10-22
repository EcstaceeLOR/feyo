import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { MarketingNav } from "./MarketingNav";
import { PaymentPreview } from "./PaymentPreview";
import { SectionHeading } from "./SectionHeading";

export function LandingPage() {
  return (
    <div className="landing-page">
      <MarketingNav />
      <main>
        <section className="hero-section">
          <div className="hero-grid-pattern" aria-hidden="true" />
          <div className="hero-content page-container">
            <div className="hero-copy">
              <p className="eyebrow eyebrow-accent"><span className="live-dot" /> Open payment infrastructure</p>
              <h1>Money should move at the speed of your product.</h1>
              <p className="hero-lede">Feyo gives builders a clear, programmable way to move stablecoins on Stellar — with permissions and verification built into the flow.</p>
              <div className="hero-actions"><Link className="button button-accent" href="/docs/getting-started">Read the docs <span aria-hidden="true">↗</span></Link><a className="text-link text-link-light" href="https://github.com/Feyo-Protocol/feyo" target="_blank" rel="noreferrer">Explore the code <span aria-hidden="true">↗</span></a></div>
              <p className="hero-note">Open source · Stellar-native by design · Built for developers</p>
            </div>
            <PaymentPreview />
          </div>
          <div className="hero-bottom-line page-container"><span>For teams building the next financial layer</span><span className="hero-scroll-hint">Scroll to explore <span aria-hidden="true">↓</span></span></div>
        </section>

        <section id="product" className="section section-light product-section">
          <div className="page-container"><SectionHeading eyebrow="The Feyo model" title="A payment rail you can reason about." copy="The surface stays simple for your users while the infrastructure stays explicit for your team." />
            <div className="model-grid"><article className="model-card model-card-featured"><span className="model-index">01</span><div className="model-graphic model-graphic-intent" aria-hidden="true"><span className="graphic-node node-one">Intent</span><span className="graphic-line" /><span className="graphic-node node-two">Policy</span><span className="graphic-line" /><span className="graphic-node node-three">Settle</span></div><h3>Start with intent</h3><p>Describe the payment before anything moves: who, how much, why, and under which permission.</p></article><article className="model-card"><span className="model-index">02</span><div className="model-graphic model-graphic-policy" aria-hidden="true"><span className="policy-ring" /><span className="policy-check">✓</span></div><h3>Keep control in the loop</h3><p>Separate a request from its authorization. Teams can define the boundaries that matter to them.</p></article><article className="model-card"><span className="model-index">03</span><div className="model-graphic model-graphic-verify" aria-hidden="true"><span className="verify-bar bar-one" /><span className="verify-bar bar-two" /><span className="verify-bar bar-three" /><span className="verify-point">✓</span></div><h3>Verify the outcome</h3><p>Make status a first-class part of the product, backed by an observable transaction trail.</p></article></div>
          </div>
        </section>

        <section className="section section-navy capabilities-section">
          <div className="page-container capabilities-layout"><SectionHeading eyebrow="One foundation, many flows" title="Built for the products around the payment." copy="Feyo is designed to give product teams a stable core they can shape into their own payment experiences." /><div className="capability-list"><article><span className="capability-number">01</span><div><h3>For product teams</h3><p>Build customer-facing payment flows without hiding the operational details your team needs to see.</p><Link href="/docs/architecture" className="text-link text-link-light">See the architecture ↗</Link></div></article><article><span className="capability-number">02</span><div><h3>For developers</h3><p>A focused API surface for creating payment intents, applying permission policies, and checking status.</p><Link href="/docs/api" className="text-link text-link-light">Explore the API direction ↗</Link></div></article><article><span className="capability-number">03</span><div><h3>For AI agents</h3><p>Give agents a structured way to request actions while keeping authorization visible and bounded.</p><Link href="/docs/mcp" className="text-link text-link-light">Read about MCP ↗</Link></div></article></div></div>
        </section>

        <section className="section section-light network-section"><div className="page-container network-layout"><div className="network-orb" aria-hidden="true"><div className="orb-core">S</div><span className="orb-ring ring-one" /><span className="orb-ring ring-two" /><span className="orb-dot dot-one" /><span className="orb-dot dot-two" /><span className="orb-dot dot-three" /></div><div><SectionHeading eyebrow="The network underneath" title="Stellar-native. Product-minded." copy="Feyo is being designed on Stellar for fast, low-cost settlement and a straightforward transaction model. The integration is planned, not live in this milestone." /><div className="network-facts"><div><strong>Stellar</strong><span>Settlement layer</span></div><div><strong>USDC</strong><span>Stablecoin focus</span></div><div><strong>Open</strong><span>Source foundation</span></div></div><Link href="/docs/stellar" className="text-link">Understand the Stellar layer ↗</Link></div></div></section>

        <section id="developers" className="section section-soft developer-section"><div className="page-container developer-layout"><div><SectionHeading eyebrow="For developers and agents" title="The interface is the product." copy="The Feyo API and MCP server are planned interfaces for building payment experiences that remain inspectable from request to result." /><div className="developer-links"><Link href="/docs/api"><span className="developer-link-icon">⌘</span><span><b>Developer API</b><small>Payment intents and verifiable status</small></span><span>↗</span></Link><Link href="/docs/mcp"><span className="developer-link-icon">∷</span><span><b>MCP server</b><small>Permissioned tools for AI workflows</small></span><span>↗</span></Link></div></div><div className="code-card"><div className="code-card-top"><span>payment-intent.ts</span><span>concept</span></div><pre><code><span className="code-purple">const</span> intent = <span className="code-blue">feyo</span>.payments.<span className="code-yellow">create</span>({'{'}{`\n`}  amount: <span className="code-green">&apos;420.00&apos;</span>,{`\n`}  asset: <span className="code-green">&apos;USDC&apos;</span>,{`\n`}  destination: recipient,{`\n`}  permission: <span className="code-green">&apos;invoice:read&apos;</span>{`\n`}{'}'});{`\n`}{`\n`}<span className="code-purple">await</span> intent.<span className="code-yellow">verify</span>();</code></pre><div className="code-card-foot"><span className="code-status-dot" /> Conceptual API — not yet available</div></div></div></section>

        <section className="section open-source-section"><div className="page-container open-source-card"><div className="open-source-mark" aria-hidden="true">✳</div><div><p className="eyebrow">Open by default</p><h2>Build the rail with us.</h2><p>Feyo is independent, open source, and shaped in public. Read the docs, inspect the code, or bring a thoughtful issue to the conversation.</p><div className="open-source-actions"><a className="button button-dark" href="https://github.com/Feyo-Protocol/feyo" target="_blank" rel="noreferrer">View on GitHub <span aria-hidden="true">↗</span></a><Link className="text-link" href="/docs/contributing">Contributing guide ↗</Link></div></div></div></section>
      </main>
      <footer className="marketing-footer"><div className="page-container footer-main"><BrandMark light /><div className="footer-links"><div><span>Explore</span><Link href="/docs">Documentation</Link><Link href="/docs/roadmap">Roadmap</Link></div><div><span>Project</span><a href="https://github.com/Feyo-Protocol/feyo" target="_blank" rel="noreferrer">GitHub ↗</a><Link href="/docs/contributing">Contribute</Link></div><div><span>Legal</span><a href="https://github.com/Feyo-Protocol/feyo/blob/main/LICENSE" target="_blank" rel="noreferrer">Apache 2.0</a><a href="https://github.com/Feyo-Protocol/feyo/blob/main/SECURITY.md" target="_blank" rel="noreferrer">Security</a></div></div></div><div className="page-container footer-bottom"><span>© 2026 Feyo Protocol</span><span>Payments with a point of view.</span></div></footer>
    </div>
  );
}
