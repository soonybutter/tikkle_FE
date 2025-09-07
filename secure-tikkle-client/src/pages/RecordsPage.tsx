import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Auth, Goals } from '../api';
import type { GoalSummaryDto } from '../api';
import styles from './Records.module.css'; // ← 새 CSS 모듈

export default function RecordsPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<GoalSummaryDto[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const me = await Auth.me();
      if (!me.authenticated) { nav('/login'); return; }
      const list = await Goals.list();
      setGoals(list);
      setLoading(false);
    })();
  }, [nav]);

  if (loading) return <main className={`container ${styles.page}`}>불러오는 중…</main>;

  return (
    <main className={`container ${styles.page}`}>
      <h1 className={styles.sectionTitle}>나의 티끌기록</h1>

      {goals.length === 0 ? (
        <p>아직 목표가 없어요. <Link to="/goals/new">목표 만들기</Link></p>
      ) : (
        <div className={styles.goalGrid}>
          {goals.map(g => {
            const p = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            return (
              <Link key={g.id} to={`/goals/${g.id}`} className={styles.goalCard}>
                <div className={styles.goalTop}>
                  <span className={styles.goalEmoji}>📌</span>
                  <div className={styles.goalTitle}>{g.title}</div>
                </div>

                <div className={styles.goalAmounts}>
                  <b>{g.currentAmount.toLocaleString()}원</b>
                  <span> / {g.targetAmount.toLocaleString()}원</span>
                </div>

                <div className={styles.progressTrack} aria-label="진행률">
                  <div className={styles.progressFill} style={{ width: `${p}%` }} aria-hidden />
                </div>

                <div className={styles.goalProgressText}>진행률 {p}%</div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}