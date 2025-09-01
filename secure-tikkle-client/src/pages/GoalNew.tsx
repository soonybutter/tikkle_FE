import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Goals, ApiError } from '../api';

type FieldError = { msg: string; field?: string };
type ErrorPayload = { ok?: boolean; errors: FieldError[] };

function toErrorPayload(v: unknown): ErrorPayload | null {
  if (!v || typeof v !== 'object') return null;
  const errors = (v as { errors?: unknown }).errors;
  if (!Array.isArray(errors)) return null;
  if (
    !errors.every(
      (e) => !!e && typeof e === 'object' && 'msg' in e && typeof (e as { msg: unknown }).msg === 'string'
    )
  ) return null;
  return { errors: errors as FieldError[] };
}

export default function GoalNew() {
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await Goals.create({ title, targetAmount: Number(targetAmount) });
      nav('/'); // 생성 후 대시보드로 이동
    } catch (e) {
      if (e instanceof ApiError) {
        const data = (e as { status: number; data?: unknown }).data;
        const ep = toErrorPayload(data);
        setErr(ep ? ep.errors.map(x => x.msg).join(', ') : `요청 실패 (HTTP ${e.status ?? '??'})`);
      } else {
        setErr('생성 실패');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>새 목표 만들기</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>목표 이름</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예) 오키나와 여행"
            required
          />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>목표 금액</span>
          <input
            type="number"
            min={1}
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="예) 1000000"
            required
          />
        </label>
        <button
          disabled={
            busy || title.trim() === '' || targetAmount === '' || Number(targetAmount) <= 0
          }
        >
          {busy ? '만드는 중…' : '만들기'}
        </button>
        {err && <div role="alert" style={{ color: 'crimson' }}>{err}</div>}
      </form>
    </main>
  );
}
