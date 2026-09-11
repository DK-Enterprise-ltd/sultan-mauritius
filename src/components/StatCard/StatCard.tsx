import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Sparkline from "@/components/Sparkline/Sparkline";
import type { DailyPoint } from "@/lib/admin-stats";
import styles from "./StatCard.module.css";

type Props = {
  label: string;
  value: string;
  icon: ReactNode;
  accent: string;
  trend?: number | null;
  trendLabel?: string;
  sparkline?: DailyPoint[];
};

export default function StatCard({ label, value, icon, accent, trend, trendLabel, sparkline }: Props) {
  const showTrend = trend !== undefined && trend !== null;
  const isUp = showTrend && trend! >= 0;

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <span className={styles.icon} style={{ background: `${accent}1a`, color: accent }}>
          {icon}
        </span>
      </div>
      <span className={styles.value}>{value}</span>
      {showTrend && (
        <span className={`${styles.trend} ${isUp ? styles.trendUp : styles.trendDown}`}>
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend!).toFixed(1)}% {trendLabel ?? "vs last month"}
        </span>
      )}
      {sparkline && sparkline.length > 1 && (
        <div className={styles.sparklineWrap}>
          <Sparkline points={sparkline} color={accent} />
        </div>
      )}
    </div>
  );
}
