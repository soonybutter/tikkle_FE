import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {Auth} from '../api';

type Me = { authenticated: boolean; attributes?: { name?: string }};

export default function Header() {
  const [me, setMe] = useState<Me>({ authenticated: false });
  const nav = useNavigate();
  const API = (import.meta.env.VITE_API_URL as string) || '';
  const { pathname } = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const m = await Auth.me();
        setMe(m);
      } catch {
        // 무시
      }
    })();
  }, [pathname]); // 라우트 바뀔 때 갱신

  const logout = async () => {
    try {
      await fetch(`${API}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      nav('/login', { replace: true });
    }
  };

  // 로그인 페이지에서는 헤더 감춤(원하면 유지해도 OK)
  if (pathname === '/login') return null;

  return (
    <header style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 16px', borderBottom: '1px solid #eee'
    }}>
      <Link to="/" style={{ textDecoration: 'none', fontWeight: 700 }}>tikkle</Link>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {me.authenticated && (
          <>
            <span style={{ color: '#555' }}>{me.attributes?.name ?? '사용자'}</span>
            <button onClick={logout}>로그아웃</button>
          </>
        )}
      </div>
    </header>
  );
}