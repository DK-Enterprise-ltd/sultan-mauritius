import type { DailyPoint } from "@/lib/admin-stats";
import styles from "./Sparkline.module.css";

const WIDTH = 200;
const HEIGHT = 40;

/** Minimal inline SVG line chart, no charting library — a handful of daily
 * points doesn't need one. */
export default function Sparkline({ points, color }: { points: DailyPoint[]; color: string }) {
  if (points.length < 2) return null;

  const values = points.map((p) => p.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * WIDTH;
    const y = HEIGHT - ((p.value - min) / range) * HEIGHT;
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={styles.sparkline} preserveAspectRatio="none">
      <polyline points={coords.join(" ")} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}
