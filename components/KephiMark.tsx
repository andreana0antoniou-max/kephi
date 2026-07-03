// The Kephi starburst mark, reconstructed to spec from the brand sheet:
// 8 equal rays, evenly spaced, in the fixed clockwise order
// Plum -> Gold -> Tangerine -> Teal (repeating), with an Ink center dot.
// Per brand guidelines: don't recolor, reorder, rotate, or add
// gradients/shadows. Only place on cream, white, or ink backgrounds.

const RAY_COLORS = ["#8E4585", "#E0A93B", "#F26B3A", "#1F9E8F"]; // plum, gold, tangerine, teal

function rayPath(angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180;
  const rot = (x: number, y: number) => [
    x * Math.cos(a) - y * Math.sin(a),
    x * Math.sin(a) + y * Math.cos(a),
  ];
  const [x0, y0] = rot(0, 0);
  const [cx1, cy1] = rot(13, 25);
  const [x2, y2] = rot(122, 0);
  const [cx2, cy2] = rot(13, -25);
  return `M ${x0.toFixed(2)},${y0.toFixed(2)} Q ${cx1.toFixed(2)},${cy1.toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)} Q ${cx2.toFixed(2)},${cy2.toFixed(2)} ${x0.toFixed(2)},${y0.toFixed(2)} Z`;
}

export default function KephiMark({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-140 -140 280 280"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <path key={i} d={rayPath(i * 45)} fill={RAY_COLORS[i % 4]} />
      ))}
      <circle cx="0" cy="0" r="26" fill="#262130" />
    </svg>
  );
}
