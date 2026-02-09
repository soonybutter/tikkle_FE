import styles from './Progress.module.css';

export default function Progress({ value, label }: { value: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value ?? 0)));
  return (
    <div className={styles.wrap} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={styles.track}>
        <div className={styles.bar} style={{ width: `${pct}%` }} />
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
