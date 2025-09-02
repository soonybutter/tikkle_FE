import { useEffect, useState } from 'react';
import { Badges } from '../api';
import type { BadgeDto } from '../api';
import './badges.css';

export default function BadgesPage(){
  const [items, setItems] = useState<BadgeDto[]>([]);
  useEffect(() => { void (async ()=> setItems(await Badges.list()))(); }, []);
  return (
    <main className="wrap">
      <h1 className="h1">내 배지</h1>
      <ul className="badge-grid">
        {items.map(b => (
          <li key={b.code} className={`badge-card ${b.earned ? 'is-earned': 'is-locked'}`}>
            <div className="badge-icon" aria-hidden>{b.icon}</div>
            <div className="badge-title">{b.title}</div>
            <div className="badge-desc">{b.description}</div>
            {!b.earned && <div className="badge-lock">🔒 잠금</div>}
            {b.earned && b.earnedAt && <div className="badge-time">
              획득: {new Date(b.earnedAt).toLocaleDateString()}
            </div>}
          </li>
        ))}
      </ul>
    </main>
  );
}
