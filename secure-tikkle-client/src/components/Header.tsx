import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Auth } from '../api';
import styles from './Header.module.css';

export default function Header() {
  const [name, setName] = useState<string | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      const me = await Auth.me();
      setName(me.authenticated ? me.attributes?.name ?? null : null);
    })();
  }, []);

  const onLogout = async () => {
    try {
      await Auth.logout();           // 서버 세션 무효화
    } catch {
      // 실패해도 아래로 진행(어차피 세션이 없으면 /api/me가 false를 반환)
    } finally {
      nav('/login', { replace: true }); // 로그인 화면으로
      // 또는 window.location.href = '/login';
    }
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.brand}>티끌</Link>
        <Link to="/goals/new">새 목표</Link>
        <Link to="/badges">배지</Link>
        <span className="nav-right">
          {name ? (
            <>
              <b>{name} 님</b>
              <button onClick={onLogout} style={{ marginLeft: 8 }}>로그아웃</button>
            </>
          ) : (
            '로그인 필요'
          )}
        </span>
      </nav>
    </header>
  );
}
