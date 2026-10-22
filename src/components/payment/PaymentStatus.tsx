"use client";

import { useId } from "react";
import { displayState, explorerUrl, statusCopy, type PaymentStatusData, type PaymentStatusState } from "./status-model";

export interface PaymentStatusProps {
  payment?: PaymentStatusData | null;
  /** A lookup failure is separate from a failed payment. */
  lookupError?: string;
  onRetry?: () => void;
  retrying?: boolean;
}

const stages: PaymentStatusState[] = ["draft", "awaiting_authorization", "submitted", "confirming", "verified"];

export function PaymentStatus({ payment, lookupError, onRetry, retrying = false }: PaymentStatusProps) {
  const headingId = useId();
  const state = payment ? displayState(payment) : undefined;
  const copy = state ? statusCopy[state] : undefined;
  const url = payment?.source === "network" ? explorerUrl(payment.transactionHash, payment.network) : undefined;
  const timeline = state === "failed" || state === "expired" ? [...stages.slice(0, -1), state] : stages;
  const canRetry = !!onRetry && (!!lookupError || !payment || state === "failed" || state === "expired");

  return (
    <section className="payment-status" aria-labelledby={headingId}>
      <h2 id={headingId}>Payment status</h2>
      <div role="status" aria-live="polite" aria-atomic="true">
        <p className="payment-status-label"><span aria-hidden="true">{copy?.icon ?? "○"}</span> {copy?.label ?? "No payment selected"}</p>
        <p>{copy?.description ?? "Select a payment to view its status. No transaction is being tracked."}</p>
        {payment?.source === "mock" && <p className="payment-status-notice">Demo data only. No real payment or settlement is verified.</p>}
        {payment?.source === "local" && <p className="payment-status-notice">Local status only. The network has not verified this payment.</p>}
        {payment?.state === "verified" && state !== "verified" && <p>Verification evidence is missing or does not match. This payment remains unverified.</p>}
        {state === "verified" && payment?.network === "testnet" && <p>Testnet verification only. Test assets have no real monetary value.</p>}
        {retrying && <p>Checking status again. The last reported payment state is shown above.</p>}
      </div>
      {payment && (
        <>
          <p className="payment-status-network">Network: {payment.network === "public" ? "Stellar Mainnet" : payment.network === "testnet" ? "Stellar Testnet" : "Not specified"}</p>
          <ol className="payment-status-timeline" aria-label="Payment lifecycle stages">
            {timeline.map((stage) => (
              <li key={stage} aria-current={stage === state ? "step" : undefined}>
                <span className="payment-status-icon" aria-hidden="true">{stage === state ? statusCopy[stage].icon : "○"}</span>
                <span>{statusCopy[stage].label}<small>{stage === state ? "Current stage" : "Lifecycle stage"}</small></span>
              </li>
            ))}
          </ol>
          <p className="payment-status-note">Stages describe the lifecycle; they are not a record of completed steps.</p>
        </>
      )}
      {url && <p><a href={url} target="_blank" rel="noopener noreferrer">View transaction on Stellar {payment?.network === "public" ? "Mainnet" : "Testnet"} explorer (opens in a new tab)</a></p>}
      {lookupError && <p role="alert">Unable to refresh payment status: {lookupError} The last reported state may be out of date.</p>}
      {canRetry && <button type="button" onClick={onRetry} disabled={retrying}>{retrying ? "Checking status…" : "Retry status check"}</button>}
    </section>
  );
}
