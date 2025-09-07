import { useEffect, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Badges } from '../api';
import type { BadgeDto } from '../api';
import { partyBurst } from '../lib/confetti';
import gridCss from './Badges.module.css';
import modalCss from '../components/BadgeModal.module.css';

/** 배지 코드 → 이모지 매핑 (원하는 대로 추가/수정) */
const badgeEmojiByCode: Record<string, string> = {
  FIRST_SAVE: '💎',
  FIRST_GOAL: '🎯',
  NO_SPEND_DAY: '🚫',
  TEN_DEPOSITS: '🔟',
  COFFEE_SKIP: '☕',
  BUS_OR_SUBWAY: '🚇',
  STREAK_7: '🔥',
  GOAL_COMPLETE: '🏁',
};
const getBadgeEmoji = (code: string) => badgeEmojiByCode[code] ?? '🏅';


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
    firedOnceRef.current = false;
  };

  useEffect(() => {
    if (open && selected?.earned && !firedOnceRef.current) {
      firedOnceRef.current = true;
      void partyBurst();
    }
  }, [open, selected]);

  const onClose = () => {
    setOpen(false);
    setTimeout(() => setSelected(null), 200);
  };

  return (
    <main className={gridCss.main}>
      <h1 className={gridCss.h1}>나의 배지</h1>

      <ul className={gridCss.grid}>
        {items.map(b => (
          <li
            key={b.code}
            className={`${gridCss.tile} ${b.earned ? gridCss.earned : gridCss.locked}`}
            aria-label={`${b.title} ${b.earned ? '획득' : '잠김'}`}
            {...(b.earned
              ? {
                  onClick: () => onOpen(b),
                  role: 'button' as const,
                  tabIndex: 0 as const,
                  onKeyDown: (e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') onOpen(b);
                  },
                }
              : {
                  'aria-disabled': true as const,
                  tabIndex: -1 as const,
                })}
          >
            <div className={gridCss.iconWrap}>
              <img
                src="/badge/cuteStar.png"
                alt=""
                className={`${gridCss.iconStar} ${b.earned ? '' : gridCss.iconGray}`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/badge/cuteStar.png';
                }}
              />
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

/** 상세 카드도 이모지로 교체 */
function BadgeCard({ badge, onClose }: { badge: BadgeDto; onClose: () => void }) {
  const isEarned = !!badge.earned;

  return (
    <div className={modalCss.inner}>
      <div className={modalCss.iconRing}>
        <span className={modalCss.emojiLarge} role="img" aria-label={badge.title}>
        {getBadgeEmoji(badge.code)}
      </span>
      </div>
      <h2 className={modalCss.title}>
        {badge.title}
        {isEarned && <span className={modalCss.pill}>획득!</span>}
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