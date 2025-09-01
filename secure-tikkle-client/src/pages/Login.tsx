import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '../api';

export default function Login() {
  const nav = useNavigate();
  const API = (import.meta.env.VITE_API_URL as string) || '';

  useEffect(() => {
    // 이미 로그인된 경우 대시보드로
    (async () => {
      const me = await Auth.me();
      if (me.authenticated) nav('/');
    })();
  }, [nav]);

  return (
    <main style={{ maxWidth: 640, margin: '3rem auto', padding: '0 1rem' }}>
      <h1>로그인</h1>
      <p>소셜 계정으로 로그인하세요.</p>
      <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <a href={`${API}/oauth2/authorization/kakao`}>
          <button style={{ width: '100%', padding: 12 }}>카카오로 로그인</button>
        </a>
        <a href={`${API}/oauth2/authorization/naver`}>
          <button style={{ width: '100%', padding: 12 }}>네이버로 로그인</button>
        </a>
        <a href={`${API}/oauth2/authorization/google`}>
          <button style={{ width: '100%', padding: 12 }}>구글로 로그인</button>
        </a>
      </div>
    </main>
  );
}
