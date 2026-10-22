export function PaymentPreview() {
  return (
    <div className="payment-preview" aria-label="Illustrative Feyo payment dashboard preview">
      <div className="preview-topbar">
        <div className="preview-dots" aria-hidden="true"><span /><span /><span /></div>
        <span className="preview-label">Illustrative preview</span>
        <span className="preview-status"><i aria-hidden="true" /> Sandbox</span>
      </div>
      <div className="preview-body">
        <div className="preview-sidebar" aria-hidden="true">
          <span className="preview-sidebar-logo">f</span>
          <span className="preview-sidebar-line active" />
          <span className="preview-sidebar-line" />
          <span className="preview-sidebar-line" />
          <span className="preview-sidebar-line" />
          <span className="preview-sidebar-bottom" />
        </div>
        <div className="preview-main">
          <div className="preview-heading-row"><div><span className="preview-kicker">Overview</span><h3>Good morning, builder</h3></div><span className="preview-date">Sandbox mode</span></div>
          <div className="preview-balance-card"><div><span className="preview-kicker">Tracked volume</span><strong>$24,680<span className="preview-cents">.42</span></strong><span className="preview-positive">↗ 12.8% from last month</span></div><div className="preview-orbit" aria-hidden="true"><span /></div></div>
          <div className="preview-mini-grid"><div className="preview-mini-card"><span className="preview-kicker">Settled</span><strong>18</strong><span>payments</span></div><div className="preview-mini-card"><span className="preview-kicker">Awaiting review</span><strong>03</strong><span>permissions</span></div><div className="preview-mini-card"><span className="preview-kicker">Network</span><strong>Testnet</strong><span>Stellar</span></div></div>
          <div className="preview-activity"><div className="preview-activity-title"><span>Recent activity</span><span>View all</span></div><div className="activity-row"><span className="activity-icon">↗</span><span><b>Payment intent created</b><small>pay_8e2a · Today, 11:42</small></span><strong>$420.00</strong><em>Review</em></div><div className="activity-row"><span className="activity-icon activity-icon-muted">✓</span><span><b>Test transaction verified</b><small>tx_4c91 · Yesterday, 16:08</small></span><strong>$180.50</strong><em className="verified">Verified</em></div></div>
        </div>
      </div>
      <p className="preview-disclaimer">A visual concept only — no payment is processed.</p>
    </div>
  );
}
