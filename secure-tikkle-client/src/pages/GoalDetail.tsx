// src/pages/GoalDetail.tsx
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// 값(value)은 일반 import
import { Goals, Auth, ApiError } from '../api';

// 타입은 type-only import (verbatimModuleSyntax=true 대응)
import type { GoalDetailDto, Page, SavingsLogDto } from '../api';

export default function GoalDetail() {
  const { id: idParam } = useParams();
  const goalId = Number(idParam);
  const nav = useNavigate();

  const [detail, setDetail] = useState<GoalDetailDto | null>(null);
  const [logs, setLogs] = useState<Page<SavingsLogDto> | null>(null);
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(goalId)) {
      setErr('잘못된 목표 ID 입니다.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const me = await Auth.me();
      if (!me.authenticated) {
        nav('/login');
        return;
      }

      const [d, pl] = await Promise.all([
        Goals.detail(goalId),
        Goals.logs(goalId, page, size),
      ]);
      setDetail(d);
      setLogs(pl);
      setErr(null);
    } catch (e: unknown) {
      const msg = e instanceof ApiError ? e.message : '네트워크 오류';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }, [goalId, page, size, nav]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <div>Loading…</div>;
  if (err) return <div role="alert">{err}</div>;
  if (!detail) return <div>데이터 없음</div>;

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>{detail.title}</h1>
      <p>
        {detail.currentAmount} / {detail.targetAmount}원 ({detail.progress}%)
      </p>

      <h2>저축 로그</h2>
      {logs && logs.content.length > 0 ? (
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {logs.content.map((l: SavingsLogDto) => (
              <li key={l.id} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <div>
                  <strong>+{l.amount.toLocaleString()}원</strong>{' '}
                  <span style={{ color: '#666' }}>{l.memo ?? ''}</span>
                </div>
                <div style={{ fontSize: 12, color: '#999' }}>{l.createdAt}</div>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              이전
            </button>
            <button
              disabled={logs.last}
              onClick={() => setPage((p) => p + 1)}
            >
              다음
            </button>
            <span style={{ marginLeft: 8 }}>
              {logs.number + 1} / {logs.totalPages || 1}
            </span>
          </div>
        </>
      ) : (
        <p>로그가 없습니다.</p>
      )}
    </main>
  );
}
