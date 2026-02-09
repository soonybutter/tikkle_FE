import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Goals, ApiError } from '../api';
import styles from './GoalNew.module.css';

type FieldError = { msg: string; field?: string };
type ErrorPayload = { ok?: boolean; errors: FieldError[] };

function toErrorPayload(v: unknown): ErrorPayload | null {
  if (!v || typeof v !== 'object') return null;
  const errors = (v as { errors?: unknown }).errors;
  if (!Array.isArray(errors)) return null;
  if (!errors.every((e) => !!e && typeof e === 'object' && 'msg' in e && typeof (e as { msg: unknown }).msg === 'string')) {
    return null;
  }
  return { errors: errors as FieldError[] };
}

export default function GoalNew() {
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const prettyAmount =
    targetAmount === '' ? '' : Number(targetAmount).toLocaleString('ko-KR');

  const submit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await Goals.create({ title, targetAmount: Number(targetAmount) });
      nav('/');
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

  const invalid =
    busy ||
    title.trim() === '' ||
    targetAmount === '' ||
    Number(targetAmount) <= 0;

  return (
    <main className={`${styles.main} container`}>
      <section className={styles.card}>
        <div className={styles.hero}>
          <div className={styles.ring}><span className={styles.emoji} aria-hidden>🐣</span></div>
          <h1 className={styles.title}>새 목표 만들기</h1>
          <p className={styles.subtitle}>
            작은 티끌이 큰 버킷리스트를 완성해요. 목표를 정하고,
            <br />조금씩 모으면 어느새 도착해 있을 거예요 ✨
          </p>
        </div>

        <form className={styles.form} onSubmit={submit}>
          <label className={styles.label}>
            <span className={styles.labelText}>목표 이름</span>
            <input
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예) 오키나와 여행, 비상금 만들기"
              required
            />
            <small className={styles.help}>나중에 언제든지 변경할 수 있어요.</small>
          </label>

          <label className={styles.label}>
            <span className={styles.labelText}>목표 금액</span>
            <input
              className={styles.input}
              type="number"
              min={1}
              value={targetAmount}
              onChange={(e) =>
                setTargetAmount(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="예) 1000000"
              required
            />
            <div className={styles.inlineMeta}>
              {prettyAmount && <span>미리보기: <b>{prettyAmount}원</b></span>}
              <span className={styles.tipDot}>·</span>
              <span className={styles.muted}>조금 넉넉하게 잡으면 동기부여에 좋아요.</span>
            </div>
          </label>

          {err && <div role="alert" className={styles.error}>{err}</div>}

          <button className={`${styles.submit} ${styles.submitBerry}`} disabled={invalid}>
            {busy ? '만드는 중…' : '목표 만들기'}
          </button>

          <div className={styles.footNote}>
            <span>작은 절약 팁: 구독 점검, 배달 대신 포장, 커피 한 잔 아끼기 💰</span>
          </div>
        </form>

        <div className={styles.footerLinks}>
          <Link to="/" className={styles.linkBtn}>홈으로</Link>
          <Link to="/records" className={styles.linkBtn}>나의 티끌기록 보기</Link>
        </div>
      </section>
    </main>
  );
}