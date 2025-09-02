import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Auth } from '../api';
import styles from './Header.module.css';

export default function Header() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const me = await Auth.me();
      setName(me.authenticated ? me.attributes?.name ?? null : null);
    })();
  }, []);

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.brand}>티끌</Link>
        <Link to="/goals/new">새 목표</Link>
        <span className={styles.spacer}>{name ? `${name} 님` : '로그인 필요'}</span>
      </nav>
    </header>
  );
}
