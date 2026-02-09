import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '../api';
import styles from './Login.module.css';
import AuthButtons from '../components/AuthButtons';

export default function Login() {
  const nav = useNavigate();

    useEffect(() => {
    (async () => {
      const me = await Auth.me();
      if (me?.authenticated) nav('/', { replace: true }); // ✅ '/app' → '/'
    })();
  }, [nav]);

  return (
    <main className={styles.main}>
      <section className={styles.card}>
        <h1 className={styles.title}>로그인</h1>
        <p className={styles.subtitle}>소셜 계정으로 로그인하세요.</p>
        <AuthButtons />
      </section>
    </main>
  );
}