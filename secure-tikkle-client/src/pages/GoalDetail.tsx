import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Goals, Savings, Auth, ApiError } from '../api';
import type { GoalDetailDto, SavingsLogDto, Page } from '../api';

type FieldError = { msg: string; field?: string };
type ErrorPayload = { ok?: boolean; errors: FieldError[] };

// 백엔드 에러 페이로드 타입가드 (any 금지)
const isErrorPayload = (v: unknown): v is ErrorPayload => {
  if (!v || typeof v !== 'object') return false;
  const errors = (v as { errors?: unknown }).errors;
  return Array.isArray(errors) && errors.every(
    (e): e is FieldError =>
      !!e &&
      typeof e === 'object' &&
      'msg' in e &&
      typeof (e as { msg: unknown }).msg === 'string'
  );
};

export default function GoalDetail() {
  const { id } = useParams();
  const goalId = Number(id);

  const [detail, setDetail] = useState<GoalDetailDto | null>(null);
  const [logs, setLogs] = useState<Page<SavingsLogDto> | null>(null);

  const [amount, setAmount] = useState<number | ''>('');
  const [memo, setMemo] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const me = await Auth.me();
    if (!me.authenticated) throw new Error('not-auth');

    const [d, page] = await Promise.all([
      Goals.detail(goalId),
      Goals.logs(goalId, 0, 10),
    ]);
    setDetail(d);
    setLogs(page);
  }, [goalId]);

  useEffect(() => { void load(); }, [load]);

  const onSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (amount === '' || Number.isNaN(Number(amount))) return;

    setBusy(true);
    setErr(null);
    try {
      await Savings.create({ goalId, amount: Number(amount), memo });
      setAmount('');
      setMemo('');
      await load();
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        const data = (e as unknown as { status: number; data?: unknown }).data;
        if (isErrorPayload(data)) {
          setErr(data.errors.map((x) => x.msg).join(', '));
        } else {
          setErr(`요청 실패 (HTTP ${e.status ?? '??'})`);
        }
      } else {
        setErr('저축 기록 실패');
      }
    } finally {
      setBusy(false);
    }
  };

  if (!detail) return <div>Loading…</div>;

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <Link to="/">&larr; 목록</Link>
      <h1>{detail.title}</h1>

      <div style={{ margin: '8px 0' }}>
        {detail.currentAmount.toLocaleString()} / {detail.targetAmount.toLocaleString()}원
      </div>
      <div style={{ color: '#666', marginBottom: 8 }}>진행률 {detail.progress}%</div>

      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <input
          type="number"
          placeholder="금액"
          min={1}
          value={amount}
          onChange={(ev) => setAmount(ev.target.value === '' ? '' : Number(ev.target.value))}
          required
        />
        <input
          placeholder="메모 (선택)"
          value={memo}
          onChange={(ev) => setMemo(ev.target.value)}
        />
        <button disabled={busy}>저축 기록</button>
      </form>
      {err && <div style={{ color: 'crimson' }}>{err}</div>}

      <h2>저축 로그</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {logs?.content.map((l) => (
          <li key={l.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <div>{l.amount.toLocaleString()}원 — {l.memo ?? ''}</div>
            <small>{new Date(l.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </main>
  );
}
