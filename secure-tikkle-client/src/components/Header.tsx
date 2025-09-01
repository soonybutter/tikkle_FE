import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Auth } from '../api';

export default function Header() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const me = await Auth.me();
      setName(me.authenticated ? me.attributes?.name ?? null : null);
    })();
  }, []);

  return (
    <header style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
      <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Link to="/">티끌</Link>
        <Link to="/goals/new">새 목표</Link> 
        <span style={{ marginLeft: 'auto', color: '#666' }}>
          {name ? `${name} 님` : '로그인 필요'}
        </span>
      </nav>
    </header>
  );
}
