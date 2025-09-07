import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Goals, ApiError } from '../api';
import type { GoalSummaryDto } from '../api';
import Progress from '../components/Progress';
import styles from './Dashboard.module.css';

type FieldError = { msg: string; field?: string };
type ErrorPayload = { errors: FieldError[] };

function CreateGoalForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isErrorPayload = (v: unknown): v is ErrorPayload => {
    if (!v || typeof v !== 'object') return false;
    const errors = (v as { errors?: unknown }).errors;
    if (!Array.isArray(errors)) return false;
    return errors.every(
      (e): e is FieldError =>
        !!e && typeof e === 'object' && 'msg' in e && typeof (e as { msg: unknown }).msg === 'string'
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
      onCreated();
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
    <form className={styles.form} onSubmit={submit}>
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
      {err && <span className={styles.error}>{err}</span>}
    </form>
  );
}

export default function Dashboard() {
  const nav = useNavigate();
  const [items, setItems] = useState<GoalSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      
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
    <main className="container page">
      <h1>내 목표</h1>
      <CreateGoalForm onCreated={load} />
      <p className={styles.createLink}>
        <Link to="/goals/new">+ 새 목표 만들기</Link>
      </p>

      <ul className={styles.list}>
        {items.map((g) => (
          <li key={g.id} className={styles.item}>
            <div className={styles.row}>
              <Link to={`/goals/${g.id}`} className={styles.title}>
                {g.title}
              </Link>
              <span>
                {g.currentAmount.toLocaleString()} / {g.targetAmount.toLocaleString()}원
              </span>
            </div>
            <div className={styles.meta}>진행률 {g.progress}%</div>
            <Progress value={g.progress} />
          </li>
        ))}
      </ul>
    </main>
  );
}
