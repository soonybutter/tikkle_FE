import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Auth } from '../api';
import styles from "./Header.module.css";

export default function Header() {
  const [name, setName] = useState<string | null>(null);
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    (async () => {
      const me = await Auth.me();
      setName(me.authenticated ? me.attributes?.name ?? null : null);
    })();
  }, [loc.pathname]);

  const onLogout = async () => {
    try {
      await Auth.logout();
    } catch (err) {
      console.warn('Logout failed (ignoring):', err);
    } finally {
      nav('/login', { replace: true });
    }
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        {/*  왼쪽 브랜드  */}
        <div className={styles.brand}>
          <Link to="/">Tikkle </Link>
        </div>

        {/*  오른쪽 링크/버튼 묶음 */}
        <div className={styles.navRight}>
          <Link to="/">홈</Link>
          <Link to="/goals">나의 티끌 기록</Link>
          <Link to="/goals/new">새 목표</Link>
          <Link to="/badges">배지현황</Link>
          <Link to="/friends">랭킹</Link>
        </div>
        <div className={styles.navLoginInfo}>
          {name ? (
            <>
              <b className={styles.user}>{name} 님</b>
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
