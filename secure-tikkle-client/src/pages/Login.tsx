import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '../api';
import styles from './Login.module.css';

export default function Login() {
  const nav = useNavigate();
  const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    (async () => {
      const me = await Auth.me();
      if (me.authenticated) nav('/');
    })();
  }, [nav]);

  return (
    <main className={styles.main}>
      <h1>로그인</h1>
      <p>소셜 계정으로 로그인하세요.</p>
      <div className={styles.grid}>
        <a className={styles.btn} href={`${API}/oauth2/authorization/kakao`}>카카오로 로그인</a>
        <a className={styles.btn} href={`${API}/oauth2/authorization/naver`}>네이버로 로그인</a>
        <a className={styles.btn} href={`${API}/oauth2/authorization/google`}>구글로 로그인</a>
      </div>
    </main>
  );
}
