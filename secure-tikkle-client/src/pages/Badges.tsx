import { useEffect, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Badges } from '../api';
import type { BadgeDto } from '../api';
import { partyBurst } from '../lib/confetti';
import gridCss from './Badges.module.css';
import modalCss from '../components/BadgeModal.module.css';

export default function BadgesPage() {
  const [items, setItems] = useState<BadgeDto[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<BadgeDto | null>(null);
  const firedOnceRef = useRef(false);

  const load = useCallback(async () => {
    const list = await Badges.list();
    setItems(list);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const onOpen = (b: BadgeDto) => {
    setSelected(b);
    setOpen(true);
    firedOnceRef.current = false; // 새로 열 때마다 초기화
  };

  // 열렸고, 획득 배지면 빵빠래
  useEffect(() => {
    if (open && selected?.earned && !firedOnceRef.current) {
      firedOnceRef.current = true;
      void partyBurst();
    }
  }, [open, selected]);

  const onClose = () => {
    setOpen(false);
    setTimeout(() => setSelected(null), 200); // exit 애니메이션 후 정리
  };

  return (
    <main className={gridCss.main}>
      <h1 className={gridCss.h1}>나의 배지</h1>

      <ul className={gridCss.grid}>
        {items.map(b => (
          <li
            key={b.code}
            className={`${gridCss.tile} ${b.earned ? gridCss.earned : gridCss.locked}`}
            onClick={() => onOpen(b)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') onOpen(b); }}
          >
            <div className={gridCss.iconWrap}>
              <img src={b.icon} alt="" className={gridCss.icon} />
            </div>
            <div className={gridCss.title}>{b.title}</div>
            <div className={gridCss.sub}>{b.earned ? '획득 완료' : '잠김'}</div>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {open && selected && (
          <Modal onClose={onClose}>
            <BadgeCard badge={selected} onClose={onClose} />
          </Modal>
        )}
      </AnimatePresence>
    </main>
  );
}

/** 공통 모달 래퍼 (백드롭 + 가운데 카드) */
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

/** 배지 상세 카드 */
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
