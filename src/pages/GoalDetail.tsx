import { useBadgeAnnouncer } from '../hooks/useBadgeAnnouncer';
import { useCallback, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Goals, Savings, Auth, ApiError } from '../api';
import type { GoalDetailDto, SavingsLogDto, Page } from '../api';
import styles from './GoalDetail.module.css';

type FieldError = { msg: string; field?: string };
type ErrorPayload = { ok?: boolean; errors: FieldError[] };

const isErrorPayload = (v: unknown): v is ErrorPayload => {
  if (!v || typeof v !== 'object') return false;
  const errors = (v as { errors?: unknown }).errors;
  return Array.isArray(errors) && errors.every(
    (e): e is FieldError =>
      !!e && typeof e === 'object' && 'msg' in e && typeof (e as { msg: unknown }).msg === 'string'
  );
};

export default function GoalDetail() {
  const nav = useNavigate();
  const { id } = useParams();
  const goalId = Number(id);

  const [detail, setDetail] = useState<GoalDetailDto | null>(null);
  const [logs, setLogs] = useState<Page<SavingsLogDto> | null>(null);

  const [amount, setAmount] = useState<number | ''>('');
  const [memo, setMemo] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { triggerScan } = useBadgeAnnouncer();

  // 인라인 편집 상태
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<number | ''>('');
  const [editMemo, setEditMemo] = useState('');

  // 목표 수정 상태
  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editTarget, setEditTarget] = useState<number | ''>('');

  // ✅ load를 useEffect보다 위에 선언
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

  // ✅ load를 한 번만 호출하는 useEffect (중복 useEffect 제거!)
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
      await triggerScan();
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        const data = (e as { status: number; data?: unknown }).data;
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

  const openEdit = () => {
    if (!detail) return;
    setEditTitle(detail.title);
    setEditTarget(detail.targetAmount);
    setShowEdit(true);
  };
  const closeEdit = () => setShowEdit(false);

  const saveGoal = async () => {
    if (!detail) return;
    if (editTitle.trim() === '' || editTarget === '' || Number(editTarget) <= 0) {
      alert('이름과 목표금액을 확인해 주세요.');
      return;
    }
    try {
      setBusy(true);
      await Goals.update(goalId, { title: editTitle.trim(), targetAmount: Number(editTarget) });
      await load();
      setShowEdit(false);
    } catch {
      alert('목표 수정에 실패했어요.');
    } finally {
      setBusy(false);
    }
  };

  const onDeleteGoal = async () => {
    if (!detail) return;
    if (!confirm(`정말로 "${detail.title}" 목표를 삭제할까요? 기록도 함께 사라집니다.`)) return;
    try {
      setBusy(true);
      await Goals.remove(goalId);
      alert('삭제되었습니다.'); // ✅ 요청하신 alert 추가
      nav('/records', { replace: true }); // ✅ /records로 이동
    } catch {
      alert('삭제에 실패했어요.');
    } finally {
      setBusy(false);
    }
  };

  // 인라인 편집 진입
  const startEdit = (l: SavingsLogDto) => {
    setEditingId(l.id);
    setEditAmount(l.amount);
    setEditMemo(l.memo ?? '');
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditAmount('');
    setEditMemo('');
  };

  const saveEdit = async () => {
    if (editingId == null) return;
    if (editAmount === '' || Number.isNaN(Number(editAmount))) return;
    try {
      setBusy(true);
      await Savings.update({ goalId, id: editingId, amount: Number(editAmount), memo: editMemo });
      cancelEdit();
      await load();
    } catch {
      alert('수정에 실패했어요.');
    } finally {
      setBusy(false);
    }
  };

  const deleteLog = async (id: number) => {
    if (!confirm('이 저축 기록을 삭제할까요?')) return;
    try {
      setBusy(true);
      await Savings.remove(goalId, id);
      if (editingId === id) cancelEdit();
      await load();
    } catch {
      alert('삭제에 실패했어요.');
    } finally {
      setBusy(false);
    }
  };

  if (!detail) return <div>Loading…</div>;

  return (
    <main className={styles.main}>
      <div className={styles.headerRow}>
        <Link to="/records" className={styles.linkBack}>목록으로</Link>
        <button className={styles.btnGhost} onClick={openEdit} disabled={busy}>목표 수정</button>
        <button className={styles.btnDanger} onClick={onDeleteGoal} disabled={busy}>목표 삭제</button>
      </div>

      {showEdit && (
        <div className={styles.editCard}>
          <div className={styles.editRow2}>
            <label className={styles.editLabel}>
              <span>목표 이름</span>
              <input
                className={styles.input}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={40}
              />
            </label>
            <label className={styles.editLabel}>
              <span>목표 금액</span>
              <input
                className={styles.input}
                type="number"
                min={1}
                value={editTarget}
                onChange={(e) => setEditTarget(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </label>
          </div>
          <div className={styles.editActions}>
            <button className={styles.btnPrimary} onClick={saveGoal} disabled={busy}>저장</button>
            <button className={styles.btnGhost} onClick={closeEdit} disabled={busy}>취소</button>
          </div>
        </div>
      )}

      <h1 className={styles.title}>{detail.title}</h1>

      <div className={styles.amount}>
        {detail.currentAmount.toLocaleString()} / {detail.targetAmount.toLocaleString()}원
      </div>
      <div className={styles.progressWrap}>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${detail.progress}%` }} />
        </div>
        <div className={styles.progressText}>진행률 {detail.progress}%</div>
      </div>

      <form className={styles.form} onSubmit={onSubmit}>
        <input
          className={styles.input}
          type="number"
          placeholder="금액"
          min={1}
          value={amount}
          onChange={(ev) => setAmount(ev.target.value === '' ? '' : Number(ev.target.value))}
          required
        />
        <input
          className={styles.input}
          placeholder="메모 (선택)"
          value={memo}
          onChange={(ev) => setMemo(ev.target.value)}
        />
        <button className={styles.btnPrimary} disabled={busy}>저축 기록</button>
      </form>
      {err && <div className={styles.error}>{err}</div>}

      <h2 className={styles.h2}>저축 로그</h2>
      <ul className={styles.list}>
        {logs?.content.map((l) => {
          const isEditing = editingId === l.id;
          return (
            <li key={l.id} className={styles.item}>
              {!isEditing ? (
                <>
                  <div className={styles.logMain}>
                    <div className={styles.logSummary}>
                      <b>{l.amount.toLocaleString()}원</b>
                      {l.memo ? <span className={styles.logMemo}> — {l.memo}</span> : null}
                    </div>
                    <small className={styles.time}>
                      {new Date(l.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <div className={styles.logActions}>
                    <button className={styles.btnGhost} onClick={() => startEdit(l)} disabled={busy}>
                      수정
                    </button>
                    <button className={styles.btnGhostDanger} onClick={() => deleteLog(l.id)} disabled={busy}>
                      삭제
                    </button>
                  </div>
                </>
              ) : (
                <div className={styles.editRow}>
                  <input
                    className={styles.inputSm}
                    type="number"
                    min={1}
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                  <input
                    className={styles.inputSm}
                    value={editMemo}
                    onChange={(e) => setEditMemo(e.target.value)}
                    placeholder="메모(선택)"
                  />
                  <div className={styles.editActions}>
                    <button className={styles.btnPrimarySm} onClick={saveEdit} type="button" disabled={busy}>
                      저장
                    </button>
                    <button className={styles.btnGhostSm} onClick={cancelEdit} type="button" disabled={busy}>
                      취소
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}