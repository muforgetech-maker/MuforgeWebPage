import qrcode from "qrcode-generator";

/*
 * A QR code as inline SVG.
 *
 * Drawn as one path of 1×1 squares on a module grid, so it stays crisp at
 * any size and prints at the printer's own resolution rather than a bitmap's.
 * Generated on the server: nothing is fetched, which matters for a document
 * that has to print correctly offline.
 */
export function QrCode({
  value,
  title,
  className = "",
}: {
  value: string;
  title: string;
  className?: string;
}) {
  // Type 0 picks the smallest version that fits; M corrects around 15%,
  // enough for a printed page that may be creased or photographed.
  const qr = qrcode(0, "M");
  qr.addData(value);
  qr.make();

  const count = qr.getModuleCount();
  const quiet = 2; // a margin is required, or scanners miss the edges
  const span = count + quiet * 2;

  let path = "";
  for (let row = 0; row < count; row++) {
    for (let column = 0; column < count; column++) {
      if (qr.isDark(row, column)) {
        path += `M${column + quiet} ${row + quiet}h1v1h-1z`;
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${span} ${span}`}
      role="img"
      aria-label={title}
      className={className}
      shapeRendering="crispEdges"
    >
      <rect width={span} height={span} fill="#ffffff" />
      <path d={path} fill="#000000" />
    </svg>
  );
}
