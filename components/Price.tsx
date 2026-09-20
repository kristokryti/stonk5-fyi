import { isPriceSubscriptShape, priceFullText, priceParts } from "@/lib/format";

/**
 * Renders a USD price using the brief §7 subscript-zero-count notation for
 * sub-cent prices (e.g. $0.0<sub>4</sub>7171), or the plain text form
 * otherwise. Always carries the full plain-text price in aria-label/title
 * so assistive tech and hover both get the real value.
 */
export default function Price({
  value,
  className = "",
}: {
  value: number | null;
  className?: string;
}) {
  if (value === null || !Number.isFinite(value) || value <= 0) {
    return (
      <span className={`price ${className}`} aria-label="Price unavailable">
        —
      </span>
    );
  }

  const parts = priceParts(value);
  const fullText = priceFullText(value);

  if (!isPriceSubscriptShape(parts)) {
    return (
      <span className={`price num ${className}`} aria-label={fullText} title={fullText}>
        {parts.text}
      </span>
    );
  }

  return (
    <span className={`price num ${className}`} aria-label={fullText} title={fullText}>
      {parts.pre}
      <sub>{parts.zeros}</sub>
      {parts.digits}
    </span>
  );
}
