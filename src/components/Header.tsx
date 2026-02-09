import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Auth } from '../api';
import styles from "./Header.module.css";

export default function Header() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [name, setName] = useState<string | null>(null);
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const me = await Auth.me();
        const ok = !!me?.authenticated;
        setAuthed(ok);
        setName(ok ? (me.attributes?.name ?? null) : null);
      } catch {
        setAuthed(false);
        setName(null);
      }
    })();
  }, [loc.pathname]);

  const onLogout = async () => {
    try { await Auth.logout(); } catch {
      // Ignore logout errors
    }
    finally { nav('/login', { replace: true }); }
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        {/* 왼쪽 브랜드 */}
        <div className={styles.brand}>
          <Link to="/">Tikkle</Link>
        </div>

        {/* ✅ 로그인 전에는 nav 링크 전부 숨김 */}
        {authed ? (
          <div className={styles.navRight}>
            <Link to="/">홈</Link>
            <Link to="/records">내 티끌</Link>
            <Link to="/goals/new">새 목표</Link>
            <Link to="/badges">배지</Link>
            <Link to="/friends">랭킹</Link>
          </div>
        ) : (
          // 레이아웃 흔들림 싫으면 비워둔 컨테이너 유지
          <div className={styles.navRight} hidden aria-hidden="true" />
        )}

        {/* 우측 로그인/로그아웃 영역 */}
        <div className={styles.navLoginInfo}>
          {authed ? (
            <>
              {name && <b className={styles.user}>{name} 님</b>}
              <button onClick={onLogout} className={styles.cta}>로그아웃</button>
            </>
          ) : (
            <Link to="/login" className={styles.cta}>로그인</Link>
          )}
        </div>
      </nav>
    </header>
  );
}