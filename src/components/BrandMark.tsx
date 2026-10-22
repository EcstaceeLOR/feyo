import Link from "next/link";

export function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`brand-mark${light ? " brand-mark-light" : ""}`} aria-label="Feyo home">
      <span className="brand-mark-symbol" aria-hidden="true">f</span>
      <span>feyo</span>
    </Link>
  );
}
