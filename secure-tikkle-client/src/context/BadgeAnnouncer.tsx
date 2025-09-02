import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Badges } from '../api';
import type { BadgeDto } from '../api';
import { partyBurst } from '../lib/confetti';
import modalCss from '../components/BadgeModal.module.css';

type Ctx = { triggerScan: () => Promise<void> };
const BadgeAnnouncerContext = createContext<Ctx>({ triggerScan: async () => {} });

const SEEN_KEY = 'seenBadges';
const INIT_KEY = 'seenBadgesInitialized';

function useQueue<T>() {
  const [q, setQ] = useState<T[]>([]);
  const push = (items: T | T[]) => setQ((old) => [...old, ...(Array.isArray(items) ? items : [items])]);
  const shift = () => {
    let first: T | undefined;
    setQ((old) => {
      const [f, ...rest] = old;
      first = f;
      return rest;
    });
    return first;
  };
  return { q, push, shift, setQ };
}

export function BadgeAnnouncerProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<BadgeDto | null>(null);
  const [open, setOpen] = useState(false);
  const { q, push, shift } = useQueue<BadgeDto>();
  const confettiOnce = useRef(false);

  // 최초 1회: 이미 획득한 배지는 "본 것으로" 마킹(과거 배지로 팝업 도배 방지)
  useEffect(() => {
    (async () => {
      if (localStorage.getItem(INIT_KEY)) return;
      const list = await Badges.list();
      const initial: Record<string, string> = {};
      list.forEach((b) => {
        if (b.earned && b.earnedAt) initial[b.code] = b.earnedAt;
      });
      localStorage.setItem(SEEN_KEY, JSON.stringify(initial));
      localStorage.setItem(INIT_KEY, '1');
    })();
  }, []);

  // 큐에 뭔가 들어오면 하나씩 모달로 보여줌
  useEffect(() => {
    if (!open && !current && q.length > 0) {
      const next = shift();
      if (next) {
        setCurrent(next);
        confettiOnce.current = false;
        setOpen(true);
      }
    }
  }, [q, open, current, shift]);

  // 모달 열릴 때, 획득건이면 한 번만 콘페티
  useEffect(() => {
    if (open && current?.earned && !confettiOnce.current) {
      confettiOnce.current = true;
      void partyBurst();
    }
  }, [open, current]);

  const close = () => {
    setOpen(false);
    setCurrent(null);
  };

  const scan = useCallback(async () => {
    const list = await Badges.list();
    const seen: Record<string, string> = (() => {
      try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}'); } catch { return {}; }
    })();

    const newly = list.filter(
      (b) => b.earned && b.earnedAt && seen[b.code] !== b.earnedAt
    );

    if (newly.length) {
      const nextSeen = { ...seen };
      newly.forEach((b) => { if (b.earnedAt) nextSeen[b.code] = b.earnedAt; });
      localStorage.setItem(SEEN_KEY, JSON.stringify(nextSeen));
      push(newly);
    }
  }, [push]);

  const value = useMemo<Ctx>(() => ({ triggerScan: scan }), [scan]);

  return (
    <BadgeAnnouncerContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {open && current && (
          <Modal onClose={close}>
            <BadgeCard badge={current} onClose={close} />
          </Modal>
        )}
      </AnimatePresence>
    </BadgeAnnouncerContext.Provider>
  );
}

/* 공통 모달 UI (기존 Badges.tsx의 Modal/BadgeCard와 동일한 스타일) */
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [onClose]);

  return (
    <motion.div
      className={modalCss.backdrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={modalCss.card}
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function BadgeCard({ badge, onClose }: { badge: BadgeDto; onClose: () => void }) {
  return (
    <div className={modalCss.inner}>
      <div className={modalCss.iconRing}>
        <img src={badge.icon} alt="" className={modalCss.iconLarge} />
      </div>
      <h2 className={modalCss.title}>
        {badge.title}
        {badge.earned && <span className={modalCss.pill}>획득!</span>}
      </h2>
      <p className={modalCss.desc}>{badge.description}</p>
      {badge.earnedAt && (
        <div className={modalCss.meta}>획득일: {new Date(badge.earnedAt).toLocaleString()}</div>
      )}
      <div className={modalCss.actions}>
        <button className={modalCss.closeBtn} onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}
