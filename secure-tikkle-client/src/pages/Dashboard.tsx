import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Goals, Auth, ApiError } from '../api';
import type { GoalSummaryDto } from '../api';
type FieldError = { msg: string; field?: string };
type ErrorPayload = { errors: FieldError[] };



/** 새 목표 생성 폼 */
function CreateGoalForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // 백엔드 에러 페이로드가 { ok:false, errors:[{msg,field}...] } 형태일 때 감지
  const isErrorPayload = (v: unknown): v is ErrorPayload => {
  if (!v || typeof v !== 'object') return false;
  const errors = (v as { errors?: unknown }).errors;
  if (!Array.isArray(errors)) return false;
  return errors.every(
    (e): e is FieldError =>
      !!e &&
      typeof e === 'object' &&
      'msg' in e &&
      typeof (e as { msg: unknown }).msg === 'string'
  );
};

  const submit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await Goals.create({ title, targetAmount: Number(targetAmount) });
      setTitle('');
      setTargetAmount('');
      onCreated(); // 목록 새로고침
    } catch (e: unknown) {
  if (e instanceof ApiError) {
    const data = (e as unknown as { status: number; data?: unknown }).data;
    if (isErrorPayload(data)) {
      setErr(data.errors.map((x: FieldError) => x.msg).join(', '));
    } else {
      setErr(`요청 실패 (HTTP ${e.status ?? '??'})`);
    }
  } else {
    setErr('생성 실패');
  }
} finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
      <input
        placeholder="목표 이름"
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
        required
      />
      <input
        type="number"
        placeholder="목표 금액"
        min={1}
        value={targetAmount}
        onChange={(ev) =>
          setTargetAmount(ev.target.value === '' ? '' : Number(ev.target.value))
        }
        required
      />
      <button disabled={busy}>만들기</button>
      {err && <span style={{ color: 'crimson' }}>{err}</span>}
    </form>
  );
}

/** 대시보드 */
export default function Dashboard() {
  const nav = useNavigate();
  const [items, setItems] = useState<GoalSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const me = await Auth.me();
      if (!me.authenticated) {
        nav('/login');
        return;
      }
      const list = await Goals.list();
      setItems(list);
      setErr(null);
    } catch {
      setErr('목록을 불러오지 못했습니다');
    } finally {
      setLoading(false);
    }
  }, [nav]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <div>Loading…</div>;
  if (err) return <div role="alert">{err}</div>;

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>내 목표</h1>

      {/* 새 목표 만들기 */}
      <CreateGoalForm onCreated={load} />
      <p style={{ margin: '12px 0' }}>
        <Link to="/goals/new">+ 새 목표 만들기</Link>
      </p>

      {/* 목록 */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((g) => (
          <li key={g.id} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Link to={`/goals/${g.id}`} style={{ fontWeight: 600 }}>
                {g.title}
              </Link>
              <span>
                {g.currentAmount.toLocaleString()} / {g.targetAmount.toLocaleString()}원
              </span>
            </div>
            <div style={{ color: '#666' }}>진행률 {g.progress}%</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
