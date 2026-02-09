import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Goals } from '../api';
import type { Goal , GoalSummaryDto} from '../api/goals';
import styles from './GoalsListPage.module.css';

export default function GoalsListPage() {
  const [data, setData] = useState<Goal[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
        try {
        const dtos: GoalSummaryDto[] = await Goals.list(); 
        const normalized: Goal[] = dtos.map((dto) => {
            const savedAmount =
            typeof dto.totalSaved === 'number'
                ? dto.totalSaved
                : typeof dto.progressPct === 'number'
                ? Math.round((dto.progressPct / 100) * dto.targetAmount)
                : 0;
            return {
            id: dto.id,
            title: dto.title,
            targetAmount: dto.targetAmount,
            savedAmount,
            imageUrl: dto.imageUrl,
            createdAt: dto.createdAt,
            };
        });
        setData(normalized); 
        } catch (err: unknown) {
        if (err instanceof Error && err.message === 'UNAUTHORIZED') {
            nav('/login', { replace: true });
            return;
        }
        console.error('Failed to fetch goals:', err);
        setErr('목표 목록을 불러오지 못했어요.');
        }
    })();
    }, [nav]);

  if (err) return <div style={{ padding: 24 }}>{err}</div>;
  if (!data) return <div style={{ padding: 24 }}>불러오는 중…</div>;

  if (data.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        아직 목표가 없어요. 
        <a href="/goals/new">새 목표</a>를 만들어 보세요!
      </div>
    );
  }

  return (
    <div className={styles?.wrap ?? ''} style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>나의 목표</h1>
      <ul style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))' }}>
        {data.map(g => {
          const progress = Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100));
          return (
            <li key={g.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
              {g.imageUrl && (
                <img
                  src={g.imageUrl}
                  alt={g.title}
                  style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }}
                />
              )}
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{g.title}</div>
              <div style={{ fontSize: 14, color: '#475569', marginBottom: 8 }}>
                {g.savedAmount.toLocaleString()} / {g.targetAmount.toLocaleString()} 원
              </div>
              <div style={{ background: '#f1f5f9', borderRadius: 999, overflow: 'hidden', height: 8 }}>
                <div style={{ width: `${progress}%`, height: '100%', background: '#0ea5e9' }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}