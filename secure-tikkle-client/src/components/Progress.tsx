import styles from './Progress.module.css';

export default function Progress({ value }: { value: number }) {
  
  const v = Math.max(0, Math.min(100, Math.round(value)));

  return (

    <div className={styles.root} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={v}>
      <div className={styles.bar} style={{ width: `${v}%` }} />
    </div>

  );

}